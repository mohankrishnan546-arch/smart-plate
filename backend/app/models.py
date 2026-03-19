"""SQLAlchemy ORM models for Smart Plate AI."""
from sqlalchemy import Column, Integer, String, Float, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(100))
    firebase_uid = Column(String(128), unique=True, index=True)
    phone_number = Column(String(20), unique=True, index=True)
    age = Column(Integer)
    gender = Column(String(20))
    medical_history = Column(Text)
    weight_kg = Column(Float)
    height_cm = Column(Float)
    activity_level = Column(String(50), default="Sedentary") # e.g. "Moderate", "Active"
    goal = Column(String(50), default="Maintain") # e.g. "Lose Weight", "Gain Muscle"
    health_conditions = Column(JSON, default=[])  # e.g. ["diabetes", "hypertension"]
    is_verified = Column(Integer, default=0) # 0 = Not verified, 1 = Verified
    verification_code = Column(String(10), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    meals = relationship("MealLog", back_populates="user")


class FoodItem(Base):
    __tablename__ = "food_items"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), index=True, nullable=False)
    category = Column(String(100))
    source = Column(String(50))  # "usda" or "icmr"
    calories = Column(Float, default=0)
    protein_g = Column(Float, default=0)
    carbs_g = Column(Float, default=0)
    fat_g = Column(Float, default=0)
    fiber_g = Column(Float, default=0)
    sugar_g = Column(Float, default=0)
    sodium_mg = Column(Float, default=0)
    potassium_mg = Column(Float, default=0)
    cholesterol_mg = Column(Float, default=0)
    vitamin_a_iu = Column(Float, default=0)
    vitamin_c_mg = Column(Float, default=0)
    calcium_mg = Column(Float, default=0)
    iron_mg = Column(Float, default=0)
    serving_size = Column(String(100))
    serving_weight_g = Column(Float, default=100)


class MealLog(Base):
    __tablename__ = "meal_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    food_name = Column(String(200), nullable=False)
    food_item_id = Column(Integer, ForeignKey("food_items.id"), nullable=True)
    quantity = Column(Float, default=1)
    meal_type = Column(String(20))  # breakfast, lunch, dinner, snack
    calories = Column(Float, default=0)
    protein_g = Column(Float, default=0)
    carbs_g = Column(Float, default=0)
    fat_g = Column(Float, default=0)
    fiber_g = Column(Float, default=0)
    sugar_g = Column(Float, default=0)
    sodium_mg = Column(Float, default=0)
    image_url = Column(Text, nullable=True)
    confidence = Column(Float, default=0)
    health_alerts = Column(JSON, default=[])

    # Micronutrients
    vitamin_a_iu = Column(Float, default=0)
    vitamin_c_mg = Column(Float, default=0)
    calcium_mg = Column(Float, default=0)
    iron_mg = Column(Float, default=0)
    potassium_mg = Column(Float, default=0)

    logged_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="meals")



class MedicalProvider(Base):
    __tablename__ = "medical_providers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    type = Column(String(50))           # "doctor" or "hospital"
    specialty = Column(String(100))
    location = Column(String(200))
    contact = Column(String(100))
    rating = Column(Float, default=4.5)
    description = Column(Text)
    associated_conditions = Column(JSON, default=[])
class MedicalBooking(Base):
    __tablename__ = "medical_bookings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    provider_id = Column(Integer, ForeignKey("medical_providers.id"), nullable=False)
    appointment_date = Column(DateTime)
    status = Column(String(20), default="Pending") # Pending, Confirmed, Cancelled
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User")
    provider = relationship("MedicalProvider")
