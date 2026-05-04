"""Add profile fields to users.

Revision ID: 20260504_08
Revises: 20260503_07
Create Date: 2026-05-04
"""

from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = "20260504_08"
down_revision: Union[str, None] = "20260503_07"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("users", sa.Column("bio", sa.Text(), nullable=True))
    op.add_column("users", sa.Column("age", sa.Integer(), nullable=True))
    op.add_column("users", sa.Column("profile_picture", sa.String(length=500), nullable=True))


def downgrade() -> None:
    op.drop_column("users", "profile_picture")
    op.drop_column("users", "age")
    op.drop_column("users", "bio")
