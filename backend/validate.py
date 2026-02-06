#!/usr/bin/env python3
"""
Backend validation script.

Run this to verify your backend is properly configured before starting.
"""
import sys


def check_imports():
    """Check if all required packages are installed."""
    print("Checking Python packages...")
    
    required = {
        'fastapi': 'FastAPI',
        'uvicorn': 'Uvicorn',
        'sqlalchemy': 'SQLAlchemy',
        'psycopg2': 'psycopg2 (PostgreSQL driver)',
        'pydantic_settings': 'Pydantic Settings',
        'jose': 'Python JOSE (JWT)',
        'passlib': 'Passlib (password hashing)',
    }
    
    missing = []
    for package, name in required.items():
        try:
            __import__(package)
            print(f"  ✅ {name}")
        except ImportError:
            print(f"  ❌ {name} - NOT INSTALLED")
            missing.append(package)
    
    if missing:
        print(f"\n❌ Missing packages: {', '.join(missing)}")
        print("\nRun: pip install -r requirements.txt")
        return False
    
    print("\n✅ All packages installed")
    return True


def check_env_file():
    """Check if .env file exists."""
    import os
    print("\nChecking configuration...")
    
    env_path = os.path.join(os.path.dirname(__file__), '.env')
    if os.path.exists(env_path):
        print("  ✅ .env file found")
        return True
    else:
        print("  ⚠️  .env file not found")
        print("     Run: copy .env.example .env")
        print("     Then edit .env with your PostgreSQL password")
        return False


def check_database():
    """Check if can connect to PostgreSQL."""
    print("\nChecking database connection...")
    
    try:
        from app.core.config import settings
        from sqlalchemy import create_engine, text
        
        engine = create_engine(settings.DATABASE_URL)
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        
        print("  ✅ PostgreSQL connection successful")
        engine.dispose()
        return True
    except Exception as e:
        print(f"  ❌ Database connection failed: {e}")
        print("\n     Possible fixes:")
        print("     1. Make sure PostgreSQL is running")
        print("     2. Check DATABASE_URL in .env file")
        print("     3. Create database: CREATE DATABASE loopin;")
        return False


def check_app_imports():
    """Check if app can be imported."""
    print("\nchecking application imports...")
    
    try:
        from app.main import app
        print("  ✅ Application imports successfully")
        return True
    except Exception as e:
        print(f"  ❌ Application import failed: {e}")
        return False


def main():
    """Run all checks."""
    print("=" * 60)
    print("Backend Validation Script")
    print("=" * 60)
    
    checks = [
        check_imports(),
        check_env_file(),
        check_database(),
        check_app_imports(),
    ]
    
    print("\n" + "=" * 60)
    if all(checks):
        print("🎉 All checks passed! Backend is ready to run.")
        print("\nStart the server:")
        print("  uvicorn app.main:app --reload")
        print("\nThen visit:")
        print("  http://localhost:8000/docs")
        return 0
    else:
        print("❌ Some checks failed. Fix the issues above.")
        return 1


if __name__ == "__main__":
    sys.exit(main())
