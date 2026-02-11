import sqlite3
import os

db_path = "instance/accessibility.db"
if not os.path.exists(db_path):
    db_path = "accessibility.db"

if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    try:
        cursor.execute("PRAGMA table_info(cognitive_log)")
        columns = [row[1] for row in cursor.fetchall()]
        
        if 'mouse_jitter' not in columns:
            print("Adding mouse_jitter column...")
            cursor.execute("ALTER TABLE cognitive_log ADD COLUMN mouse_jitter FLOAT DEFAULT 0.0")
            
        if 'dwell_time' not in columns:
            print("Adding dwell_time column...")
            cursor.execute("ALTER TABLE cognitive_log ADD COLUMN dwell_time FLOAT DEFAULT 0.0")
            
        conn.commit()
        print("Migration complete.")
            
    except Exception as e:
        print(f"Error: {e}")
    finally:
        conn.close()
else:
    print(f"Database not found at {db_path}")
