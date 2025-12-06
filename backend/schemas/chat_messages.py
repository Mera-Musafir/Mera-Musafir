from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import uuid
from schemas.users import UserResponse

class ChatMessageCreate(BaseModel):
    message: str

class ChatMessageResponse(BaseModel):
    id: int
    chat_id: int
    sender_id: uuid.UUID
    message: str
    created_at: datetime
    sender: UserResponse

    class Config:
        from_attributes = True
