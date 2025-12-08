# crud/analytics_crud.py
from sqlalchemy.orm import Session
from models.analytics import AnalyticsEvent
from typing import Optional, Dict, Any
from uuid import UUID

def log_event(
    db: Session,
    user_id: Optional[UUID],
    event_type: str,
    metadata: Optional[Dict[str, Any]] = None
) -> AnalyticsEvent:
    """
    Logs an analytics event.
    """
    event = AnalyticsEvent(
        user_id=user_id,
        event_type=event_type,
        extra_metadata=metadata  # Use the correct field name in your model
    )
    db.add(event)
    db.commit()
    db.refresh(event)
    return event
