from sqlalchemy.orm import Session, joinedload
from models.trips import Trip

def get_all_trips(db: Session):
    return db.query(Trip).options(joinedload(Trip.activities)).all()
