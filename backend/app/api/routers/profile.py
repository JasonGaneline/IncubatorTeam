"""
Authenticated profile routes for the signed-in user only.

`GET /profile/me` returns mood aggregates, follower counts, and safe user fields.
`PATCH /profile/me` updates profile fields (display name, bio, age, picture,
pregnancy week, role). The PATCH validator rejects setting the role to
`pregnant_woman` without a pregnancy week.

`PUT /users/me` is the spec-named alias of PATCH /profile/me; both accept the
same `ProfileUpdate` body and return `UserPublic`.

`GET /users/{user_id}/profile` returns public profile with follow status if
authenticated. `GET /users/search` searches users by display_name or email.
"""

from typing import Annotated
import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_current_user_optional, get_db
from app.crud import crud_profile, crud_user
from app.models.user import User
from app.models.user_follow import UserFollow
from app.schemas.profile import (
    ProfileUpdate,
    PublicUserProfileResponse,
    UserProfileResponse,
)
from app.schemas.user import UserPublic, UserSearchResult
from sqlalchemy import select

router = APIRouter(prefix="/profile", tags=["profile"])

CurrentUser = Annotated[User, Depends(get_current_user)]
OptionalCurrentUser = Annotated[User | None, Depends(get_current_user_optional)]


def _apply_profile_update(db: Session, user: User, payload: ProfileUpdate) -> User:
    """Shared writer used by both PATCH /profile/me and PUT /users/me.

    Enforces: when the *resulting* role is `pregnant_woman`, a pregnancy_week
    must be set (either in this payload or already on the user).
    """
    resulting_role = payload.user_role or user.user_role
    resulting_week = payload.pregnancy_week if payload.pregnancy_week is not None else user.pregnancy_week

    if resulting_role == "pregnant_woman" and resulting_week is None:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="pregnancy_week is required for the 'pregnant_woman' role.",
        )

    return crud_user.update_user_profile(
        db,
        user=user,
        display_name=payload.display_name,
        bio=payload.bio,
        age=payload.age,
        profile_picture=payload.profile_picture,
        pregnancy_week=payload.pregnancy_week,
        user_role=payload.user_role,
    )


@router.get("/me", response_model=UserProfileResponse, summary="Current user profile + stats")
def get_my_profile(
    current_user: CurrentUser,
    db: Session = Depends(get_db),
) -> UserProfileResponse:
    return crud_profile.build_profile_response(db, user=current_user)


@router.patch("/me", response_model=UserPublic, summary="Update profile (PATCH)")
def patch_profile(
    current_user: CurrentUser,
    payload: ProfileUpdate,
    db: Session = Depends(get_db),
) -> UserPublic:
    updated = _apply_profile_update(db, current_user, payload)
    return UserPublic.model_validate(updated)


@router.get(
    "/{user_id}",
    response_model=PublicUserProfileResponse,
    summary="Get public profile for any user",
)
def get_public_profile(
    user_id: uuid.UUID,
    current_user: OptionalCurrentUser = None,
    db: Session = Depends(get_db),
) -> PublicUserProfileResponse:
    """Get public profile for a user. Current user's follow status included if authenticated."""
    user = crud_user.get_user_by_id(db, user_id=user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    current_user_id = current_user.id if current_user else None
    return crud_profile.build_public_profile_response(
        db,
        user=user,
        current_user_id=current_user_id,
    )


@router.get("/followers/{user_id}", response_model=list[UserPublic])
def get_followers(user_id: uuid.UUID, db: Session = Depends(get_db)) -> list[UserPublic]:
    stmt = (
        select(User)
        .join(UserFollow, User.id == UserFollow.follower_id)
        .where(UserFollow.following_id == user_id)
    )
    followers = db.execute(stmt).scalars().all()
    return [UserPublic.model_validate(u) for u in followers]


@router.get("/following/{user_id}", response_model=list[UserPublic])
def get_following(user_id: uuid.UUID, db: Session = Depends(get_db)) -> list[UserPublic]:
    """Users this profile follows (edges where follower_id == user_id)."""
    stmt = (
        select(User)
        .join(UserFollow, User.id == UserFollow.following_id)
        .where(UserFollow.follower_id == user_id)
    )
    following = db.execute(stmt).scalars().all()
    return [UserPublic.model_validate(u) for u in following]


# Separate router for /users endpoints (mounted at /api/v1/users in main.py).
users_router = APIRouter(prefix="/users", tags=["users"])


@users_router.get(
    "/search",
    response_model=list[UserSearchResult],
    summary="Search users by display name or email",
)
def search_users_route(
    q: str = Query(..., min_length=1, max_length=100, description="Search query"),
    limit: int = Query(20, ge=1, le=100, description="Max results to return"),
    db: Session = Depends(get_db),
) -> list[UserSearchResult]:
    """
    Search for users by display_name or email (case-insensitive).

    Query parameter `q` is required and must be 1-100 characters.
    """
    results = crud_user.search_users(db, query=q, limit=limit)
    return [UserSearchResult.model_validate(user) for user in results]


@users_router.put(
    "/me",
    response_model=UserPublic,
    summary="Update the current user's profile (spec-named alias of PATCH /profile/me)",
)
def put_users_me(
    current_user: CurrentUser,
    payload: ProfileUpdate,
    db: Session = Depends(get_db),
) -> UserPublic:
    updated = _apply_profile_update(db, current_user, payload)
    return UserPublic.model_validate(updated)


@users_router.get(
    "/me",
    response_model=UserPublic,
    summary="Get the current user (lightweight, no aggregates)",
)
def get_users_me(current_user: CurrentUser) -> UserPublic:
    return UserPublic.model_validate(current_user)
