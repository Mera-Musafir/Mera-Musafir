import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from database import Base, get_db
from main import app
from models.users import User
from models.trips import Trip
from models.activities import Activity
import uuid
from unittest.mock import MagicMock

# Create test database
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

# Global mock user reference for test user switching
_current_test_user = None

def mock_get_current_user():
    """Mock function that returns the current test user"""
    if _current_test_user is None:
        # Create default test user
        db = TestingSessionLocal()
        try:
            user = db.query(User).filter(User.email == "test@example.com").first()
            if not user:
                user = User(
                    id=uuid.uuid4(),
                    name="Test User",
                    email="test@example.com"
                )
                db.add(user)
                db.commit()
                db.refresh(user)
            return user
        finally:
            db.close()
    return _current_test_user

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(scope="function")
def db_session():
    """Create a fresh database for each test"""
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="function")
def client(db_session):
    """Create a test client"""
    # Override the auth dependency with our mock
    from auth.dependencies import get_current_user
    app.dependency_overrides[get_current_user] = mock_get_current_user
    
    client = TestClient(app)
    yield client
    
    # Clean up
    if get_current_user in app.dependency_overrides:
        del app.dependency_overrides[get_current_user]

@pytest.fixture
def test_user(db_session):
    """Create a test user"""
    user = User(
        id=uuid.uuid4(),
        name="Test User",
        email="test@example.com"
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    
    # Set as current test user
    global _current_test_user
    _current_test_user = user
    
    return user

@pytest.fixture
def test_trip(db_session):
    """Create a test trip with proper default values"""
    trip = Trip(
        title="Test Paris Trip",
        location="Paris, France",
        dates="Dec 15-22, 2025",
        imageurl="https://example.com/paris.jpg",
        participants=2,
        maxparticipants=8,
        description="A wonderful trip to Paris",
        budget="$1,200-1,800",
        duration=7,
        triptype="Cultural",
        participantlist=[
            {"id": 1, "name": "Sarah M.", "initials": "SM"},
            {"id": 2, "name": "James K.", "initials": "JK"}
        ]
    )
    db_session.add(trip)
    db_session.commit()
    db_session.refresh(trip)
    
    # Add some activities
    activities = [
        Activity(trip_id=trip.id, name="Eiffel Tower"),
        Activity(trip_id=trip.id, name="Louvre Museum"),
        Activity(trip_id=trip.id, name="Seine River Cruise")
    ]
    for activity in activities:
        db_session.add(activity)
    
    db_session.commit()
    return trip

@pytest.fixture
def another_user(db_session):
    """Create another test user"""
    user = User(
        id=uuid.uuid4(),
        name="Another User",
        email="another@example.com"
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user

def set_current_test_user(user):
    """Helper function to switch the current test user"""
    global _current_test_user
    _current_test_user = user

# Make the helper available to tests
pytest.set_current_test_user = set_current_test_user
