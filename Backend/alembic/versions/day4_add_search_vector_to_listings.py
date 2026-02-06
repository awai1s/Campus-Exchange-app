"""Day 4: Add search_vector column and full-text search setup to listings

Revision ID: day4_add_search_vector
Revises: day3_listing_changes
Create Date: 2025-08-15
"""

from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
from sqlalchemy import inspect


# revision identifiers, used by Alembic.
revision: str = "day4_add_search_vector"
down_revision: Union[str, Sequence[str], None] = "day3_listing_changes"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    conn = op.get_bind()
    inspector = inspect(conn)
    columns = [col["name"] for col in inspector.get_columns("listings")]

    # Add search_vector column if missing
    if "search_vector" not in columns:
        op.add_column(
            "listings",
            sa.Column("search_vector", postgresql.TSVECTOR(), nullable=True)
        )

    # Populate search_vector from existing data
    op.execute(
        """
        UPDATE listings
        SET search_vector = to_tsvector('english', coalesce(title,'') || ' ' || coalesce(description,''));
        """
    )

    # Create GIN index on search_vector column
    op.execute(
        """
        CREATE INDEX IF NOT EXISTS listings_search_vector_idx ON listings USING GIN (search_vector);
        """
    )

    # Create trigger function to update search_vector on INSERT/UPDATE
    op.execute(
        """
        CREATE OR REPLACE FUNCTION listings_search_vector_update() RETURNS trigger AS $$
        BEGIN
          NEW.search_vector :=
            to_tsvector('english', coalesce(NEW.title,'') || ' ' || coalesce(NEW.description,''));
          RETURN NEW;
        END
        $$ LANGUAGE plpgsql;
        """
    )

    # Create trigger to call the above function
    op.execute(
        """
        DROP TRIGGER IF EXISTS trigger_listings_search_vector_update ON listings;
        CREATE TRIGGER trigger_listings_search_vector_update
        BEFORE INSERT OR UPDATE ON listings
        FOR EACH ROW EXECUTE FUNCTION listings_search_vector_update();
        """
    )


def downgrade() -> None:
    conn = op.get_bind()
    inspector = inspect(conn)
    columns = [col["name"] for col in inspector.get_columns("listings")]

    # Drop trigger and function
    op.execute("DROP TRIGGER IF EXISTS trigger_listings_search_vector_update ON listings;")
    op.execute("DROP FUNCTION IF EXISTS listings_search_vector_update();")

    # Drop index
    op.execute("DROP INDEX IF EXISTS listings_search_vector_idx;")

    # Drop column if exists
    if "search_vector" in columns:
        op.drop_column("listings", "search_vector")
