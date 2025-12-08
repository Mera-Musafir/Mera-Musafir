# auth/dependencies.py
from fastapi import Depends, Header, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional
import uuid

from database import get_db
from models.users import User
from crud.users_crud import get_user_by_id

def get_current_user(
    db: Session = Depends(get_db),
    x_user_id: Optional[str] = Header(None, alias="X-User-Id"),
) -> User:
    """
    Lightweight 'current user' resolver.

    - Requires X-User-Id header (UUID as string).
    - Loads the corresponding user from DB.
    - No real token/session yet; the client is responsible for storing the user id after login.
    """
    if not x_user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="X-User-Id header missing",
        )

    try:
        user_uuid = uuid.UUID(x_user_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid X-User-Id header; must be a UUID string",
        )

    user = get_user_by_id(db, user_uuid)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found for given X-User-Id",
        )

    return user
