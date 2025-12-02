from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.crud.trips_crud import get_all_trips
from backend.schemas.trips import TripCreate, TripResponse

from typing import List

router = APIRouter(prefix="/trips", tags=["Trips"])

@router.get('/', response_model=List[TripResponse])
def read_all_trips(db: Session = Depends(get_db)):
    return get_all_trips(db)
