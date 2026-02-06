from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session, joinedload
from app.db.session import get_db
from app.api.auth import get_current_user
from app.models.user import User
from app.models.post import Post as PostModel
from app.schemas.post import Post, PostCreate
from app.crud import post as crud_post
from app.core.socket_manager import manager

router = APIRouter()

from app.api.auth import get_current_user # Keep for delete_post
from app.api.deps import get_current_user_optional, get_current_admin

# ... imports ...

from datetime import datetime, timedelta
from sqlalchemy import or_, desc, case, func
import traceback

# ...

@router.get("/", response_model=List[Post])
def read_posts(
    skip: int = 0, 
    limit: int = 100, 
    department: Optional[str] = None,
    tags: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    try:
        query = db.query(PostModel)
        
        if department and department != 'ALL':
            query = query.filter(PostModel.department == department)
            
        if tags:
            query = query.filter(PostModel.tags.ilike(f"%{tags}%"))
            
        # Temporal Pinning Logic:
        # A post is "effectively pinned" if is_pinned=True AND (pinned_until IS NULL OR pinned_until > now)
        # using func.now() avoids python/db timezone mismatches
        db_now = func.now()
        
        # Create a custom sort expression (1 for pinned, 0 for regular)
        is_effectively_pinned = case(
            (
                (PostModel.is_pinned == True) & 
                ((PostModel.pinned_until == None) | (PostModel.pinned_until > db_now)), 
                1
            ),
            else_=0
        )

        # Order by Effective Pin first, then Created At
        posts = query.options(joinedload(PostModel.author))\
            .order_by(desc(is_effectively_pinned), PostModel.created_at.desc())\
            .offset(skip).limit(limit).all()

        # Redaction Logic
        # For python-side comparison, we ideally need timezone aware if DB is aware.
        # But for UI logic, we can just skip the expired cleanup visualization for now if it's complex,
        # or safely handle it.
        now = datetime.utcnow()
        for post in posts:
            if post.is_anonymous:
                if not current_user or current_user.role != "admin":
                   post.author = None
                   post.author_id = None
        
        return posts
        
    except Exception as e:
        print(f"ERROR in read_posts: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

# ... create_post ... # ... read_post ... # ... delete_post ...

@router.put("/{post_id}/unpin", response_model=Post)
def unpin_post(
    post_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """
    Unpin a post.
    """
    post = crud_post.get_post(db, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
        
    post.is_pinned = False
    post.pinned_until = None
    
    # Audit Log
    log = AuditLog(
        action="UNPIN_POST",
        admin_id=admin.id,
        target_id=post.id,
        target_type="post",
        details=f"Unpinned post '{post.title[:20]}...'"
    )
    db.add(log)
    
    db.commit()
    db.refresh(post)
    return post

@router.post("/", response_model=Post, status_code=status.HTTP_201_CREATED)
def create_post(
    post: PostCreate, 
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Ensure current_user is valid (it should be due to Depends)
    # Auto-tagging logic
    content_lower = (post.title + " " + post.content).lower()
    
    academic_keywords = ['exam', 'syllabus', 'deadline', 'assignment', 'lecture', 'professor', 'quiz', 'lab', 'viva']
    event_keywords = ['fest', 'hackathon', 'workshop', 'register', 'ticket', 'club', 'party', 'seminar', 'webinar']
    
    auto_tags = []
    if any(k in content_lower for k in academic_keywords):
        auto_tags.append("Academic")
    if any(k in content_lower for k in event_keywords):
        auto_tags.append("Event")
        
    if auto_tags:
        current_tags = post.tags.split(',') if post.tags else []
        # Filter empty strings and strip whitespace
        current_tags = [t.strip() for t in current_tags if t.strip()]
        # Add new unique tags
        for t in auto_tags:
            if t not in current_tags:
                current_tags.append(t)
        post.tags = ",".join(current_tags)

    new_post = crud_post.create_post(db=db, post=post, author_id=current_user.id)
    
    # Broadcast new post
    # Create a simple representation for broadcast
    post_data = {
        "id": new_post.id,
        "title": new_post.title,
        "content": new_post.content,
        "department": new_post.department,
        "type": new_post.type,
        "created_at": new_post.created_at.isoformat() if new_post.created_at else None,
        "upvotes": 0,
        "downvotes": 0,
        "user_vote": None,
        "comments_count": 0,
        "author": None if new_post.is_anonymous else {
            "id": new_post.author.id,
            "full_name": new_post.author.full_name,
            "username": new_post.author.username,
            "email": new_post.author.email,
            "profile_photo_url": new_post.author.profile_photo_url,
            "role": new_post.author.role,
            "enrollment_number": new_post.author.enrollment_number
        },
        "author_id": None if new_post.is_anonymous else new_post.author.id,
        "is_anonymous": new_post.is_anonymous,
        "tags": new_post.tags
    }
    
    background_tasks.add_task(manager.broadcast, {
        "type": "new_post",
        "data": post_data
    })
    
    return new_post

@router.get("/{post_id}", response_model=Post)
def read_post(
    post_id: int, 
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    db_post = crud_post.get_post(db, post_id=post_id)
    if db_post is None:
        raise HTTPException(status_code=404, detail="Post not found")
        
    if db_post.is_anonymous:
        if not current_user or current_user.role != "admin":
            db_post.author = None
            db_post.author_id = None
            
    return db_post

from app.models.audit_log import AuditLog

# ...

@router.delete("/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_post(
    post_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    post = crud_post.get_post(db, post_id=post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    # Strict ownership check (Admin Bypass)
    if post.author_id != current_user.id:
        if current_user.role != "admin":
             raise HTTPException(status_code=403, detail="You are not allowed to delete this post")
        else:
             # Admin Delete Audit Log
             log = AuditLog(
                 action="DELETE_POST",
                 admin_id=current_user.id,
                 target_id=post.id,
                 target_type="post",
                 details=f"Deleted post '{post.title[:20]}...' by author ID {post.author_id}"
             )
             db.add(log)
        
    crud_post.delete_post(db=db, post_id=post_id)
    return None

# Simple in-memory rate limiting for shares (5 per minute per user)
from collections import defaultdict
import time

share_rate_limits: dict = defaultdict(list)

@router.patch("/{post_id}/share", status_code=status.HTTP_200_OK)
def increment_share_count(
    post_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """
    Smart Share: Increment share count with rate limiting.
    Max 5 shares per user per minute to prevent spam.
    """
    # Rate limiting check
    user_key = str(current_user.id) if current_user else "anonymous"
    current_time = time.time()
    
    # Clean old entries (older than 60 seconds)
    share_rate_limits[user_key] = [
        t for t in share_rate_limits[user_key] if current_time - t < 60
    ]
    
    # Check limit (5 per minute)
    if len(share_rate_limits[user_key]) >= 5:
        raise HTTPException(
            status_code=429, 
            detail="Too many shares. Please wait a minute before sharing again."
        )
    
    # Find post
    post = crud_post.get_post(db, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    # Increment share count
    post.share_count = (post.share_count or 0) + 1
    db.commit()
    db.refresh(post)
    
    # Record this share for rate limiting
    share_rate_limits[user_key].append(current_time)
    
    return {"share_count": post.share_count, "message": "Share counted!"}

@router.put("/{post_id}/pin", response_model=Post)
def pin_post(
    post_id: int,
    duration: str = "infinite", # 24h, 7d, 30d, infinite
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """
    Temporal Pinning: Admins can pin posts for a specific duration.
    """
    post = crud_post.get_post(db, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
        
    post.is_pinned = True
    
    # Calculate Expiration
    if duration == "24h":
        post.pinned_until = datetime.utcnow() + timedelta(hours=24)
    elif duration == "7d":
        post.pinned_until = datetime.utcnow() + timedelta(days=7)
    elif duration == "30d":
        post.pinned_until = datetime.utcnow() + timedelta(days=30)
    else: # infinite
        post.pinned_until = None
    
    # Audit Log
    log = AuditLog(
        action="PIN_POST",
        admin_id=admin.id,
        target_id=post.id,
        target_type="post",
        details=f"Pinned post '{post.title[:20]}...' for {duration}"
    )
    db.add(log)
    
    db.commit()
    db.refresh(post)
    return post
