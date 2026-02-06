"""add images column to listings

Revision ID: 6460ebb5c94f
Revises: e7dcda701cf8
Create Date: 2025-08-13 15:30:00

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '6460ebb5c94f'  # change this to your new revision ID
down_revision = 'e7dcda701cf8'  # replace with your last migration's ID
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('listings', sa.Column('images', sa.JSON(), nullable=True))


def downgrade():
    op.drop_column('listings', 'images')
