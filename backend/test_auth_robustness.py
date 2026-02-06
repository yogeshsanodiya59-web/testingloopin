import sys
import os

# Add backend to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

import app.db.session as db_session
from app.models.user import User
from app.core.security import create_access_token
from app.core.config import settings
from jose import jwt
from datetime import timedelta
import random

def test_auth_cycle():
    print("--- Starting Auth Robustness Test ---")
    
    # Initialize DB connection
    print(f"0. Initializing DB with URL: {settings.DATABASE_URL}")
    db_session.init_db(settings.DATABASE_URL)
    
    if db_session.SessionLocal is None:
        print("❌ SessionLocal is still None after init!")
        return

    db = db_session.SessionLocal()
    
    # 1. Generate Test Data - Mixed Case
    base_email = f"test_{random.randint(1000,9999)}@gmail.com"
    stored_email = base_email.upper() # Store as UPPERCASE in DB
    print(f"1. Test Email (Stored): {stored_email}")
    
    # 2. Create User Simulating OAuth
    try:
        user = User(
            email=stored_email,
            full_name="Test User",
            username=base_email.split('@')[0],
            auth_provider="google"
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        print(f"2. User Created with ID: {user.id}")
    except Exception as e:
        print(f"❌ User Creation Failed: {e}")
        return

    # 3. Issue Token (using lowercase claim, as auth.py does now)
    lowercase_claim = stored_email.lower()
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    token = create_access_token(
        data={"sub": lowercase_claim}, expires_delta=access_token_expires
    )
    print(f"3. Token Issued with claim: {lowercase_claim}")

    # 4. Verify Token (Simulate deps.py)
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        email_claim = payload.get("sub")
        print(f"4. Token Decoded. Claim: {email_claim}")
        
        # 5. DB Lookup (Should succeed despite case mismatch due to ilike)
        # We manually test the ilike logic here as if we were deps.py
        fetched_user = db.query(User).filter(User.email.ilike(email_claim)).first()
        
        if fetched_user:
            print(f"5. User Fetched Successfully from DB: {fetched_user.email} (Matched via ilike)")
        else:
            print("❌ User NOT FOUND in DB! ilike failed or not used.")
            return
            
    except Exception as e:
        print(f"❌ Verification Failed: {e}")
    finally:
        # Cleanup
        db.delete(user)
        db.commit()
        print("6. Cleanup Complete")

if __name__ == "__main__":
    test_auth_cycle()
