"""Add university column to users

Revision ID: e7dcda701cf8
Revises: 0001_init
Create Date: 2025-08-13 15:30:00.000000
"""

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'e7dcda701cf8'
down_revision = '0001_init'
branch_labels = None
depends_on = None

def upgrade():
    op.add_column('users', sa.Column('university', sa.String(length=255), nullable=True))

def downgrade():
    op.drop_column('users', 'university')
