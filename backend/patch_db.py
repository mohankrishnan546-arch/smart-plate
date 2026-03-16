
import sqlite3
conn = sqlite3.connect('nutrivision.db')
cursor = conn.cursor()
try:
    cursor.execute("ALTER TABLE meal_logs ADD COLUMN fiber_g FLOAT DEFAULT 0")
    cursor.execute("ALTER TABLE meal_logs ADD COLUMN sugar_g FLOAT DEFAULT 0")
    cursor.execute("ALTER TABLE meal_logs ADD COLUMN sodium_mg FLOAT DEFAULT 0")
    print("Columns added")
except Exception as e:
    print(f"Error or already exists: {e}")
conn.commit()
conn.close()
