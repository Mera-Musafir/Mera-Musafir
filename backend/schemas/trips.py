# schemas/trips.py
from pydantic import BaseModel, Field
from typing import List, Optional
from schemas.activities import ActivityResponse  
from fastapi import Form

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

    @classmethod
    def as_form(
        cls,
        title: str = Form(...),
        location: str = Form(...),
        dates: str = Form(...),
        maxparticipants: int = Form(...),
        imageurl: Optional[str] = Form(None),
        description: Optional[str] = Form(None),
        budget: Optional[str] = Form(None),
        duration: Optional[int] = Form(None),
        triptype: Optional[str] = Form(None),
        activities: Optional[List[str]] = Form(None),
    ):
        return cls(
            title=title,
            location=location,
            dates=dates,
            imageurl=imageurl,
            maxparticipants=maxparticipants,
            description=description,
            budget=budget,
            duration=duration,
            triptype=triptype,
            activities=activities or []
        )


class TripResponse(TripBase):
    id: int
    activities: List[ActivityResponse] = Field(default_factory=list)

    class Config:
        from_attributes = True
