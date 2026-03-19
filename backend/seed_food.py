import sqlite3
from app.services.nutrition_lookup import ALL_NUTRITION

def seed_food_items():
    conn = sqlite3.connect('smartplate.db')
    cursor = conn.cursor()
    
    # Check if table exists
    cursor.execute("CREATE TABLE IF NOT EXISTS food_items (id INTEGER PRIMARY KEY, name TEXT, category TEXT, source TEXT, calories REAL, protein_g REAL, carbs_g REAL, fat_g REAL, fiber_g REAL, sugar_g REAL, sodium_mg REAL, potassium_mg REAL, cholesterol_mg REAL, vitamin_a_iu REAL, vitamin_c_mg REAL, calcium_mg REAL, iron_mg REAL, serving_size TEXT, serving_weight_g REAL)")
    
    # Clear old data
    cursor.execute("DELETE FROM food_items")
    
    # Insert data
    for name, data in ALL_NUTRITION.items():
        cursor.execute("""
            INSERT INTO food_items (name, category, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, cholesterol_mg, serving_size)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            name, "Uncategorized", "System",
            data.get('calories', 0), data.get('protein_g', 0), data.get('carbs_g', 0),
            data.get('fat_g', 0), data.get('fiber_g', 0), data.get('sugar_g', 0),
            data.get('sodium_mg', 0), data.get('cholesterol_mg', 0),
            data.get('serving_size', '100g')
        ))
    
    conn.commit()
    print(f"Success: Seeded {len(ALL_NUTRITION)} items into food_items table!")
    conn.close()

if __name__ == "__main__":
    seed_food_items()
