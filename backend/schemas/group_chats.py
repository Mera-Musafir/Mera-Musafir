from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import uuid
from schemas.users import UserResponse

class GroupChatMemberResponse(BaseModel):
    id: int
    user_id: uuid.UUID
    joined_at: datetime
    user: UserResponse

    class Config:
        from_attributes = True

class GroupChatResponse(BaseModel):
    id: int
    trip_id: int
    name: str
    created_at: datetime
    members: List[GroupChatMemberResponse]

    class Config:
        from_attributes = True

class JoinChatResponse(BaseModel):
    chat_id: int
    trip_id: int
    user_joined: bool
    message: str
