"""
Fix DB schema migrations that aren't handled by SQLAlchemy `create_all()`
This script will add the `submitted_form` column to the `users` table if missing.
Run as module: `python -m Backend.fix_db_schema`
"""
import sqlite3
import sys

DB = "mental_health.db"

def main():
    try:
        conn = sqlite3.connect(DB)
        cur = conn.cursor()
        cur.execute("PRAGMA table_info(users)")
        cols = [r[1] for r in cur.fetchall()]
        if 'submitted_form' not in cols:
            cur.execute("ALTER TABLE users ADD COLUMN submitted_form BOOLEAN NOT NULL DEFAULT 0")
            conn.commit()
            print('Added column submitted_form')
        else:
            print('Column submitted_form already exists')
        conn.close()
    except sqlite3.OperationalError as e:
        print('SQLite error:', e)
        sys.exit(1)

if __name__ == '__main__':
    main()
