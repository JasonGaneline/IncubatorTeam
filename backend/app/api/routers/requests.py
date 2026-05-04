"""Anonymous follow-request inbox routes (post author approves/declines)."""

from typing import Annotated
import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.crud import crud_follow_request
from app.models.follow_request import FollowRequest
from app.models.post import Post
from app.models.user import User
from app.schemas.follow_request import FollowRequestCreate, FollowRequestRead

router = APIRouter(prefix="/requests", tags=["requests"])
CurrentUser = Annotated[User, Depends(get_current_user)]


@router.post("", response_model=FollowRequestRead, status_code=status.HTTP_201_CREATED)
def create_request(
    current_user: CurrentUser,
    payload: FollowRequestCreate,
    db: Session = Depends(get_db),
) -> FollowRequestRead:
    req = crud_follow_request.create_request(
        db,
        requester_id=current_user.id,
        post_id=payload.post_id,
        request_type=payload.request_type,
    )
    return FollowRequestRead.model_validate(req)


@router.get("", response_model=list[FollowRequestRead])
def get_requests(
    current_user: CurrentUser,
    db: Session = Depends(get_db),
) -> list[FollowRequestRead]:
    stmt = (
        select(FollowRequest)
        .join(Post, Post.id == FollowRequest.post_id)
        .where(Post.author_id == current_user.id, FollowRequest.status == "pending")
    )
    rows = db.execute(stmt).scalars().all()
    return [FollowRequestRead.model_validate(r) for r in rows]


@router.patch("/{request_id}", response_model=FollowRequestRead)
def update_request(
    current_user: CurrentUser,
    request_id: uuid.UUID,
    new_status: str = Query(..., alias="status", description="accepted | declined"),
    db: Session = Depends(get_db),
) -> FollowRequestRead:
    req = db.get(FollowRequest, request_id)
    if req is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Request not found")

    # Only the author of the post the request targets can act on it.
    target_post = db.get(Post, req.post_id)
    if target_post is None or target_post.author_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only act on requests for your own posts.",
        )

    if new_status not in {"accepted", "declined"}:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="status must be 'accepted' or 'declined'.",
        )

    updated = crud_follow_request.update_request_status(
        db,
        request_id=request_id,
        status=new_status,
    )
    return FollowRequestRead.model_validate(updated)
