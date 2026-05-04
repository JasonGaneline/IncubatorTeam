"""CRUD helpers for direct messages.

Schema:
    messages(..., chat_request_status NULL | 'pending' | 'declined')
"""

from __future__ import annotations

import uuid
from typing import NamedTuple

from sqlalchemy import and_, case, func, or_, select, update
from sqlalchemy.orm import Session

from app.crud import crud_follow
from app.models.message import Message
from app.models.user import User
from app.schemas.message import ConversationThreadMeta

CHAT_PENDING = "pending"
CHAT_DECLINED = "declined"


class ConversationRow(NamedTuple):
    peer: User
    last_message: str
    last_created_at: object
    unread_count: int


def user_is_verified_professional(user: User) -> bool:
    return user.user_role == "verified_professional" or bool(user.is_verified_doctor)


def mutual_follow_exists(db: Session, *, a_id: uuid.UUID, b_id: uuid.UUID) -> bool:
    return crud_follow.is_following(db, follower_id=a_id, following_id=b_id) and crud_follow.is_following(
        db, follower_id=b_id, following_id=a_id
    )


def has_pending_request(db: Session, *, sender_id: uuid.UUID, receiver_id: uuid.UUID) -> bool:
    stmt = (
        select(Message.id)
        .where(
            Message.sender_id == sender_id,
            Message.receiver_id == receiver_id,
            Message.chat_request_status == CHAT_PENDING,
        )
        .limit(1)
    )
    return db.execute(stmt).scalar_one_or_none() is not None


def has_declined_request(db: Session, *, sender_id: uuid.UUID, receiver_id: uuid.UUID) -> bool:
    stmt = (
        select(Message.id)
        .where(
            Message.sender_id == sender_id,
            Message.receiver_id == receiver_id,
            Message.chat_request_status == CHAT_DECLINED,
        )
        .limit(1)
    )
    return db.execute(stmt).scalar_one_or_none() is not None


def clear_pending_if_mutual(db: Session, *, user_id: uuid.UUID, peer_id: uuid.UUID) -> None:
    """Normalize pending flags when both users follow each other."""
    if not mutual_follow_exists(db, a_id=user_id, b_id=peer_id):
        return
    stmt = (
        update(Message)
        .where(
            or_(
                and_(Message.sender_id == user_id, Message.receiver_id == peer_id),
                and_(Message.sender_id == peer_id, Message.receiver_id == user_id),
            ),
            Message.chat_request_status == CHAT_PENDING,
        )
        .values(chat_request_status=None)
    )
    db.execute(stmt)
    db.commit()


def clear_pending_for_pair(db: Session, *, sender_id: uuid.UUID, receiver_id: uuid.UUID) -> int:
    stmt = (
        update(Message)
        .where(
            Message.sender_id == sender_id,
            Message.receiver_id == receiver_id,
            Message.chat_request_status == CHAT_PENDING,
        )
        .values(chat_request_status=None)
    )
    res = db.execute(stmt)
    db.commit()
    return res.rowcount or 0


def mark_pending_declined(db: Session, *, sender_id: uuid.UUID, receiver_id: uuid.UUID) -> int:
    stmt = (
        update(Message)
        .where(
            Message.sender_id == sender_id,
            Message.receiver_id == receiver_id,
            Message.chat_request_status == CHAT_PENDING,
        )
        .values(chat_request_status=CHAT_DECLINED)
    )
    res = db.execute(stmt)
    db.commit()
    return res.rowcount or 0


def compute_can_send(
    db: Session,
    *,
    sender_id: uuid.UUID,
    receiver: User,
) -> tuple[bool, str | None]:
    """Return (allowed, error_message) for sender -> receiver."""
    peer_id = receiver.id
    if sender_id == peer_id:
        return False, "You cannot message yourself."

    mutual = mutual_follow_exists(db, a_id=sender_id, b_id=peer_id)
    if mutual:
        return True, None

    sender_follows = crud_follow.is_following(db, follower_id=sender_id, following_id=peer_id)

    if user_is_verified_professional(receiver):
        if sender_follows:
            return True, None
        return False, "Follow this user to message them."

    if not sender_follows:
        return False, "Follow this user to message them."

    if has_declined_request(db, sender_id=sender_id, receiver_id=peer_id):
        return (
            False,
            "This user declined your chat request. You can message again once you both follow each other.",
        )

    return True, None


