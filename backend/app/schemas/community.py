"""Pydantic models for posts, replies, votes, and feed items."""

from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class PostCreate(BaseModel):
    title: str = Field(min_length=1, max_length=300)
    body: str = Field(min_length=1, max_length=20_000)
    is_anonymous: bool = False


class ReplyCreate(BaseModel):
    body: str = Field(min_length=1, max_length=10_000)


class PostVoteSubmit(BaseModel):
    """Set vote direction; use `none` to remove an existing vote."""

    value: Literal["up", "down", "none"]


class PostAuthorSnippet(BaseModel):
    """Safe author projection for non-anonymous posts."""

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    email: str


class PostRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    author_id: UUID
    title: str
    body: str
    is_anonymous: bool
    created_at: datetime
    updated_at: datetime


class ReplyRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    post_id: UUID
    author_id: UUID
    body: str
    created_at: datetime


class ReplyFeedItem(BaseModel):
    id: UUID
    body: str
    created_at: datetime
    author_display: str
    author_id: UUID | None = None


class PostFeedItem(BaseModel):
    """Single row in the community feed with aggregates."""

    id: UUID
    title: str
    body: str
    is_anonymous: bool
    is_verified_doctor: bool = False
    created_at: datetime
    updated_at: datetime
    last_activity_at: datetime
    reply_count: int
    upvote_count: int
    downvote_count: int
    # When the client is authenticated, their current vote: 1, -1, or None.
    my_vote: int | None = None
    # Either "Anonymous" or a display handle derived from the author record.
    author_display: str
    author_id: UUID | None = None
    replies: list[ReplyFeedItem] = []


class PostFeedResponse(BaseModel):
    posts: list[PostFeedItem]
