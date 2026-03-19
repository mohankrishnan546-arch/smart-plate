"""Food recognition router — YOLOv8 + Food-101 inference."""
from fastapi import APIRouter, File, UploadFile, HTTPException
from app.schemas import FoodRecognitionResult, NutritionInfo
from app.services.ai_model import predict_food, get_personalized_verdict
from app.services.nutrition_lookup import get_nutrition
from app.services.health_engine import evaluate_health_alerts
from app.routers.auth import get_current_user
from app.models import User
from sqlalchemy.orm import Session
from fastapi import Depends
from app.database import get_db
import shutil, os

router = APIRouter()


@router.post("/", response_model=FoodRecognitionResult)
async def recognize_food(file: UploadFile = File(...), db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    """Upload a food image → get food name, nutrition, and health alerts."""
    allowed = {"image/jpeg", "image/png", "image/webp"}
    if file.content_type not in allowed:
        raise HTTPException(status_code=400, detail="Only JPEG/PNG/WebP images accepted")

    temp_path = f"temp_{file.filename}"
    try:
        with open(temp_path, "wb") as buf:
            shutil.copyfileobj(file.file, buf)

        # 1. AI Prediction
        prediction = predict_food(temp_path)

        # 2. Filter non-food objects
        if not prediction.get("is_food", True):
            raise HTTPException(
                status_code=400, 
                detail="Object detected is not food. Smart Plate only analyzes food items."
            )

        # 3. Nutrition data (Gemini provides 'nutrition', fallback to local DB)
        if "nutrition" in prediction:
            nutrition = prediction["nutrition"]
        else:
            nutrition = get_nutrition(prediction["food_name"])

        # 4. Health alerts
        alerts = evaluate_health_alerts(nutrition)

        # 5. Personalized Verdict (Analyze based on user conditions)
        user_profile = {
            "full_name": user.full_name,
            "age": user.age,
            "health_conditions": user.health_conditions or []
        }
        verdict_data = get_personalized_verdict(prediction["food_name"], nutrition, user_profile)

        return FoodRecognitionResult(
            food_name=prediction["food_name"],
            confidence=prediction["confidence"],
            nutrition=NutritionInfo(**nutrition),
            health_alerts=alerts,
            personalized_verdict=verdict_data.get("verdict"),
            personalized_explanation=verdict_data.get("explanation"),
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Recognition failed: {str(e)}")
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)
