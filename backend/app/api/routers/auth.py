"""
Authentication routes.

Flow:
1. Client POSTs JSON validated by Pydantic (`UserSignup` / `UserLogin`).
2. Router asks the CRUD layer for database work, using a `Session` from `Depends(get_db)`.
3. Passwords are verified/hashed via `app.core.security` — never stored in plain text.

The session is opened per request by FastAPI's dependency injection and closed after the
response is built (see `get_db` in `app.core.database`).
"""

import secrets
import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.core.config import get_settings
from app.core.security import create_access_token, create_refresh_token, hash_password, verify_password, decode_refresh_token
from app.crud import crud_user
from app.schemas.auth import GoogleAuthRequest, RefreshTokenRequest, TokenWithRefresh, TokenWithUser, UserLogin, UserSignup
from app.schemas.user import UserPublic

router = APIRouter(prefix="/auth", tags=["authentication"])


def _normalize_email(email: str) -> str:
    return email.strip().lower()


def _issue_token_with_user(user) -> TokenWithUser:
    access_token = create_access_token(
        subject=str(user.id),
        extra_claims={"auth_provider": "google"},
    )
    refresh_token = create_refresh_token(subject=str(user.id))
    return TokenWithUser(
        access_token=access_token,
        refresh_token=refresh_token,
        user=UserPublic.model_validate(user),
    )


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
        user_role=payload.user_role,
        pregnancy_week=payload.pregnancy_week,
    )

    access_token = create_access_token(subject=str(user.id))
    refresh_token = create_refresh_token(subject=str(user.id))
    return TokenWithUser(
        access_token=access_token,
        refresh_token=refresh_token,
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
    refresh_token = create_refresh_token(subject=str(user.id))
    return TokenWithUser(
        access_token=access_token,
        refresh_token=refresh_token,
        user=UserPublic.model_validate(user),
    )


@router.post(
    "/google",
    response_model=TokenWithUser,
    summary="Authenticate with a Google popup credential",
)
def google_auth(
    payload: GoogleAuthRequest,
    db: Session = Depends(get_db),
) -> TokenWithUser:
    settings = get_settings()

    if not settings.GOOGLE_CLIENT_ID:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="GOOGLE_CLIENT_ID is not configured on the API.",
        )

    try:
        # Verify the credential with Google before trusting the email it contains.
        google_profile = id_token.verify_oauth2_token(
            payload.credential,
            google_requests.Request(),
            settings.GOOGLE_CLIENT_ID,
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Google credential could not be verified.",
        ) from exc

    email = _normalize_email(str(google_profile.get("email", "")))
    email_verified = bool(google_profile.get("email_verified"))

    if not email or not email_verified:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Google did not return a verified email address.",
        )

    user = crud_user.get_user_by_email(db, email=email)

    if user is None:
        # We still fill `hashed_password` because the current schema expects it.
        # A random secret keeps Google-only accounts from having a blank password.
        user = crud_user.create_user(
            db,
            email=email,
            hashed_password=hash_password(secrets.token_urlsafe(32)),
            user_role="information_only",
            pregnancy_week=None,
        )

    return _issue_token_with_user(user)


@router.post(
    "/refresh",
    response_model=TokenWithRefresh,
    summary="Obtain a new access token using a refresh token",
)
def refresh(
    payload: RefreshTokenRequest,
    db: Session = Depends(get_db),
) -> TokenWithRefresh:
    """
    Exchange a valid refresh token for a new access token.
    Refresh tokens are longer-lived and can be used when the access token expires.
    """
    refresh_payload = decode_refresh_token(payload.refresh_token)

    if refresh_payload is None or refresh_payload.get("sub") is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        user_id = uuid.UUID(str(refresh_payload["sub"]))
    except (ValueError, TypeError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token subject",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = crud_user.get_user_by_id(db, user_id=user_id)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User no longer exists",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Issue a fresh access token (refresh token remains valid)
    access_token = create_access_token(subject=str(user.id))
    new_refresh_token = create_refresh_token(subject=str(user.id))

    return TokenWithRefresh(
        access_token=access_token,
        refresh_token=new_refresh_token,
    )


@router.post(
    "/logout",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Logout the current user session",
)
def logout() -> None:
    """
    Logout endpoint. For stateless JWT auth, this is mainly a frontend operation
    (clear tokens from localStorage). This endpoint exists for API consistency
    and potential future stateful token blacklisting.
    """
    # In a stateless JWT system, the server doesn't maintain sessions.
    # The frontend clears the tokens. This endpoint could be extended
    # to maintain a blacklist or revocation list in the future.
    return None
