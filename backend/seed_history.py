
from app.database import SessionLocal, engine, Base
from app.models import User, MealLog, FoodItem
from datetime import datetime, timedelta
import random
import traceback

def seed_demo_history():
    try:
        Base.metadata.create_all(bind=engine)
        db = SessionLocal()
        
        user = db.query(User).filter(User.username == 'guest_user').first()
        if not user:
            print("Creating guest user...")
            user = User(
                username="guest_user",
                email="guest@smartplate.ai",
                hashed_password="GUEST_AUTH",
                full_name="Guest User",
                age=25,
                gender="Male",
                health_conditions=["General Health"]
            )
            db.add(user)
            db.commit()
            db.refresh(user)

        # Clear existing logs for this user
        db.query(MealLog).filter(MealLog.user_id == user.id).delete()
        
        meals_data = [
            {"name": "Oatmeal with Berries", "type": "breakfast", "days_ago": 2, "cal": 350, "prot": 12, "carb": 60, "fat": 7, "fib": 8, "sug": 10, "sod": 50},
            {"name": "Grilled Chicken Salad", "type": "lunch", "days_ago": 2, "cal": 450, "prot": 35, "carb": 15, "fat": 18, "fib": 5, "sug": 2, "sod": 600},
            {"name": "Apple", "type": "snack", "days_ago": 2, "cal": 95, "prot": 0.5, "carb": 25, "fat": 0.3, "fib": 4.5, "sug": 19, "sod": 2},
            {"name": "Salmon and Broccoli", "type": "dinner", "days_ago": 2, "cal": 550, "prot": 45, "carb": 10, "fat": 30, "fib": 6, "sug": 1, "sod": 400},
            {"name": "Avocado Toast", "type": "breakfast", "days_ago": 1, "cal": 400, "prot": 10, "carb": 35, "fat": 25, "fib": 10, "sug": 2, "sod": 300},
            {"name": "Turkey Sandwich", "type": "lunch", "days_ago": 1, "cal": 500, "prot": 25, "carb": 50, "fat": 15, "fib": 4, "sug": 5, "sod": 900},
            {"name": "Greek Yogurt", "type": "snack", "days_ago": 1, "cal": 150, "prot": 15, "carb": 10, "fat": 5, "fib": 0, "sug": 12, "sod": 70},
            {"name": "Pasta Primerva", "type": "dinner", "days_ago": 1, "cal": 600, "prot": 15, "carb": 80, "fat": 12, "fib": 7, "sug": 8, "sod": 500},
            {"name": "Scrambled Eggs", "type": "breakfast", "days_ago": 0, "cal": 300, "prot": 18, "carb": 2, "fat": 22, "fib": 0, "sug": 1, "sod": 400},
            {"name": "Quinoa Bowl", "type": "lunch", "days_ago": 0, "cal": 550, "prot": 20, "carb": 70, "fat": 15, "fib": 12, "sug": 4, "sod": 350}
        ]

        for m in meals_data:
            log_time = datetime.utcnow() - timedelta(days=m["days_ago"])
            if m["type"] == "breakfast": log_time = log_time.replace(hour=8, minute=30)
            elif m["type"] == "lunch": log_time = log_time.replace(hour=13, minute=0)
            elif m["type"] == "snack": log_time = log_time.replace(hour=16, minute=15)
            elif m["type"] == "dinner": log_time = log_time.replace(hour=19, minute=45)

            alerts = []
            if m["carb"] > 50: alerts.append("❗ High Carbohydrate Content")
            if m["fat"] > 20: alerts.append("⚠️ High Fat Content")
            if m["sod"] > 500: alerts.append("🧂 High Sodium Warning")

            log = MealLog(
                user_id=user.id,
                food_name=m["name"],
                meal_type=m["type"],
                quantity=1,
                calories=m["cal"],
                protein_g=m["prot"],
                carbs_g=m["carb"],
                fat_g=m["fat"],
                fiber_g=m["fib"],
                sugar_g=m["sug"],
                sodium_mg=m["sod"],
                health_alerts=alerts,
                logged_at=log_time,
                confidence=0.95
            )
            db.add(log)
        
        db.commit()
        print(f"Successfully seeded {len(meals_data)} meal logs for user {user.username}")
        db.close()
    except Exception:
        traceback.print_exc()

if __name__ == "__main__":
    seed_demo_history()
