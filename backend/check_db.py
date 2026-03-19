import sqlite3
import os

def show_data_simple():
    # Detect db path automatically
    db_path = 'smartplate.db'
    if not os.path.exists(db_path):
        db_path = os.path.join('backend', 'smartplate.db')
    
    if not os.path.exists(db_path):
        print(f"Error: Database file not found at {db_path}")
        return

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    print("\n" + "="*50)
    print("      SMART PLATE — LOCAL DATABASE VIEW")
    print("="*50)

    # Get Tables
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = cursor.fetchall()
    
    for table_name in [t[0] for t in tables if not t[0].startswith('sqlite_')]:
        print(f"\n[ Table: {table_name} ]")
        cursor.execute(f"PRAGMA table_info({table_name});")
        cols = [col[1] for col in cursor.fetchall()]
        print(" | ".join(cols))
        print("-" * (len(" | ".join(cols))))
        
        cursor.execute(f"SELECT * FROM {table_name} LIMIT 10;")
        rows = cursor.fetchall()
        for row in rows:
            print(" | ".join([str(val) for val in row]))
        if not rows:
            print("  (Table is empty)")
    
    conn.close()
    print("\n" + "="*50)

if __name__ == "__main__":
    show_data_simple()
