from alembic import op
import sqlalchemy as sa

revision = '0001_init'
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    op.create_table('users',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('email', sa.String(length=255), nullable=False, unique=True),
        sa.Column('hashed_password', sa.String(length=255), nullable=False),
        sa.Column('is_active', sa.Boolean(), server_default=sa.text('true'), nullable=False),
        sa.Column('is_admin', sa.Boolean(), server_default=sa.text('false'), nullable=False),
        sa.Column('is_verified', sa.Boolean(), server_default=sa.text('false'), nullable=False),
    )
    op.create_index('ix_users_email', 'users', ['email'])

    op.create_table('listings',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('category', sa.String(length=100), nullable=False),
        sa.Column('price', sa.Numeric(10,2), nullable=False),
        sa.Column('owner_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
    )
    op.create_index('ix_listings_title', 'listings', ['title'])
    op.create_index('ix_listings_category', 'listings', ['category'])
    op.create_index('ix_listings_owner', 'listings', ['owner_id'])

    op.create_table('favorites',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('listing_id', sa.Integer(), sa.ForeignKey('listings.id'), nullable=False),
        sa.UniqueConstraint('user_id', 'listing_id', name='uq_user_listing')
    )
    op.create_index('ix_favorites_user', 'favorites', ['user_id'])
    op.create_index('ix_favorites_listing', 'favorites', ['listing_id'])

    op.create_table('notifications',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('type', sa.String(length=50), nullable=False),
        sa.Column('payload', sa.String(length=500), server_default='{}', nullable=False),
        sa.Column('is_read', sa.Boolean(), server_default=sa.text('false'), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
    )
    op.create_index('ix_notifications_user', 'notifications', ['user_id'])

    op.create_table('messages',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('listing_id', sa.Integer(), sa.ForeignKey('listings.id'), nullable=False),
        sa.Column('sender_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('receiver_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('body', sa.Text(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
    )
    op.create_index('ix_messages_listing', 'messages', ['listing_id'])
    op.create_index('ix_messages_sender', 'messages', ['sender_id'])

    op.create_table('verifications',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=False, unique=True),
        sa.Column('status', sa.String(length=20), server_default='unverified', nullable=False),
        sa.Column('university_email', sa.String(length=255), nullable=True),
        sa.Column('student_id', sa.String(length=100), nullable=True),
    )
    op.create_index('ix_verifications_user', 'verifications', ['user_id'])

def downgrade():
    op.drop_table('verifications')
    op.drop_table('messages')
    op.drop_table('notifications')
    op.drop_table('favorites')
    op.drop_table('listings')
    op.drop_table('users')
