"""CRUD for community posts, replies, votes, and feed aggregation."""

from __future__ import annotations

import uuid
from datetime import UTC, datetime

from sqlalchemy import func, select
from sqlalchemy.orm import selectinload
from sqlalchemy.orm import Session

from app.models.post import Post
from app.models.post_vote import PostVote
from app.models.reply import Reply
from app.models.user import User
from app.schemas.community import PostFeedItem, ReplyFeedItem


def create_post(
    db: Session,
    *,
    author_id: uuid.UUID,
    title: str,
    body: str,
    is_anonymous: bool,
) -> Post:
    now = datetime.now(UTC)
    post = Post(
        author_id=author_id,
        title=title,
        body=body,
        is_anonymous=is_anonymous,
        created_at=now,
        updated_at=now,
    )
    db.add(post)
    db.commit()
    db.refresh(post)
    return post


def get_post(db: Session, *, post_id: uuid.UUID) -> Post | None:
    return db.get(Post, post_id)


def create_reply(
    db: Session,
    *,
    post_id: uuid.UUID,
    author_id: uuid.UUID,
    body: str,
) -> Reply | None:
    post = get_post(db, post_id=post_id)
    if post is None:
        return None
    reply = Reply(post_id=post_id, author_id=author_id, body=body)
    db.add(reply)
    post.updated_at = datetime.now(UTC)
    db.add(post)
    db.commit()
    db.refresh(reply)
    return reply


def set_post_vote(
    db: Session,
    *,
    user_id: uuid.UUID,
    post_id: uuid.UUID,
    direction: int | None,
) -> None:
    """
    direction: 1 up, -1 down, None removes vote.
    Relies on unique (user_id, post_id) for idempotent updates.
    """
    stmt = select(PostVote).where(
        PostVote.user_id == user_id,
        PostVote.post_id == post_id,
    )
    existing = db.execute(stmt).scalar_one_or_none()
    if direction is None:
        if existing:
            db.delete(existing)
            db.commit()
        return
    if existing:
        existing.direction = direction
        db.add(existing)
    else:
        db.add(PostVote(user_id=user_id, post_id=post_id, direction=direction))
    db.commit()


def get_feed_for_user(
    db: Session,
    *,
    current_user_id: uuid.UUID,
    limit: int = 50,
) -> list[PostFeedItem]:
    reply_count_sq = (
        select(func.count(Reply.id))
        .where(Reply.post_id == Post.id)
        .scalar_subquery()
    )
    up_count_sq = (
        select(func.count(PostVote.id))
        .where(PostVote.post_id == Post.id, PostVote.direction == 1)
        .scalar_subquery()
    )
    down_count_sq = (
        select(func.count(PostVote.id))
        .where(PostVote.post_id == Post.id, PostVote.direction == -1)
        .scalar_subquery()
    )
    my_vote_sq = (
        select(PostVote.direction)
        .where(
            PostVote.post_id == Post.id,
            PostVote.user_id == current_user_id,
        )
        .scalar_subquery()
    )

    stmt = (
        select(
            Post,
            User.email,
            User.is_verified_doctor,
            reply_count_sq.label("reply_count"),
            up_count_sq.label("upvote_count"),
            down_count_sq.label("downvote_count"),
            my_vote_sq.label("my_vote"),
        )
        .join(User, Post.author_id == User.id)
        .options(selectinload(Post.replies).selectinload(Reply.author))
        .order_by(Post.updated_at.desc())
        .limit(limit)
    )

    stmt = stmt.add_columns(User.user_role, User.display_name)

    rows = db.execute(stmt).all()
    out: list[PostFeedItem] = []
    for (
        post,
        email,
        is_verified_doctor,
        rc,
        uc,
        dc,
        mv,
        user_role,
        display_name,
    ) in rows:
        author_display = (
            "Anonymous"
            if post.is_anonymous
            else (display_name or _display_from_email(email))
        )
        author_id_out = None if post.is_anonymous else post.author_id
        # Anonymous posts never reveal the verified status; otherwise, treat
        # either is_verified_doctor=True or user_role='verified_professional'
        # as a verified author.
        verified_for_feed = (
            False
            if post.is_anonymous
            else bool(is_verified_doctor) or user_role == "verified_professional"
        )
        out.append(
            PostFeedItem(
                id=post.id,
                title=post.title,
                body=post.body,
                is_anonymous=post.is_anonymous,
                is_verified_doctor=verified_for_feed,
                created_at=post.created_at,
                updated_at=post.updated_at,
                last_activity_at=post.updated_at,
                reply_count=int(rc or 0),
                upvote_count=int(uc or 0),
                downvote_count=int(dc or 0),
                my_vote=int(mv) if mv is not None else None,
                author_display=author_display,
                author_id=author_id_out,
                replies=[
                    ReplyFeedItem(
                        id=reply.id,
                        body=reply.body,
                        created_at=reply.created_at,
                        author_display=(
                            reply.author.display_name
                            or _display_from_email(reply.author.email)
                        ),
                        author_id=reply.author_id,
                    )
                    for reply in post.replies
                ],
            )
        )
    return out


def _display_from_email(email: str) -> str:
    if "@" in email:
        return email.split("@", 1)[0]
    return email
