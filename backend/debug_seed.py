
try:
    from app.database import SessionLocal, engine, Base
    from app.models import User, MealLog, FoodItem
    from datetime import datetime, timedelta
    import random

    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    # Logic to create user
    user = db.query(User).filter(User.username == 'guest_user').first()
    if not user:
        user = User(
            username="guest_user", email="guest@smartplate.ai", hashed_password="GUEST_AUTH",
            full_name="Guest User", age=25, gender="Male", health_conditions=["General Health"]
        )
        db.add(user)
        db.commit()
    
    # Logic to seed meals
    # ... (skipping some for brevity in debug)
    db.close()
    print("Success")
except Exception as e:
    import traceback
    traceback.print_exc()
