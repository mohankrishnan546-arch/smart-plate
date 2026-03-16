
import os
import sys

# Ensure backend path is in sys.path
sys.path.append(os.path.abspath("."))

try:
    from app.database import SessionLocal, engine, Base
    from app.models import User, MealLog
    from datetime import datetime, timedelta
    
    print("Connecting to DB...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    print("Finding user...")
    user = db.query(User).filter(User.username == 'guest_user').first()
    if not user:
        user = User(
            username="guest_user", email="guest@smartplate.ai", hashed_password="GUEST_AUTH",
            full_name="Guest User", age=25, gender="Male", health_conditions=["General Health"]
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    
    print("Deleting old logs...")
    db.query(MealLog).filter(MealLog.user_id == user.id).delete()
    
    print("Adding NEW logs...")
    m = {"name": "Test Meal", "type": "lunch", "cal": 500, "prot": 20, "carb": 50, "fat": 15, "fib": 5, "sug": 5, "sod": 500}
    log = MealLog(
        user_id=user.id, food_name=m["name"], meal_type=m["type"], quantity=1,
        calories=m["cal"], protein_g=m["prot"], carbs_g=m["carb"], fat_g=m["fat"],
        fiber_g=m["fib"], sugar_g=m["sug"], sodium_mg=m["sod"],
        health_alerts=["Test Alert"], logged_at=datetime.utcnow()
    )
    db.add(log)
    db.commit()
    print("SEED SUCCESSFUL")
    db.close()
except Exception as e:
    print(f"ERROR: {str(e)}")
    import traceback
    traceback.print_exc()
