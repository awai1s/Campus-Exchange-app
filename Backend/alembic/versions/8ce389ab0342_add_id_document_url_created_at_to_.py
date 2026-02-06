"""Add id_document_url and created_at to verifications table

Revision ID: 8ce389ab0342
Revises: 8a1f6b620151
Create Date: 2025-08-13 17:01:01.123456

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '8ce389ab0342'
down_revision = '8a1f6b620151'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('verifications', sa.Column('id_document_url', sa.String(length=255), nullable=True))
    op.add_column('verifications', sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False))


def downgrade() -> None:
    op.drop_column('verifications', 'created_at')
    op.drop_column('verifications', 'id_document_url')