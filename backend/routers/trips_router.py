# routers/trips_router.py
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from crud.trips_crud import get_all_trips, create_trip
from schemas.trips import TripCreate, TripResponse

router = APIRouter(prefix="/trips", tags=["Trips"])


@router.get("/", response_model=List[TripResponse])
def read_all_trips(db: Session = Depends(get_db)):
    return get_all_trips(db)


@router.post(
    "/",
    response_model=TripResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_new_trip(trip: TripCreate, db: Session = Depends(get_db)):
    return create_trip(db, trip)
