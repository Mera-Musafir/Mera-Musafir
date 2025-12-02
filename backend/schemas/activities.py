from pydantic import BaseModel
from typing import Optional

class ActivityBase(BaseModel):
    name: str
    trip_id: int  
class ActivityCreate(ActivityBase):
    pass

class ActivityResponse(ActivityBase):
    id: int

    class Config:
        from_attributes = True