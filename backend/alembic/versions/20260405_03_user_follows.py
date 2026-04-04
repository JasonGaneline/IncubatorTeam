"""User follow edges (composite PK, CASCADE on user delete).

Revision ID: 20260405_03
Revises: 20260404_02
Create Date: 2026-04-05

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "20260405_03"
down_revision: Union[str, None] = "20260404_02"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "user_follows",
        sa.Column("follower_id", sa.Uuid(), nullable=False),
        sa.Column("following_id", sa.Uuid(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["follower_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["following_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("follower_id", "following_id", name="pk_user_follows"),
    )
    op.create_index(
        op.f("ix_user_follows_follower_id"), "user_follows", ["follower_id"], unique=False
    )
    op.create_index(
        op.f("ix_user_follows_following_id"), "user_follows", ["following_id"], unique=False
    )


def downgrade() -> None:
    op.drop_index(op.f("ix_user_follows_following_id"), table_name="user_follows")
    op.drop_index(op.f("ix_user_follows_follower_id"), table_name="user_follows")
    op.drop_table("user_follows")
