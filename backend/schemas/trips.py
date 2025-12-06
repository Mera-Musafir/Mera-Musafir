# schemas/trips.py
from pydantic import BaseModel, Field
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
    participantlist: Optional[List[Participants]] = Field(default_factory=list)
    activities: List[ActivityResponse] = Field(default_factory=list)


class TripCreate(BaseModel):
    title: str
    location: str
    dates: str
    imageurl: Optional[str] = None
    maxparticipants: int
    description: Optional[str] = None
    budget: Optional[str] = None
    duration: Optional[int] = None
    triptype: Optional[str] = None

    # For creation, frontend will send list of activity NAMES
    activities: List[str] = Field(default_factory=list)


class TripResponse(TripBase):
    id: int
    activities: List[ActivityResponse] = Field(default_factory=list)

    class Config:
        from_attributes = True
