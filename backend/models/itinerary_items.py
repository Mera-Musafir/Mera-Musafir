from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime

from database import Base

class ItineraryItem(Base):
    __tablename__ = "itinerary_items"

    id = Column(Integer, primary_key=True, index=True)
    trip_id = Column(Integer, ForeignKey("trips.id"), nullable=False)

    # Basic structure: day + time slots + text
    day = Column(Integer, nullable=False)             # e.g. Day 1, Day 2, ...
    title = Column(String, nullable=False)            # "Hiking to Fairy Meadows"
    description = Column(String, nullable=True)
    location = Column(String, nullable=True)
    start_time = Column(String, nullable=True)        # "09:00"
    end_time = Column(String, nullable=True)          # "13:00"

    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    trip = relationship("Trip", back_populates="itinerary_items")
    creator = relationship("User", back_populates="itinerary_items")
