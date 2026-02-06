import sys
import os
import logging
from dotenv import load_dotenv

# Add current directory to path
sys.path.append(os.getcwd())

# Explicitly load .env
load_dotenv(os.path.join(os.getcwd(), ".env"))

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("diagnose")

# Debug Env
print(f"DEBUG: DATABASE_URL loaded? {'Yes' if os.getenv('DATABASE_URL') else 'No'}")
print(f"DEBUG: FIREBASE_CREDENTIALS_JSON loaded? {'Yes' if os.getenv('FIREBASE_CREDENTIALS_JSON') else 'No'}")


def check_imports():
    logger.info("Checking imports...")
    try:
        from app.main import app
        from app.db.session import SessionLocal
        from app.core.config import settings
        logger.info("✅ Core modules imported successfully.")
        return True
    except ImportError as e:
        logger.error(f"❌ Import Error: {e}")
        return False
    except Exception as e:
        logger.error(f"❌ Unexpected Error during import: {e}")
        return False

def check_db():
    logger.info("Checking database connection...")
    try:
        from app.db import session as db_session
        from app.core.config import settings
        from sqlalchemy import text
        
        # Initialize DB first
        if db_session.SessionLocal is None:
            db_session.init_db(settings.DATABASE_URL)
        
        db = db_session.SessionLocal()
        db.execute(text("SELECT 1"))
        logger.info("✅ Database connection successful.")
        db.close()
        return True
    except Exception as e:
        logger.error(f"❌ Database connection failed: {e}")
        return False

if __name__ == "__main__":
    logger.info("Starting diagnosis...")
    if check_imports():
        check_db()
    else:
        logger.error("Skipping DB check due to import errors.")
