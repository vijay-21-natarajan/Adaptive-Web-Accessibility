import sqlite3
import os

db_path = "instance/accessibility.db"
if not os.path.exists(db_path):
    db_path = "accessibility.db"

if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    try:
        # Add column if missing
        cursor.execute("PRAGMA table_info(accessibility_profile)")
        columns = [row[1] for row in cursor.fetchall()]
        if 'cognitive_load_threshold' not in columns:
            print("Adding cognitive_load_threshold column...")
            cursor.execute("ALTER TABLE accessibility_profile ADD COLUMN cognitive_load_threshold FLOAT DEFAULT 0.7")
            conn.commit()
            print("Column added successfully.")
        else:
            print("Column already exists.")
            
    except Exception as e:
        print(f"Error: {e}")
    finally:
        conn.close()
else:
    print(f"Database not found at {db_path}")
