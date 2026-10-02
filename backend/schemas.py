from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    name: str
    email: str

    class Config:
        from_attributes = True

class CommentCreate(BaseModel):
    content: str

class CommentResponse(BaseModel):
    id: int
    content: str
    user_id: int
    video_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class VideoCreate(BaseModel):
    title: str
    description: Optional[str] = None
    video_url: str
    thumbnail_url: str

class VideoResponse(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    video_url: str
    thumbnail_url: str
    views: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True
