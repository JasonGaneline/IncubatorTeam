"""
FastAPI dependencies shared across routers.

`get_db` yields a SQLAlchemy session per request.

`get_current_user` validates the `Authorization: Bearer <jwt>` header, loads the user row,
and is reused on every protected route so JWT handling stays in one place.
"""

from typing import Annotated
import uuid

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import decode_access_token
from app.crud import crud_user
from app.models.user import User

security = HTTPBearer()


def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(security)],
    db: Session = Depends(get_db),
) -> User:
    token = credentials.credentials
    payload = decode_access_token(token)
    if payload is None or payload.get("sub") is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    try:
        user_id = uuid.UUID(str(payload["sub"]))
    except (ValueError, TypeError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token subject",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = crud_user.get_user_by_id(db, user_id=user_id)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User no longer exists",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user


def get_current_user_optional(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(HTTPBearer(auto_error=False))] = None,
    db: Session = Depends(get_db),
) -> User | None:
    """Optional authentication — returns None if not authenticated, or the User if valid."""
    if credentials is None:
        return None

    token = credentials.credentials
    payload = decode_access_token(token)
    if payload is None or payload.get("sub") is None:
        # Silently ignore invalid tokens for optional auth
        return None

    try:
        user_id = uuid.UUID(str(payload["sub"]))
    except (ValueError, TypeError):
        return None

    user = crud_user.get_user_by_id(db, user_id=user_id)
    return user  # Returns None if user not found


__all__ = ["get_db", "get_current_user", "get_current_user_optional", "security"]
