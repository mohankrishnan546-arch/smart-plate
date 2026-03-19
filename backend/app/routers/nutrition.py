"""Nutrition data router — search USDA / ICMR food database."""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import FoodItem
from app.services.nutrition_lookup import get_nutrition, USDA_NUTRITION_DB

router = APIRouter()


@router.get("/search")
def search_food(q: str = Query(..., min_length=2), db: Session = Depends(get_db)):
    """Search food items by name (DB first, fallback to in-memory USDA data)."""
    # Try database first
    results = db.query(FoodItem).filter(FoodItem.name.ilike(f"%{q}%")).limit(20).all()
    if results:
        return [
            {
                "id": r.id,
                "name": r.name,
                "category": r.category,
                "source": r.source,
                "calories": r.calories,
                "protein_g": r.protein_g,
                "carbs_g": r.carbs_g,
                "fat_g": r.fat_g,
                "serving_size": r.serving_size,
            }
            for r in results
        ]

    # Fallback to in-memory data
    from app.services.nutrition_lookup import ALL_NUTRITION
    q_lower = q.lower()
    matches = []
    for name, data in ALL_NUTRITION.items():
        if q_lower in name.lower().replace("_", " "):
            matches.append({"name": name, "source": "local", **data})
    return matches[:20]


@router.get("/food/{food_name}")
def get_food_nutrition(food_name: str):
    """Get detailed nutrition for a specific food."""
    nutrition = get_nutrition(food_name)
    return {"food_name": food_name, "nutrition": nutrition}


@router.get("/daily-targets")
def get_daily_targets():
    """Recommended daily nutrition targets."""
    return {
        "calories": 2000,
        "protein_g": 50,
        "carbs_g": 300,
        "fat_g": 65,
        "fiber_g": 25,
        "sugar_g": 50,
        "sodium_mg": 2300,
        "cholesterol_mg": 300,
        "vitamin_c_mg": 90,
        "calcium_mg": 1000,
        "iron_mg": 18,
    }
