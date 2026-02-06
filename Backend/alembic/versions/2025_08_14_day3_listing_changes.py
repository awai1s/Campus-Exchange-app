"""Day 3: Add images JSON, status, and updated_at to listings

Revision ID: day3_listing_changes
Revises: 3712609d63a7
Create Date: 2025-08-14
"""

from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect

# revision identifiers, used by Alembic.
revision: str = "day3_listing_changes"
down_revision: Union[str, Sequence[str], None] = "3712609d63a7"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    conn = op.get_bind()
    inspector = inspect(conn)
    columns = [col["name"] for col in inspector.get_columns("listings")]

    # Add images column if missing
    if "images" not in columns:
        op.add_column(
            "listings",
            sa.Column("images", sa.JSON(), nullable=True)
        )

    # Add status column if missing
    if "status" not in columns:
        op.add_column(
            "listings",
            sa.Column(
                "status",
                sa.String(length=20),
                nullable=False,
                server_default="ACTIVE"
            ),
        )
        op.create_index(
            op.f("ix_listings_status"), "listings", ["status"], unique=False
        )

    # Add updated_at column if missing
    if "updated_at" not in columns:
        op.add_column(
            "listings",
            sa.Column(
                "updated_at",
                sa.DateTime(timezone=True),
                server_default=sa.func.now(),
                onupdate=sa.func.now()
            ),
        )


def downgrade() -> None:
    conn = op.get_bind()
    inspector = inspect(conn)
    columns = [col["name"] for col in inspector.get_columns("listings")]

    if "updated_at" in columns:
        op.drop_column("listings", "updated_at")

    if "status" in columns:
        op.drop_index(op.f("ix_listings_status"), table_name="listings")
        op.drop_column("listings", "status")

    if "images" in columns:
        op.drop_column("listings", "images")
