"""Food recognition router — YOLOv8 + Food-101 inference."""
from fastapi import APIRouter, File, UploadFile, HTTPException, Query, Depends
from app.schemas import FoodRecognitionResult, NutritionInfo
from app.services.ai_model import predict_food, get_personalized_verdict
from app.services.nutrition_lookup import get_nutrition
from app.services.health_engine import evaluate_health_alerts
from app.routers.auth import get_current_user_optional
from app.models import User
from app.database import get_db
from sqlalchemy.orm import Session
from typing import Optional
import shutil, os

router = APIRouter()


@router.post("/", response_model=FoodRecognitionResult)
async def recognize_food(
    file: UploadFile = File(...), 
    db: Session = Depends(get_db), 
    user: Optional[User] = Depends(get_current_user_optional),
    lang: str = Query("en")
):
    """Upload a food image → get food name, nutrition, and health alerts."""
    # Removed strict content_type validation to allow all mobile formats (HEIC, generic jpgs)
    # The machine learning libraries (PIL/OpenCV) will naturally reject corrupted files.

    temp_path = f"temp_{file.filename}"
    try:
        with open(temp_path, "wb") as buf:
            shutil.copyfileobj(file.file, buf)

        # 1. AI Prediction
        prediction = predict_food(temp_path)

        # 2. Filter non-food objects
        if not prediction.get("is_food", True):
            f_name = prediction.get("food_name", "")
            if any(err in f_name for err in ["Failed", "Busy", "Missing", "Unavailable"]):
                raise HTTPException(status_code=503, detail=f"AI Engine Error: {f_name}")
            # If the AI says it's not food, we just proceed anyway to show the user what it mapped to.
            prediction["is_food"] = True

        # 3. Nutrition data (Gemini provides 'nutrition', fallback to local DB)
        if "nutrition" in prediction:
            nutrition = prediction["nutrition"]
        else:
            nutrition = get_nutrition(prediction["food_name"])

        # 4. Health alerts (with language support)
        # Using a safer approach for the nutrition dict to avoid engine errors
        alerts = evaluate_health_alerts(nutrition, lang=lang)

        # 5. Personalized Verdict (Analyze based on user conditions and language)
        if user:
            user_profile = {
                "full_name": user.full_name,
                "age": user.age,
                "health_conditions": user.health_conditions or []
            }
        else:
            # Fallback for expired token / unauthenticated scan
            user_profile = {
                "full_name": "Guest",
                "age": None,
                "health_conditions": []
            }
            
        verdict_data = get_personalized_verdict(prediction["food_name"], nutrition, user_profile, lang=lang)

        return FoodRecognitionResult(
            food_name=prediction["food_name"],
            confidence=prediction["confidence"],
            nutrition=NutritionInfo(**nutrition),
            health_alerts=alerts,
            personalized_verdict=verdict_data.get("verdict"),
            personalized_explanation=verdict_data.get("explanation"),
            allergens=prediction.get("allergens", []),
            additives=prediction.get("additives", []),
        )
    except HTTPException:
        raise
    except Exception as e:
        # Log error for better debugging since we're in a generic catch-all
        print(f"[RECOGNITION ERROR] {e}")
        raise HTTPException(status_code=500, detail=f"Recognition failed: {str(e)}")
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)
