from typing import Optional
from pydantic import BaseModel, EmailStr
from datetime import datetime
import uuid


class UserBase(BaseModel):
    """Base user schema"""
    email: EmailStr
    full_name: Optional[str] = None
    university: Optional[str] = None
    student_id: Optional[str] = None
    bio: Optional[str] = None
    phone_number: Optional[str] = None


class UserCreate(UserBase):
    """User creation schema"""
    password: str


class UserUpdate(BaseModel):
    """User update schema"""
    full_name: Optional[str] = None
    university: Optional[str] = None
    student_id: Optional[str] = None
    bio: Optional[str] = None
    phone_number: Optional[str] = None
    profile_image_url: Optional[str] = None
    
    class Config:
        schema_extra = {
            "example": {
                "full_name": "John Doe Updated",
                "bio": "Computer Science student interested in tech gadgets",
                "phone_number": "+1234567890"
            }
        }


class UserResponse(UserBase):
    """User response schema"""
    id: uuid.UUID
    is_verified: bool
    verification_status: str
    is_active: bool
    email_verified: bool
    profile_image_url: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
        schema_extra = {
            "example": {
                "id": "123e4567-e89b-12d3-a456-426614174000",
                "email": "student@university.edu",
                "full_name": "John Doe",
                "university": "University of Example",
                "student_id": "STU123456",
                "is_verified": True,
                "verification_status": "verified",
                "is_active": True,
                "email_verified": True,
                "bio": "Computer Science student",
                "phone_number": "+1234567890",
                "profile_image_url": None,
                "created_at": "2024-01-01T00:00:00Z",
                "updated_at": "2024-01-01T00:00:00Z"
            }
        }


class UserProfile(BaseModel):
    """User profile schema for public display"""
    id: uuid.UUID
    full_name: Optional[str]
    university: Optional[str]
    bio: Optional[str]
    profile_image_url: Optional[str]
    is_verified: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


class EmailVerification(BaseModel):
    """Email verification schema"""
    token: str
    
    class Config:
        schema_extra = {
            "example": {
                "token": "verification-token-here"
            }
        }


class IDVerification(BaseModel):
    """ID verification upload schema"""
    id_image_url: str
    notes: Optional[str] = None
    
    class Config:
        schema_extra = {
            "example": {
                "id_image_url": "https://example.com/id-image.jpg",
                "notes": "Student ID card front side"
            }
        }

