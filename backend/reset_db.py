from app.database import engine, Base
from app.models import User, FoodItem, MealLog, MedicalProvider

print("Dropping and recreating all tables...")
Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)
print("Done!")