def build_thread_meta(
    db: Session,
    *,
    current_user_id: uuid.UUID,
    peer: User,
) -> ConversationThreadMeta:
    peer_id = peer.id
    i_follow = crud_follow.is_following(db, follower_id=current_user_id, following_id=peer_id)
    peer_follows_me = crud_follow.is_following(db, follower_id=peer_id, following_id=current_user_id)
    mutual = i_follow and peer_follows_me
    peer_prof = user_is_verified_professional(peer)

    outgoing_pending = has_pending_request(db, sender_id=current_user_id, receiver_id=peer_id)
    incoming_pending = has_pending_request(db, sender_id=peer_id, receiver_id=current_user_id)
    had_declined = has_declined_request(db, sender_id=current_user_id, receiver_id=peer_id)
    outgoing_declined = bool(had_declined and not mutual)

    can_send, reason = compute_can_send(db, sender_id=current_user_id, receiver=peer)

    return ConversationThreadMeta(
        i_follow_peer=i_follow,
        peer_follows_me=peer_follows_me,
        mutual_follow=mutual,
        peer_is_verified_professional=peer_prof,
        outgoing_request_pending=outgoing_pending,
        incoming_request_pending=incoming_pending,
        outgoing_request_declined=outgoing_declined,
        can_send=can_send,
        send_disabled_reason=reason,
    )


def create_message(
    db: Session,
    *,
    sender_id: uuid.UUID,
    receiver_id: uuid.UUID,
    content: str,
    chat_request_status: str | None = None,
) -> Message:
    msg = Message(
        sender_id=sender_id,
        receiver_id=receiver_id,
        content=content,
        chat_request_status=chat_request_status,
    )
    db.add(msg)
    db.commit()
    db.refresh(msg)
    return msg


def get_conversation(
    db: Session,
    *,
    user_id: uuid.UUID,
    other_user_id: uuid.UUID,
    limit: int = 200,
) -> list[Message]:
    """Return messages between user_id and other_user_id (oldest -> newest)."""
    stmt = (
        select(Message)
        .where(
            or_(
                and_(Message.sender_id == user_id, Message.receiver_id == other_user_id),
                and_(Message.sender_id == other_user_id, Message.receiver_id == user_id),
            )
        )
        .order_by(Message.created_at.asc())
        .limit(limit)
    )
    return list(db.execute(stmt).scalars().all())


def mark_conversation_read(
    db: Session,
    *,
    reader_id: uuid.UUID,
    peer_id: uuid.UUID,
) -> int:
    """Mark every message *to* `reader_id` *from* `peer_id` as read. Returns # rows updated."""
    stmt = (
        update(Message)
        .where(
            Message.receiver_id == reader_id,
            Message.sender_id == peer_id,
            Message.is_read.is_(False),
        )
        .values(is_read=True)
    )
    result = db.execute(stmt)
    db.commit()
    return result.rowcount or 0


def list_conversations(
    db: Session,
    *,
    user_id: uuid.UUID,
) -> list[ConversationRow]:
    """One row per conversation partner with the most recent message preview + unread count."""
    peer_id_expr = case(
        (Message.sender_id == user_id, Message.receiver_id),
        else_=Message.sender_id,
    ).label("peer_id")

    base = (
        select(
            peer_id_expr,
            Message.content,
            Message.created_at,
            Message.is_read,
            Message.receiver_id,
            Message.sender_id,
        )
        .where(or_(Message.sender_id == user_id, Message.receiver_id == user_id))
        .subquery()
    )

    latest_stmt = (
        select(base.c.peer_id, func.max(base.c.created_at).label("last_created_at"))
        .group_by(base.c.peer_id)
        .subquery()
    )

    last_message_stmt = (
        select(base.c.peer_id, base.c.content, base.c.created_at)
        .join(
            latest_stmt,
            and_(
                base.c.peer_id == latest_stmt.c.peer_id,
                base.c.created_at == latest_stmt.c.last_created_at,
            ),
        )
        .subquery()
    )

    unread_stmt = (
        select(
            Message.sender_id.label("peer_id"),
            func.count().label("unread_count"),
        )
        .where(Message.receiver_id == user_id, Message.is_read.is_(False))
        .group_by(Message.sender_id)
        .subquery()
    )

    final_stmt = (
        select(
            User,
            last_message_stmt.c.content,
            last_message_stmt.c.created_at,
            func.coalesce(unread_stmt.c.unread_count, 0),
        )
        .join(last_message_stmt, User.id == last_message_stmt.c.peer_id)
        .join(unread_stmt, User.id == unread_stmt.c.peer_id, isouter=True)
        .order_by(last_message_stmt.c.created_at.desc())
    )

    rows = db.execute(final_stmt).all()
    return [
        ConversationRow(
            peer=peer,
            last_message=last_content,
            last_created_at=last_created_at,
            unread_count=unread,
        )
        for peer, last_content, last_created_at, unread in rows
    ]
