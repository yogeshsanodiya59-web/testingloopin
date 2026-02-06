import sys
import os

# Add backend to path
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from app.db import session
from app.core.config import settings
from sqlalchemy import text

def add_pinned_column():
    print("🔄 Migrating: Adding is_pinned column to posts table...")
    session.init_db(settings.DATABASE_URL)
    try:
        with session.engine.connect() as conn:
            conn.execute(text("ALTER TABLE posts ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT FALSE"))
            conn.commit()
        print("✅ Migration Successful: is_pinned column added.")
    except Exception as e:
        print(f"❌ Migration Failed: {e}")

if __name__ == "__main__":
    add_pinned_column()
