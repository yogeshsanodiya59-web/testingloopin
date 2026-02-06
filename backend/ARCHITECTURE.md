# FastAPI Backend Architecture Guide

> **Senior Backend Architect Review - Day 1 Best Practices**

This guide covers clean architecture principles for a FastAPI project during a 5-day sprint.

---

## 📁 Recommended Folder Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                 # Application entry point
│   │
│   ├── api/                    # API layer (routes)
│   │   ├── __init__.py
│   │   ├── deps.py             # Reusable dependencies
│   │   └── v1/                 # API versioning
│   │       ├── __init__.py
│   │       ├── auth.py         # Auth endpoints
│   │       ├── posts.py        # Post endpoints
│   │       └── users.py        # User endpoints
│   │
│   ├── core/                   # Core configuration
│   │   ├── __init__.py
│   │   ├── config.py           # Settings (Pydantic)
│   │   ├── security.py         # Auth utilities
│   │   └── logging.py          # Logging config
│   │
│   ├── db/                     # Database layer
│   │   ├── __init__.py
│   │   └── session.py          # DB connection
│   │
│   ├── models/                 # SQLAlchemy ORM models
│   │   ├── __init__.py
│   │   └── user.py             # User table model
│   │
│   ├── schemas/                # Pydantic schemas (DTOs)
│   │   ├── __init__.py
│   │   ├── user.py             # UserCreate, UserResponse
│   │   └── token.py            # Token schemas
│   │
│   ├── services/               # Business logic
│   │   ├── __init__.py
│   │   └── auth_service.py     # Auth business logic
│   │
│   └── utils/                  # Helper functions
│       ├── __init__.py
│       └── email.py            # Email utilities
│
├── tests/                      # Test suite
│   ├── __init__.py
│   ├── conftest.py
│   └── test_auth.py
│
├── alembic/                    # DB migrations (optional Day 1)
├── .env.example
├── .gitignore
├── requirements.txt
└── README.md
```

---

## 🎯 Layer Responsibilities

### **1. Models (`app/models/`)**
- **What:** SQLAlchemy ORM models (database tables)
- **Contains:** Table definitions, relationships, indexes
- **Rules:**
  - One file per model (e.g., `user.py`, `post.py`)
  - NO business logic here
  - Only database schema definitions

```python
# app/models/user.py
from sqlalchemy import Column, Integer, String, Boolean
from app.db.session import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
```

---

### **2. Schemas (`app/schemas/`)**
- **What:** Pydantic models for request/response validation
- **Contains:** DTOs (Data Transfer Objects)
- **Rules:**
  - Separate from ORM models
  - Use for API input/output validation
  - One file per domain entity

```python
# app/schemas/user.py
from pydantic import BaseModel, EmailStr

