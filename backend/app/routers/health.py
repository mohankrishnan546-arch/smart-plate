"""Health rule engine router — medical condition-based alerts."""
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import List, Optional
from sqlalchemy.orm import Session

from app.services.health_engine import evaluate_health_alerts, get_condition_rules, HEALTH_RULES

from app.models import User, MedicalProvider
from app.database import get_db
from app.routers.auth import get_current_user

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


class BookingRequest(BaseModel):
    provider_id: int
    appointment_date: Optional[str] = None


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


SEED_PROVIDERS = [
    MedicalProvider(name="Apollo Heart Institute", type="hospital", specialty="Cardiology",
        location="Chennai, TN", rating=4.8, description="State-of-the-art cardiac care facility.",
        contact="+91 44 2829 3333", associated_conditions=["hypertension", "heart_disease"]),
    MedicalProvider(name="Dr. Aruna's Diabetes Clinic", type="doctor", specialty="Diabetologist",
        location="Coimbatore, TN", rating=4.9, description="Leading expert in glycemic control.",
        contact="+91 422 231 6500", associated_conditions=["diabetes"]),
    MedicalProvider(name="Fortis Multi-Speciality", type="hospital", specialty="General Medicine",
        location="Bangalore", rating=4.6, description="Comprehensive metabolic and dietary counseling.",
        contact="+91 80 6621 4444", associated_conditions=["obesity", "anemia", "general_health"]),
    MedicalProvider(name="Dr. Rajesh Kumar", type="doctor", specialty="Nephrologist",
        location="Chennai, TN", rating=4.7, description="Expert in renal care and chronic kidney disease.",
        contact="+91 44 4567 8901", associated_conditions=["kidney_disease"]),
    MedicalProvider(name="AIIMS Dietetics Dept", type="hospital", specialty="Dietetics",
        location="New Delhi", rating=4.9, description="Expert dietary counseling for all conditions.",
        contact="+91 11 2658 8500", associated_conditions=["celiac", "anemia", "general_health"]),
    MedicalProvider(name="Dr. Priya Menon", type="doctor", specialty="Hematologist",
        location="Kochi, Kerala", rating=4.8, description="Specialist in blood disorders and anemia management.",
        contact="+91 484 285 1234", associated_conditions=["anemia"]),
]


@router.post("/book")
def book_provider(data: BookingRequest, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    """Create a new medical booking."""
    from app.models import MedicalBooking
    import datetime

    # Check if provider exists
    provider = db.query(MedicalProvider).filter(MedicalProvider.id == data.provider_id).first()
    if not provider:
        return {"error": "Provider not found"}, 404

    new_booking = MedicalBooking(
        user_id=user.id,
        provider_id=data.provider_id,
        appointment_date=datetime.datetime.now(), # Default to now for sample
        status="Confirmed"
    )
    db.add(new_booking)
    db.commit()
    db.refresh(new_booking)

    return {
        "message": "Booked Successfully",
        "booking_id": new_booking.id,
        "provider_name": provider.name,
        "status": new_booking.status
    }


@router.get("/recommendations")
def get_provider_recommendations(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    """Fetch medical provider recommendations based on user health conditions."""
    if not user:
        return []

    # Seed providers if table is empty
    if db.query(MedicalProvider).count() == 0:
        db.add_all(SEED_PROVIDERS)
        db.commit()

    conditions = [c.lower() for c in (user.health_conditions or [])]

    # If no conditions or only General Health — return top general providers
    if not conditions or conditions == ["general_health"]:
        providers = db.query(MedicalProvider).limit(4).all()
    else:
        # Match providers whose associated_conditions overlap with user conditions
        all_providers = db.query(MedicalProvider).all()
        matched = {}
        for p in all_providers:
            p_conditions = [c.lower() for c in (p.associated_conditions or [])]
            overlap = set(conditions) & set(p_conditions)
            if overlap:
                matched[p.id] = (p, len(overlap))
        # Sort by overlap count desc
        providers = [p for p, _ in sorted(matched.values(), key=lambda x: -x[1])][:4]

    return [
        {
            "id": p.id,
            "name": p.name,
            "type": p.type,
            "specialty": p.specialty,
            "location": p.location,
            "contact": p.contact or "N/A",
            "rating": p.rating,
            "reason": f"Recommended based on your health profile. Specializes in {p.specialty}.",
            "urgency": "Routine"
        }
        for p in providers
    ]
