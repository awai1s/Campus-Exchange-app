import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.core.database import get_db, Base
from app.core.config import settings

# Create test database
SQLALCHEMY_DATABASE_URL = "postgresql://postgres:mypass@localhost:5432/campus_exchange"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    """Override database dependency for testing"""
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(scope="session")
def db_engine():
    """Create test database engine"""
    Base.metadata.create_all(bind=engine)
    yield engine
    Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def db_session(db_engine):
    """Create test database session"""
    connection = db_engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)
    
    yield session
    
    session.close()
    transaction.rollback()
    connection.close()


@pytest.fixture(scope="function")
def client():
    """Create test client"""
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture
def test_user_data():
    """Test user data"""
    return {
        "email": "test@university.edu",
        "password": "TestPass123",
        "full_name": "Test User",
        "university": "Test University",
        "student_id": "TEST123"
    }


@pytest.fixture
def test_listing_data():
    """Test listing data"""
    return {
        "title": "Test MacBook Pro",
        "description": "Test description",
        "price": 1000.00,
        "category": "Electronics",
        "condition": "like_new",
        "is_negotiable": True,
        "location_details": "Test location"
    }

