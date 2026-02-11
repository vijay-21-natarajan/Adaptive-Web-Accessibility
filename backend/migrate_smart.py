import sqlite3
import os

db_path = "instance/accessibility.db"
if not os.path.exists(db_path):
    db_path = "accessibility.db"

if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    try:
        cursor.execute("PRAGMA table_info(accessibility_profile)")
        columns = [row[1] for row in cursor.fetchall()]
        
        if 'smart_highlighting' not in columns:
            print("Adding smart_highlighting column...")
            cursor.execute("ALTER TABLE accessibility_profile ADD COLUMN smart_highlighting BOOLEAN DEFAULT 0")
            
        if 'focus_mode' not in columns:
            print("Adding focus_mode column...")
            cursor.execute("ALTER TABLE accessibility_profile ADD COLUMN focus_mode BOOLEAN DEFAULT 0")
            
        conn.commit()
        print("Migration complete.")
            
    except Exception as e:
        print(f"Error: {e}")
    finally:
        conn.close()
else:
    print(f"Database not found at {db_path}")
