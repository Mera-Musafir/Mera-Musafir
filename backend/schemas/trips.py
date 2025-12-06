from pydantic import BaseModel
from typing import List, Optional
from schemas.activities import ActivityResponse  

class Participants(BaseModel):
    id: int
    name: str
    initials: str


class TripBase(BaseModel):
    title: str
    location: str
    dates: str
    imageurl: Optional[str] = None
    participants: int = 0
    maxparticipants: int
    description: Optional[str] = None
    budget: Optional[str] = None
    duration: Optional[int] = None
    triptype: Optional[str] = None
    participantlist: Optional[List[Participants]] = []
    activities: List[ActivityResponse] = []


class TripCreate(TripBase):
    activities: List[str] = []


class TripResponse(TripBase):
    id: int
    activities: List[ActivityResponse] = []

    class Config:
        from_attributes = True
