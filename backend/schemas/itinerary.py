from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import uuid

class ItineraryBase(BaseModel):
    day: int
    title: str
    description: Optional[str] = None
    location: Optional[str] = None
    start_time: Optional[str] = None   # "09:00"
    end_time: Optional[str] = None     # "13:00"

class ItineraryCreate(ItineraryBase):
    pass

class ItineraryUpdate(BaseModel):
    day: Optional[int] = None
    title: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None

class ItineraryResponse(ItineraryBase):
    id: int
    trip_id: int
    created_by: uuid.UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
