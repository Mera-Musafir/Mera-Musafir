from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.dialects.postgresql import JSON
from backend.database import Base
from sqlalchemy.orm import relationship

class Trip(Base):
    __tablename__ = "trips"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    location = Column(String)
    dates = Column(String)
    imageurl = Column(String)
    participants = Column(Integer)
    maxparticipants = Column(Integer)
    description = Column(String)
    budget = Column(String)
    duration = Column(Integer)
    triptype = Column(String)
    participantlist = Column(JSON)

    # NEW: one-to-many relationship
    activities = relationship("Activity", back_populates="trip", cascade="all, delete")