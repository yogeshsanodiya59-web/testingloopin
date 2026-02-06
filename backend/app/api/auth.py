from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.models.user import User
from app.api.deps import get_current_user
from app.db.session import get_db
from app.core.security import verify_password, create_access_token

router = APIRouter()

@router.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """
    Local Login for Admins (or users skipping Firebase).
    """
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not user.hashed_password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    access_token = create_access_token(data={"sub": user.email, "id": user.id, "role": user.role})
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=dict)
def read_users_me(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "email": current_user.email,
        "is_active": current_user.is_active,
        "enrollment_number": current_user.enrollment_number,
        "username": current_user.username,
        "full_name": current_user.full_name,
        "department": current_user.department,
        "role": current_user.role,
        "bio": current_user.bio,
        "profile_photo_url": current_user.profile_photo_url,
        "created_at": current_user.created_at.isoformat() if current_user.created_at else None
    }
