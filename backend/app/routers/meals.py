"""Meal logging router — CRUD for meal entries."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from app.database import get_db
from app.models import MealLog, User
from app.routers.auth import get_current_user
from app.schemas import MealLogCreate, MealLogResponse, DailySummary
from app.services.health_engine import evaluate_health_alerts, evaluate_daily_alerts
from typing import List

router = APIRouter()


@router.post("/", response_model=MealLogResponse)
def log_meal(data: MealLogCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):

    meal = MealLog(
        user_id=user.id,
        food_name=data.food_name,
        food_item_id=data.food_item_id,
        quantity=data.quantity,
        meal_type=data.meal_type,
        calories=data.calories,
        protein_g=data.protein_g,
        carbs_g=data.carbs_g,
        fat_g=data.fat_g,
        fiber_g=data.fiber_g,
        sugar_g=data.sugar_g,
        sodium_mg=data.sodium_mg,
        # Micronutrients
        vitamin_a_iu=data.vitamin_a_iu,
        vitamin_c_mg=data.vitamin_c_mg,
        calcium_mg=data.calcium_mg,
        iron_mg=data.iron_mg,
        potassium_mg=data.potassium_mg,
    )
    db.add(meal)
    db.commit()
    db.refresh(meal)
    return meal


@router.get("/today", response_model=List[MealLogResponse])
def get_today_meals(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    today = datetime.utcnow().date()
    meals = (
        db.query(MealLog)
        .filter(
            MealLog.user_id == user.id,
            func.date(MealLog.logged_at) == today,
        )
        .order_by(MealLog.logged_at.desc())
        .all()
    )
    return meals


@router.get("/summary", response_model=DailySummary)
def daily_summary(lang: str = "en", db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    today = datetime.utcnow().date()
    meals = (
        db.query(MealLog)
        .filter(
            MealLog.user_id == user.id,
            func.date(MealLog.logged_at) == today,
        )
        .all()
    )
    total_cal = sum(m.calories for m in meals)
    total_pro = sum(m.protein_g for m in meals)
    total_carb = sum(m.carbs_g for m in meals)
    total_fat = sum(m.fat_g for m in meals)
    total_fib = sum(m.fiber_g for m in meals)
    total_sug = sum(m.sugar_g for m in meals)
    total_sod = sum(m.sodium_mg for m in meals)

    today_summary = {
        "total_calories": total_cal,
        "total_protein": total_pro,
        "total_carbs": total_carb,
        "total_fat": total_fat,
        "total_fiber": total_fib,
        "total_sugar": total_sug,
        "total_sodium": total_sod,
    }

    # Initialize alerts with daily health engine findings
    alerts = evaluate_daily_alerts(today_summary, lang=lang)
    
    # Get dynamic AI recommendations based on profile
    from app.services.ai_model import get_ai_recommendations
    user_dict = {
        "full_name": user.full_name,
        "health_conditions": user.health_conditions or []
    }
    ai_recs = get_ai_recommendations(user_dict, today_summary, lang=lang)
    alerts.extend(ai_recs)

    return DailySummary(
        total_calories=total_cal,
        total_protein=total_pro,
        total_carbs=total_carb,
        total_fat=total_fat,
        total_fiber=total_fib,
        total_sugar=total_sug,
        total_sodium=total_sod,
        meal_count=len(meals),
        alerts=alerts,
    )


@router.get("/history")
def meal_history(days: int = 7, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    since = datetime.utcnow() - timedelta(days=days)
    meals = (
        db.query(MealLog)
        .filter(MealLog.user_id == user.id, MealLog.logged_at >= since)
        .order_by(MealLog.logged_at.desc())
        .all()
    )
    return [
        {
            "id": m.id,
            "food_name": m.food_name,
            "meal_type": m.meal_type,
            "calories": m.calories,
            "protein_g": m.protein_g,
            "carbs_g": m.carbs_g,
            "fat_g": m.fat_g,
            "logged_at": m.logged_at.isoformat(),
        }
        for m in meals
    ]


@router.delete("/{meal_id}")
def delete_meal(meal_id: int, db: Session = Depends(get_db)):
    meal = db.query(MealLog).filter(MealLog.id == meal_id).first()
    if not meal:
        raise HTTPException(status_code=404, detail="Meal not found")
    db.delete(meal)
    db.commit()
    return {"message": "Meal deleted"}
