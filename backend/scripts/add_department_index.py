import sys
import os

# Add backend to path
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from app.db import session
from app.core.config import settings
from sqlalchemy import text

def add_department_index():
    print("🔄 Migrating: Adding index to department column...")
    session.init_db(settings.DATABASE_URL)
    try:
        with session.engine.connect() as conn:
            # Check if index exists (PostgreSQL/SQLite specific, generic approach: try creating)
            # Using raw SQL for simplicity across potential DBs (assuming SQLite/PG)
            # distinct name to avoid conflicts
            conn.execute(text("CREATE INDEX IF NOT EXISTS ix_posts_department ON posts (department)"))
            conn.commit()
        print("✅ Migration Successful: Index added to department column.")
    except Exception as e:
        print(f"❌ Migration Failed: {e}")

if __name__ == "__main__":
    add_department_index()
