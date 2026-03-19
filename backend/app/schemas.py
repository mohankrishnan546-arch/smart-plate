from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


# ── Auth ──
class UserCreate(BaseModel):
    username: str
    email: str
    password: str
    full_name: Optional[str] = None


class UserLogin(BaseModel):
    username: str
    password: str


class EmailVerify(BaseModel):
    email: str
    code: str


class GuestOnboarding(BaseModel):
    full_name: str
    gender: str
    age: int
    medical_history: Optional[str] = None


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserProfile(BaseModel):
    id: int
    username: str
    email: str
    full_name: Optional[str]
    age: Optional[int]
    weight_kg: Optional[float]
    height_cm: Optional[float]
    activity_level: Optional[str] = "Sedentary"
    goal: Optional[str] = "Maintain"
    health_conditions: Optional[List[str]] = []

    class Config:
        from_attributes = True


class AccountUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[str] = None


class HealthProfileUpdate(BaseModel):
    age: Optional[int] = None
    weight_kg: Optional[float] = None
    height_cm: Optional[float] = None
    activity_level: Optional[str] = None
    goal: Optional[str] = None
    health_conditions: Optional[List[str]] = None


# ── Food / Nutrition ──
class NutritionInfo(BaseModel):
    calories: float
    protein_g: float
    carbs_g: float
    fat_g: float
    fiber_g: Optional[float] = 0
    sugar_g: Optional[float] = 0
    sodium_mg: Optional[float] = 0
    cholesterol_mg: Optional[float] = 0
    vitamin_a_iu: Optional[float] = 0
    vitamin_c_mg: Optional[float] = 0
    calcium_mg: Optional[float] = 0
    iron_mg: Optional[float] = 0
    potassium_mg: Optional[float] = 0
    serving_size: Optional[str] = "100g"


class FoodRecognitionResult(BaseModel):
    food_name: str
    confidence: float
    nutrition: NutritionInfo
    health_alerts: List[str] = []
    personalized_verdict: Optional[str] = None
    personalized_explanation: Optional[str] = None


class MealLogCreate(BaseModel):
    food_name: str
    food_item_id: Optional[int] = None
    quantity: float = 1
    meal_type: str = "snack"
    calories: float = 0
    protein_g: float = 0
    carbs_g: float = 0
    fat_g: float = 0
    fiber_g: float = 0
    sugar_g: float = 0
    sodium_mg: float = 0
    # Micronutrients
    vitamin_a_iu: float = 0
    vitamin_c_mg: float = 0
    calcium_mg: float = 0
    iron_mg: float = 0
    potassium_mg: float = 0


class MealLogResponse(BaseModel):
    id: int
    food_name: str
    quantity: float
    meal_type: str
    calories: float
    protein_g: float
    carbs_g: float
    fat_g: float
    fiber_g: float
    sugar_g: float
    sodium_mg: float
    confidence: float
    health_alerts: List[str]
    # Micronutrients
    vitamin_a_iu: float
    vitamin_c_mg: float
    calcium_mg: float
    iron_mg: float
    potassium_mg: float
    logged_at: datetime

    class Config:
        from_attributes = True


class DailySummary(BaseModel):
    total_calories: float
    total_protein: float
    total_carbs: float
    total_fat: float
    total_fiber: float = 0
    total_sugar: float = 0
    total_sodium: float = 0
    meal_count: int
    alerts: List[str] = []
