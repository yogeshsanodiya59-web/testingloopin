import sys
import os

# Add backend to path to allow imports from app
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from app.db import session
from app.models.user import User
from app.core.security import get_password_hash
from app.core.config import settings
from sqlalchemy import text

ADMINS = [
    {"email": "loopbt1077@gmail.com", "password": "Yogesh@59", "full_name": "Yogesh Sanodiya"},
    {"email": "loopbt1081@gmail.com", "password": "loopadminmiitii", "full_name": "Meet Bisen"},
    {"email": "loopbt1136@gmail.com", "password": "loopadminsuunii", "full_name": "Suhani Choudhary"}
]

def seed_admins():
    print("🌱 Seeding Admin Accounts...")
    session.init_db(settings.DATABASE_URL)
    db = session.SessionLocal()
    try:
        # Check if DB is reachable
        try:
            db.execute(text("SELECT 1"))
        except Exception as e:
            print(f"❌ Database connection failed: {e}")
            return

        for admin_data in ADMINS:
            user = db.query(User).filter(User.email == admin_data["email"]).first()
            hashed_pwd = get_password_hash(admin_data["password"])
            
            if user:
                print(f"🔄 Updating existing user: {admin_data['email']} -> Role: Admin")
                user.role = "admin"
                user.hashed_password = hashed_pwd
                # user.auth_provider = "local" # Optional, mixed mode
            else:
                print(f"✅ Creating new admin: {admin_data['email']}")
                base_username = admin_data["email"].split("@")[0]
                user = User(
                    email=admin_data["email"],
                    hashed_password=hashed_pwd,
                    full_name=admin_data["full_name"],
                    role="admin",
                    username=f"{base_username}_admin",
                    auth_provider="local",
                    is_active=True
                )
                db.add(user)
        
        db.commit()
        print("✨ Admin Seeding Complete!")
        
    except Exception as e:
        print(f"❌ Error seeding admins: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_admins()
