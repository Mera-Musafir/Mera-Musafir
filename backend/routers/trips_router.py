from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List
from crud.users_crud import log_event
from database import get_db
from crud.trips_crud import get_all_trips, create_trip
from schemas.trips import TripCreate, TripResponse
from auth.dependencies import get_current_user  # <- import your dependency here

router = APIRouter(prefix="/trips", tags=["Trips"])


@router.get("/", response_model=List[TripResponse])
def read_all_trips(db: Session = Depends(get_db)):
    return get_all_trips(db)


@router.post("/", response_model=TripResponse, status_code=status.HTTP_201_CREATED)
def create_new_trip(
    trip: TripCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    # Create trip (CRUD function unaware of user)
    new_trip = create_trip(db, trip)

    # Log analytics event here
    log_event(
        db,
        user_id=current_user.id,
        event_type="trip_created",
        metadata={"trip_id": new_trip.id}
    )

    return new_trip

