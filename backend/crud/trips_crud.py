# crud/trips_crud.py
from sqlalchemy.orm import Session, joinedload
from models.trips import Trip
from models.activities import Activity
from schemas.trips import TripCreate
from crud.analytics_crud import log_event

def get_all_trips(db: Session):
    return db.query(Trip).options(joinedload(Trip.activities)).all()


def create_trip(db: Session, trip_data: TripCreate):
    # 1) Create Trip row
    new_trip = Trip(
        title=trip_data.title,
        location=trip_data.location,
        dates=trip_data.dates,
        imageurl=trip_data.imageurl,
        participants=0,                         # new trip starts with 0 participants
        maxparticipants=trip_data.maxparticipants,
        description=trip_data.description,
        budget=trip_data.budget,
        duration=trip_data.duration,
        triptype=trip_data.triptype,
        participantlist=[],                     # empty JSON list initially
    )

    db.add(new_trip)
    db.commit()
    db.refresh(new_trip)

    # 2) Create Activity rows for this trip
    for activity_name in trip_data.activities:
        activity = Activity(
            trip_id=new_trip.id,
            name=activity_name
        )
        db.add(activity)

    db.commit()
    db.refresh(new_trip)  # now new_trip.activities is populated

    return new_trip
