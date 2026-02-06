from pydantic import BaseModel, model_validator
from datetime import datetime
from typing import Optional
from app.schemas.user import UserBasic


class PostBase(BaseModel):
    title: str
    content: str
    is_pinned: bool = False
    pinned_until: Optional[datetime] = None
    department: str
    type: str = "discussion"
    tags: Optional[str] = None
    is_anonymous: bool = False

class PostCreate(PostBase):
    pass

class PostUpdate(PostBase):
    title: Optional[str] = None
    content: Optional[str] = None
    department: Optional[str] = None
    type: Optional[str] = None

class Post(PostBase):
    id: int
    created_at: datetime
    author_id: Optional[int] = None
    author: Optional[UserBasic] = None
    
    # Vote info
    upvotes: int = 0
    downvotes: int = 0
    comments_count: int = 0
    share_count: int = 0  # Track share popularity
    user_vote: Optional[int] = None # 1, -1, or None (if not voted)
    
    # Validator removed to handle redaction in API (for Admin Unmasking)


    class Config:
        from_attributes = True
