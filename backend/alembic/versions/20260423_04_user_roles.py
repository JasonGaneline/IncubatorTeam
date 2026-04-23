"""Add user_role to users.

Revision ID: 20260423_04
Revises: 20260405_03
Create Date: 2026-04-23
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "20260423_04"
down_revision: Union[str, None] = "20260405_03"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "users",
        sa.Column(
            "user_role",
            sa.String(length=64),
            nullable=False,
            server_default="information_only",
        ),
    )
    op.alter_column("users", "user_role", server_default=None)


def downgrade() -> None:
    op.drop_column("users", "user_role")
