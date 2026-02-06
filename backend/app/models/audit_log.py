from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.db.session import Base

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    action = Column(String, nullable=False) # "DELETE_POST", "PIN_POST"
    admin_id = Column(Integer, ForeignKey("users.id"))
    target_id = Column(Integer) # Post ID or Comment ID
    target_type = Column(String) # "post", "comment"
    details = Column(String, nullable=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
