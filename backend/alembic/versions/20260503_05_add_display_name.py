"""Add display_name to users for user search functionality.

Revision ID: 20260503_05
Revises: 20260423_04
Create Date: 2026-05-03
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "20260503_05"
down_revision: Union[str, None] = "20260423_04"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "users",
        sa.Column("display_name", sa.String(length=150), nullable=True),
    )
    op.create_index(
        op.f("ix_users_display_name"),
        "users",
        ["display_name"],
    )


def downgrade() -> None:
    op.drop_index(op.f("ix_users_display_name"), table_name="users")
    op.drop_column("users", "display_name")
