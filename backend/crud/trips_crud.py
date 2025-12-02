from sqlalchemy.orm import Session
from backend.models.trips import Trip
from backend.schemas.trips import TripCreate

def get_all_trips(db: Session):
    return db.query(Trip).all()