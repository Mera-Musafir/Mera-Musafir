from pydantic import BaseModel
from typing import List, Optional


class Participants(BaseModel):
    id: int
    name: str
    initials: str


class TripBase(BaseModel):
    title: str
    location: str
    dates: str
    imageurl: Optional[str]
    participants: int
    maxparticipants: int
    description: Optional[str]
    budget: Optional[str]
    duration: int
    triptype: Optional[str]
    participantlist: List[Participants]
    activities: List[str]


class TripCreate(TripBase):
    pass


class TripResponse(TripBase):
    id: int

    class Config:
        from_attributes = True
