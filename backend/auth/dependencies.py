# auth/dependencies.py
from fastapi import Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
from database import get_db
from models.users import User
from typing import Optional
import uuid

async def get_current_user(
    db: Session = Depends(get_db),
    x_user_id: Optional[str] = Header(None)
) -> User:
    """
    Get current user from X-User-Id header.
    Frontend should send user ID received from login endpoint.
    """
    
    if not x_user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User ID not provided. Please login first.",
        )
    
    try:
        # Convert string UUID to UUID object
        user_id = uuid.UUID(x_user_id)
    except (ValueError, AttributeError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid user ID format",
        )
    
    # Get user from database
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found. Please login again.",
        )
    
    return user
