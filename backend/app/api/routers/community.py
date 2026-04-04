"""
Community forum routes — all handlers require a valid JWT (`get_current_user`).

Posts track `updated_at` when replies arrive so `GET /feed` can sort threads by recent activity.
Votes use `post_votes` with a unique (user, post) pair to block duplicate scoring.
"""

from typing import Annotated
import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.crud import crud_community
from app.models.user import User
from app.schemas.community import (
    PostCreate,
    PostFeedResponse,
    PostRead,
    PostVoteSubmit,
    ReplyCreate,
    ReplyRead,
)

router = APIRouter(prefix="/community", tags=["community"])

CurrentUser = Annotated[User, Depends(get_current_user)]


@router.post(
    "/posts",
    response_model=PostRead,
    status_code=status.HTTP_201_CREATED,
    summary="Create a forum post",
)
def create_post_route(
    current_user: CurrentUser,
    payload: PostCreate,
    db: Session = Depends(get_db),
) -> PostRead:
    post = crud_community.create_post(
        db,
        author_id=current_user.id,
        title=payload.title.strip(),
        body=payload.body.strip(),
        is_anonymous=payload.is_anonymous,
    )
    return PostRead.model_validate(post)


@router.post(
    "/posts/{post_id}/replies",
    response_model=ReplyRead,
    status_code=status.HTTP_201_CREATED,
    summary="Reply to a post",
)
def create_reply_route(
    current_user: CurrentUser,
    post_id: uuid.UUID,
    payload: ReplyCreate,
    db: Session = Depends(get_db),
) -> ReplyRead:
    reply = crud_community.create_reply(
        db,
        post_id=post_id,
        author_id=current_user.id,
        body=payload.body.strip(),
    )
    if reply is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")
    return ReplyRead.model_validate(reply)


@router.post(
    "/posts/{post_id}/vote",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Upvote, downvote, or clear your vote on a post",
)
def vote_on_post_route(
    current_user: CurrentUser,
    post_id: uuid.UUID,
    payload: PostVoteSubmit,
    db: Session = Depends(get_db),
) -> None:
    post = crud_community.get_post(db, post_id=post_id)
    if post is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")

    direction: int | None
    if payload.value == "up":
        direction = 1
    elif payload.value == "down":
        direction = -1
    else:
        direction = None

    crud_community.set_post_vote(
        db,
        user_id=current_user.id,
        post_id=post_id,
        direction=direction,
    )


@router.get(
    "/feed",
    response_model=PostFeedResponse,
    summary="Community feed sorted by recent activity",
)
def community_feed_route(
    current_user: CurrentUser,
    db: Session = Depends(get_db),
    limit: Annotated[int, Query(ge=1, le=100)] = 50,
) -> PostFeedResponse:
    posts = crud_community.get_feed_for_user(
        db, current_user_id=current_user.id, limit=limit
    )
    return PostFeedResponse(posts=posts)
