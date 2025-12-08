# routers/auth_router.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from schemas.users import UserCreate, UserLogin, UserResponse
from crud.users_crud import get_user_by_email, create_user, authenticate_user, log_event

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/signup", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def signup(user_data: UserCreate, db: Session = Depends(get_db)):
    """
    Create a new user with name, email, password.
    Fails if email already exists.
    """
    existing = get_user_by_email(db, user_data.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists",
        )

    user = create_user(db, user_data)

    # Log analytics event
    log_event(db, user_id=user.id, event_type="signup")

    return user


@router.post("/login", response_model=UserResponse)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    """
    Basic login: checks email + password.
    Returns the user if valid.
    The frontend should store user.id and send it in X-User-Id for subsequent calls.
    """
    user = authenticate_user(db, credentials.email, credentials.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    # Log analytics event
    log_event(db, user_id=user.id, event_type="login")

    return user
