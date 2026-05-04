"""Add messaging and follow requests tables.

Revision ID: 20260503_06
Revises: 20260503_05
Create Date: 2026-05-03
"""

from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = "20260503_06"
down_revision: Union[str, None] = "20260503_05"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "messages",
        sa.Column("id", sa.Uuid(as_uuid=True), nullable=False),
        sa.Column("sender_id", sa.Uuid(as_uuid=True), nullable=False),
        sa.Column("recipient_id", sa.Uuid(as_uuid=True), nullable=False),
        sa.Column("body", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["sender_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["recipient_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_messages_sender_id"), "messages", ["sender_id"])
    op.create_index(op.f("ix_messages_recipient_id"), "messages", ["recipient_id"])

    op.create_table(
        "follow_requests",
        sa.Column("id", sa.Uuid(as_uuid=True), nullable=False),
        sa.Column("requester_id", sa.Uuid(as_uuid=True), nullable=False),
        sa.Column("post_id", sa.Uuid(as_uuid=True), nullable=False),
        sa.Column("request_type", sa.String(length=20), nullable=False),
        sa.Column("status", sa.String(length=20), nullable=False, server_default="pending"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["requester_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["post_id"], ["posts.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_follow_requests_requester_id"), "follow_requests", ["requester_id"])
    op.create_index(op.f("ix_follow_requests_post_id"), "follow_requests", ["post_id"])


def downgrade() -> None:
    op.drop_index(op.f("ix_follow_requests_post_id"), table_name="follow_requests")
    op.drop_index(op.f("ix_follow_requests_requester_id"), table_name="follow_requests")
    op.drop_table("follow_requests")
    op.drop_index(op.f("ix_messages_recipient_id"), table_name="messages")
    op.drop_index(op.f("ix_messages_sender_id"), table_name="messages")
    op.drop_table("messages")