class UserCreate(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    email: str
    is_active: bool
    
    class Config:
        from_attributes = True  # Allows ORM object conversion
```

---

### **3. API Routes (`app/api/`)**
- **What:** HTTP endpoints (controllers)
- **Contains:** Route definitions, request handling
- **Rules:**
  - Thin layer - delegate logic to services
  - Handle HTTP concerns only (status codes, headers)
  - Group by domain (auth, users, posts)

```python
# app/api/v1/auth.py
from fastapi import APIRouter, Depends
from app.schemas.user import UserCreate
from app.services.auth_service import AuthService

router = APIRouter()

@router.post("/register")
def register(user_data: UserCreate, service: AuthService = Depends()):
    return service.register_user(user_data)
```

---

### **4. Services (`app/services/`)**
- **What:** Business logic layer
- **Contains:** Complex operations, business rules
- **Rules:**
  - All heavy lifting happens here
  - Reusable across multiple endpoints
  - Testable independently

```python
# app/services/auth_service.py
from sqlalchemy.orm import Session
from app.schemas.user import UserCreate
from app.models.user import User
from app.core.security import get_password_hash

class AuthService:
    def __init__(self, db: Session):
        self.db = db
    
    def register_user(self, user_data: UserCreate):
        hashed_pw = get_password_hash(user_data.password)
        user = User(email=user_data.email, hashed_password=hashed_pw)
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user
```

---

## 🚨 Common Day 1 Mistakes to Avoid

### ❌ **Mistake 1: Putting Business Logic in Routes**
```python
# BAD - Everything in the route
@router.post("/register")
def register(user: UserCreate, db: Session = Depends(get_db)):
    # Hashing password in route ❌
    hashed = get_password_hash(user.password)
    # Database operations in route ❌
    db_user = User(email=user.email, hashed_password=hashed)
    db.add(db_user)
    db.commit()
    return db_user
```

```python
# GOOD - Delegate to service
@router.post("/register")
def register(user: UserCreate, service: AuthService = Depends()):
    return service.register_user(user)  # ✅ Clean
```

---

### ❌ **Mistake 2: No Separation Between Models and Schemas**
```python
# BAD - Using ORM models directly in API
@router.post("/users")
def create_user(user: User):  # ❌ Exposing ORM model
    ...
```

```python
# GOOD - Use Pydantic schemas
@router.post("/users")
def create_user(user: UserCreate):  # ✅ Validation schema
    ...
```

---

### ❌ **Mistake 3: Hardcoded Configuration**
```python
# BAD
SECRET_KEY = "mysecret123"  # ❌ Hardcoded
DATABASE_URL = "postgresql://localhost/db"  # ❌
```

```python
# GOOD - Use pydantic-settings
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    SECRET_KEY: str
    DATABASE_URL: str
    
    class Config:
        env_file = ".env"

settings = Settings()  # ✅ Reads from .env
```

---

### ❌ **Mistake 4: No Error Handling**
```python
# BAD
@router.get("/users/{user_id}")
def get_user(user_id: int, db: Session = Depends(get_db)):
    return db.query(User).filter(User.id == user_id).first()  # ❌ Returns None if not found
```

```python
# GOOD
from fastapi import HTTPException

@router.get("/users/{user_id}")
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")  # ✅
    return user
```

---

### ❌ **Mistake 5: No Logging**
```python
# BAD - Silent failures
def register_user(user_data: UserCreate):
    try:
        user = User(email=user_data.email, ...)
        db.add(user)
        db.commit()
    except Exception:
        pass  # ❌ Swallowing errors
```

```python
# GOOD - Log everything important
import logging

logger = logging.getLogger(__name__)

def register_user(user_data: UserCreate):
    try:
        logger.info(f"Registering user: {user_data.email}")
        user = User(email=user_data.email, ...)
        db.add(user)
        db.commit()
        logger.info(f"User registered successfully: {user.id}")
    except Exception as e:
        logger.error(f"Registration failed: {e}")
        raise  # ✅ Re-raise after logging
```

---

## 📝 Minimal Logging Setup

Create `app/core/logging.py`:

```python
import logging
import sys

def setup_logging():
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        handlers=[
            logging.StreamHandler(sys.stdout)
        ]
    )

# In app/main.py
from app.core.logging import setup_logging

setup_logging()
```

**Usage in any file:**
```python
import logging
logger = logging.getLogger(__name__)

logger.info("User registered")
logger.error("Database connection failed")
```

---

## 🧹 Keeping Code Clean for 5-Day Sprint

### **Day 1-2: Foundation**
- ✅ Set up folder structure correctly from the start
- ✅ Create schemas separate from models
- ✅ Add basic logging
- ✅ Use environment variables

### **Day 3-4: Feature Development**
- ✅ Keep routes thin (< 10 lines each)
- ✅ Move complex logic to services
- ✅ Add docstrings to services
- ✅ Use type hints everywhere

### **Day 5: Polish**
- ✅ Add error handling
- ✅ Review logs
- ✅ Remove commented code
- ✅ Add README with API examples

---

## 🎯 Quick Checklist

- [ ] Models and schemas are in separate folders
- [ ] All config uses environment variables
- [ ] Routes delegate to services
- [ ] Logging is set up
- [ ] Error responses use HTTPException
- [ ] Type hints on all functions
- [ ] .env.example committed (not .env)

---

## 🔧 Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| **Files** | snake_case | `auth_service.py` |
| **Classes** | PascalCase | `UserCreate`, `AuthService` |
| **Functions** | snake_case | `get_current_user()` |
| **Variables** | snake_case | `hashed_password` |
| **Constants** | UPPER_CASE | `ACCESS_TOKEN_EXPIRE_MINUTES` |
| **Routers** | lowercase prefix | `router = APIRouter(prefix="/auth")` |

---

## 🚀 Example: Refactored Auth Flow

### Current Structure (Day 1)
```
app/api/auth.py  # ❌ Has business logic mixed with routes
```

### Improved Structure (Day 2)
```
app/
├── api/v1/auth.py         # Routes only
├── schemas/
│   ├── user.py            # UserCreate, UserResponse
│   └── token.py           # Token, TokenData
├── services/
│   └── auth_service.py    # Business logic
└── models/
    └── user.py            # ORM model
```

---

## 💡 Final Tips

1. **Start simple, refactor later** - Don't over-architect on Day 1
2. **Services are optional** - If a route is truly simple (1-2 lines), skip the service layer
3. **Use FastAPI dependencies** - `Depends()` is your friend for DI
4. **Test as you go** - Write a test for each endpoint immediately
5. **Document your API** - FastAPI generates docs automatically, but add descriptions

---

**Remember:** Clean code in a 5-day sprint means:
- ✅ Easy to find files
- ✅ Easy to add features
- ✅ Easy to debug
- ❌ NOT perfect abstraction
