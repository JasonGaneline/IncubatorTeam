"""Mood check-ins and community tables.

Revision ID: 20260404_02
Revises: 20260403_01
Create Date: 2026-04-04

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "20260404_02"
down_revision: Union[str, None] = "20260403_01"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "mood_check_ins",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("user_id", sa.Uuid(), nullable=False),
        sa.Column("mood_evaluation", sa.String(length=64), nullable=False),
        sa.Column("reflection_text", sa.Text(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_mood_check_ins_user_id"), "mood_check_ins", ["user_id"], unique=False
    )

    op.create_table(
        "posts",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("author_id", sa.Uuid(), nullable=False),
        sa.Column("title", sa.String(length=300), nullable=False),
        sa.Column("body", sa.Text(), nullable=False),
        sa.Column("is_anonymous", sa.Boolean(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["author_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_posts_author_id"), "posts", ["author_id"], unique=False)

    op.create_table(
        "replies",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("post_id", sa.Uuid(), nullable=False),
        sa.Column("author_id", sa.Uuid(), nullable=False),
        sa.Column("body", sa.Text(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["author_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["post_id"], ["posts.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_replies_author_id"), "replies", ["author_id"], unique=False)
    op.create_index(op.f("ix_replies_post_id"), "replies", ["post_id"], unique=False)

    op.create_table(
        "post_votes",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("user_id", sa.Uuid(), nullable=False),
        sa.Column("post_id", sa.Uuid(), nullable=False),
        sa.Column("direction", sa.Integer(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["post_id"], ["posts.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id", "post_id", name="uq_post_votes_user_post"),
    )
    op.create_index(op.f("ix_post_votes_post_id"), "post_votes", ["post_id"], unique=False)
    op.create_index(op.f("ix_post_votes_user_id"), "post_votes", ["user_id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_post_votes_user_id"), table_name="post_votes")
    op.drop_index(op.f("ix_post_votes_post_id"), table_name="post_votes")
    op.drop_table("post_votes")
    op.drop_index(op.f("ix_replies_post_id"), table_name="replies")
    op.drop_index(op.f("ix_replies_author_id"), table_name="replies")
    op.drop_table("replies")
    op.drop_index(op.f("ix_posts_author_id"), table_name="posts")
    op.drop_table("posts")
    op.drop_index(op.f("ix_mood_check_ins_user_id"), table_name="mood_check_ins")
    op.drop_table("mood_check_ins")
