import sys
import os

# Add backend to path
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from app.db import session
from app.core.config import settings
from app.models.audit_log import AuditLog
from app.models.user import User # Required for FK


def create_audit_table():
    print("Creating audit_logs table...")
    session.init_db(settings.DATABASE_URL)
    try:
        AuditLog.__table__.create(session.engine)
        print("✅ audit_logs table created.")
    except Exception as e:
        print(f"⚠️ Table creation failed (might exist): {e}")

if __name__ == "__main__":
    create_audit_table()
