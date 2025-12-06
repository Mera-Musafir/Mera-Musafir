from pydantic import BaseModel
from typing import Optional
import uuid

class UserBase(BaseModel):
    name: str
    email: str

class UserCreate(UserBase):
    pass

class UserResponse(UserBase):
    id: uuid.UUID

    class Config:
        from_attributes = True
