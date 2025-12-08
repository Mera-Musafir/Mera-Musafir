# schemas/analytics.py
from pydantic import BaseModel
from typing import Any, Dict, Optional
from datetime import datetime
from uuid import UUID

class AnalyticsEventBase(BaseModel):
    event_type: str
    metadata: Optional[Dict[str, Any]] = None

class AnalyticsEventCreate(AnalyticsEventBase):
    pass

class AnalyticsEventResponse(AnalyticsEventBase):
    id: int  # or UUID if you used UUID in your model
    user_id: Optional[UUID] = None
    created_at: datetime

    class Config:
        from_attributes = True
