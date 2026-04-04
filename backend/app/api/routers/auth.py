"""
Authentication routes.

Flow:
1. Client POSTs JSON validated by Pydantic (`UserSignup` / `UserLogin`).
2. Router asks the CRUD layer for database work, using a `Session` from `Depends(get_db)`.
3. Passwords are verified/hashed via `app.core.security` — never stored in plain text.

The session is opened per request by FastAPI's dependency injection and closed after the
response is built (see `get_db` in `app.core.database`).
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.core.security import create_access_token, hash_password, verify_password
from app.crud import crud_user
from app.schemas.auth import TokenWithUser, UserLogin, UserSignup
from app.schemas.user import UserPublic

router = APIRouter(prefix="/auth", tags=["authentication"])


def _normalize_email(email: str) -> str:
    return email.strip().lower()


@router.post(
    "/signup",
    response_model=TokenWithUser,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user account",
)
def signup(payload: UserSignup, db: Session = Depends(get_db)) -> TokenWithUser:
    email = _normalize_email(str(payload.email))

    if crud_user.get_user_by_email(db, email=email):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists.",
        )

    user = crud_user.create_user(
        db,
        email=email,
        hashed_password=hash_password(payload.password),
        pregnancy_week=payload.pregnancy_week,
    )

    access_token = create_access_token(subject=str(user.id))
    return TokenWithUser(
        access_token=access_token,
        user=UserPublic.model_validate(user),
    )


@router.post(
    "/login",
    response_model=TokenWithUser,
    summary="Obtain a JWT by email and password",
)
def login(payload: UserLogin, db: Session = Depends(get_db)) -> TokenWithUser:
    email = _normalize_email(str(payload.email))
    user = crud_user.get_user_by_email(db, email=email)

    if user is None or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
        )

    access_token = create_access_token(subject=str(user.id))
    return TokenWithUser(
        access_token=access_token,
        user=UserPublic.model_validate(user),
    )
