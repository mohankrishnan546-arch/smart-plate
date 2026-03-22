import json
import sqlite3
import os

def import_data():
    desktop_path = r"C:\Users\LENOVO\Desktop\AI_Food_Training_Dataset"
    json_path = os.path.join(desktop_path, "food_nutrients.json")
    db_path = r"c:\Users\LENOVO\Documents\SMART PLATE\backend\smartplate.db"

    if not os.path.exists(json_path):
        print("JSON file not found.")
        return

    with open(json_path, 'r') as f:
        data = json.load(f)

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    foods = data.get("foods", [])
    count = 0

    for food in foods:
        name = food["name"]
        category = food["category"]
        nutrients = food["nutrients_per_100g"]
        
        # Check if already exists
        cursor.execute("SELECT id FROM food_items WHERE name = ?", (name,))
        if cursor.fetchone():
            continue

        cursor.execute("""
            INSERT INTO food_items (
                name, category, source, calories, protein_g, carbs_g, fat_g, 
                fiber_g, sugar_g, sodium_mg, serving_size
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            name, category, "trained_model", 
            nutrients.get("calories", 0),
            nutrients.get("protein_g", 0),
            nutrients.get("carbs_g", 0),
            nutrients.get("fat_g", 0),
            nutrients.get("fiber_g", 0),
            nutrients.get("sugar_g", 0),
            nutrients.get("sodium_mg", 0),
            "100g"
        ))
        count += 1

    conn.commit()
    conn.close()
    print(f"Successfully imported {count} food items into the system database.")

if __name__ == "__main__":
    import_data()
