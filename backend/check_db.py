import sqlite3
import os

db_path = "instance/accessibility.db"
if not os.path.exists(db_path):
    print(f"Database not found at {db_path}")
    # try root
    db_path = "accessibility.db"

if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    try:
        cursor.execute("PRAGMA table_info(accessibility_profile)")
        columns = [row[1] for row in cursor.fetchall()]
        print(f"Columns in accessibility_profile: {columns}")
        
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='cognitive_log'")
        table_exists = cursor.fetchone()
        print(f"cognitive_log table exists: {bool(table_exists)}")
        
    except Exception as e:
        print(f"Error: {e}")
    finally:
        conn.close()
else:
    print(f"Database not found at {db_path}")
