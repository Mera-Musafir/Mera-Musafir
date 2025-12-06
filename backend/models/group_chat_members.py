from sqlalchemy import Column, Integer, ForeignKey, DateTime, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class GroupChatMember(Base):
    __tablename__ = "group_chat_members"

    id = Column(Integer, primary_key=True, index=True)
    chat_id = Column(Integer, ForeignKey("group_chats.id"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    joined_at = Column(DateTime, default=datetime.utcnow)
    
    # Ensure unique user per chat
    __table_args__ = (UniqueConstraint('chat_id', 'user_id', name='unique_chat_member'),)
    
    # Relationships
    chat = relationship("GroupChat", back_populates="members")
    user = relationship("User", back_populates="chat_memberships")
