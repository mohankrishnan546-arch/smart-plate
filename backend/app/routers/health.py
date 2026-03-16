"""Health rule engine router — medical condition-based alerts."""
from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional
from app.services.health_engine import evaluate_health_alerts, get_condition_rules, HEALTH_RULES
from app.services.hmis_engine import get_care_recommendations
from app.models import User, MedicalProvider
from sqlalchemy.orm import Session
from app.database import get_db
from fastapi import Depends

router = APIRouter()


class HealthCheckRequest(BaseModel):
    calories: float = 0
    protein_g: float = 0
    carbs_g: float = 0
    fat_g: float = 0
    sodium_mg: float = 0
    sugar_g: float = 0
    cholesterol_mg: float = 0
    fiber_g: float = 0
    conditions: Optional[List[str]] = []


@router.post("/check")
def check_health(data: HealthCheckRequest):
    """Evaluate a nutrition profile against health rules."""
    nutrition = {
        "calories": data.calories,
        "protein_g": data.protein_g,
        "carbs_g": data.carbs_g,
        "fat_g": data.fat_g,
        "sodium_mg": data.sodium_mg,
        "sugar_g": data.sugar_g,
        "cholesterol_mg": data.cholesterol_mg,
        "fiber_g": data.fiber_g,
    }
    general_alerts = evaluate_health_alerts(nutrition)
    condition_alerts = []
    for condition in (data.conditions or []):
        condition_alerts.extend(get_condition_rules(condition, nutrition))

    return {
        "general_alerts": general_alerts,
        "condition_alerts": condition_alerts,
        "risk_score": min(len(general_alerts) + len(condition_alerts), 10),
    }


@router.get("/rules")
def list_health_rules():
    """List all available health evaluation rules."""
    return HEALTH_RULES


@router.get("/conditions")
def list_supported_conditions():
    """List all medical conditions the engine can evaluate."""
    return [
        {"id": "diabetes", "label": "Diabetes", "icon": "🩸"},
        {"id": "hypertension", "label": "Hypertension", "icon": "❤️‍🩹"},
        {"id": "heart_disease", "label": "Heart Disease", "icon": "🫀"},
        {"id": "kidney_disease", "label": "Kidney Disease", "icon": "🫘"},
        {"id": "obesity", "label": "Obesity", "icon": "⚖️"},
        {"id": "celiac", "label": "Celiac Disease", "icon": "🌾"},
        {"id": "anemia", "label": "Anemia", "icon": "🩸"},
    ]


@router.get("/recommendations")
def get_provider_recommendations(db: Session = Depends(get_db)):
    """Fetch AI-driven doctor and hospital recommendations based on user health."""
    user = db.query(User).first() # In production, use get_current_user
    if not user:
        return []
    
    # 1. Ensure we have some seed data for providers if table is empty
    if db.query(MedicalProvider).count() == 0:
        seed_providers = [
            MedicalProvider(
                name="Apollo Heart Institute",
                type="hospital",
                specialty="Cardiology",
                location="Chennai, TN",
                associated_conditions=["hypertension", "heart_disease"],
                description="State-of-the-art cardiac care facility with top-tier specialists.",
                rating=4.8
            ),
            MedicalProvider(
                name="Dr. Aruna's Diabetes Clinic",
                type="doctor",
                specialty="Diabetologist",
                location="Coimbatore, TN",
                associated_conditions=["diabetes"],
                description="Leading expert in glycemic control and insulin management.",
                rating=4.9
            ),
            MedicalProvider(
                name="Fortis Multi-Speciality",
                type="hospital",
                specialty="General Medicine",
                location="Bangalore",
                associated_conditions=["obesity", "anemia"],
                description="Comprehensive metabolic and dietary counseling services.",
                rating=4.6
            ),
            MedicalProvider(
                name="Dr. Rajesh Kumar",
                type="doctor",
                specialty="Nephrologist",
                location="Chennai, TN",
                associated_conditions=["kidney_disease"],
                description="Expert in renal care and chronic kidney disease management.",
                rating=4.7
            )
        ]
        db.add_all(seed_providers)
        db.commit()

    # 2. Get recommendations
    user_profile = {
        "full_name": user.full_name,
        "age": user.age,
        "health_conditions": user.health_conditions or []
    }
    
    recommendations = get_care_recommendations(user_profile, db)
    
    # 3. Enrich with provider details
    result = []
    for rec in recommendations:
        provider = db.query(MedicalProvider).filter(MedicalProvider.id == rec["provider_id"]).first()
        if provider:
            result.append({
                "id": provider.id,
                "name": provider.name,
                "type": provider.type,
                "specialty": provider.specialty,
                "location": provider.location,
                "rating": provider.rating,
                "reason": rec["reason"],
                "urgency": rec["urgency"]
            })
            
    return result
