import sqlite3

ALL_NUTRITION = {
    "apple": {"calories": 52, "protein_g": 0.3, "carbs_g": 14, "fat_g": 0.2, "serving_size": "1 medium"},
    "banana": {"calories": 89, "protein_g": 1.1, "carbs_g": 23, "fat_g": 0.3, "serving_size": "1 medium"},
    "biryani": {"calories": 168, "protein_g": 5.2, "carbs_g": 25, "fat_g": 5.5, "serving_size": "1 plate"},
    "dosa": {"calories": 133, "protein_g": 3.9, "carbs_g": 22, "fat_g": 3.7, "serving_size": "1 dosa"},
    "idli": {"calories": 78, "protein_g": 2.1, "carbs_g": 16, "fat_g": 0.3, "serving_size": "2 pieces"},
    "pizza": {"calories": 266, "protein_g": 11.4, "carbs_g": 33, "fat_g": 10.4, "serving_size": "1 slice"},
    "burger": {"calories": 295, "protein_g": 17, "carbs_g": 24, "fat_g": 14, "serving_size": "1 burger"},
    "salad": {"calories": 20, "protein_g": 1.5, "carbs_g": 3.5, "fat_g": 0.2, "serving_size": "1 bowl"},
    "rice": {"calories": 130, "protein_g": 2.7, "carbs_g": 28, "fat_g": 0.3, "serving_size": "1 cup"},
    "chapati": {"calories": 120, "protein_g": 3.7, "carbs_g": 25, "fat_g": 0.9, "serving_size": "1 piece"},
    "dal": {"calories": 104, "protein_g": 6.9, "carbs_g": 16, "fat_g": 1.5, "serving_size": "1 cup"},
    "naan": {"calories": 262, "protein_g": 9, "carbs_g": 45, "fat_g": 5.1, "serving_size": "1 piece"},
    "chicken_curry": {"calories": 175, "protein_g": 15.2, "carbs_g": 8, "fat_g": 9.5, "serving_size": "1 cup"},
}

def seed():
    conn = sqlite3.connect('smartplate.db')
    c = conn.cursor()
    c.execute("CREATE TABLE IF NOT EXISTS food_items (id INTEGER PRIMARY KEY, name TEXT, calories REAL, protein_g REAL, carbs_g REAL, fat_g REAL, source TEXT, serving_size TEXT)")
    c.execute("DELETE FROM food_items")
    for name, d in ALL_NUTRITION.items():
        c.execute("INSERT INTO food_items (name, calories, protein_g, carbs_g, fat_g, source, serving_size) VALUES (?,?,?,?,?,?,?)",
                  (name, d['calories'], d['protein_g'], d['carbs_g'], d['fat_g'], 'local', d['serving_size']))
    conn.commit()
    conn.close()
    print("Database seeded with 13 key items!")

if __name__ == "__main__":
    seed()
