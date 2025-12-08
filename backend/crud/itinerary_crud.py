from sqlalchemy.orm import Session
from typing import List, Optional

from models.itinerary_items import ItineraryItem
from schemas.itinerary import ItineraryCreate, ItineraryUpdate

import uuid

def get_itinerary_for_trip(db: Session, trip_id: int) -> List[ItineraryItem]:
    return (
        db.query(ItineraryItem)
        .filter(ItineraryItem.trip_id == trip_id)
        .order_by(ItineraryItem.day.asc(), ItineraryItem.start_time.asc())
        .all()
    )

def create_itinerary_item(
    db: Session,
    trip_id: int,
    user_id: uuid.UUID,
    data: ItineraryCreate
) -> ItineraryItem:
    item = ItineraryItem(
        trip_id=trip_id,
        day=data.day,
        title=data.title,
        description=data.description,
        location=data.location,
        start_time=data.start_time,
        end_time=data.end_time,
        created_by=user_id,
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item

def get_itinerary_item(db: Session, item_id: int) -> Optional[ItineraryItem]:
    return db.query(ItineraryItem).filter(ItineraryItem.id == item_id).first()

def update_itinerary_item(
    db: Session,
    item: ItineraryItem,
    data: ItineraryUpdate
) -> ItineraryItem:
    for field, value in data.dict(exclude_unset=True).items():
        setattr(item, field, value)
    db.commit()
    db.refresh(item)
    return item

def delete_itinerary_item(db: Session, item: ItineraryItem) -> None:
    db.delete(item)
    db.commit()
