"""
Pydantic schemas for user authentication.
"""
from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional
from datetime import datetime


class UserRegister(BaseModel):
    email: str
    full_name: str
    password: str

    @field_validator("email")
    @classmethod
    def validate_email(cls, v):
        if "@" not in v or "." not in v:
            raise ValueError("Invalid email address")
        return v.lower().strip()

    @field_validator("password")
    @classmethod
    def validate_password(cls, v):
        if len(v) < 6:
            raise ValueError("Password must be at least 6 characters")
        return v

    @field_validator("full_name")
    @classmethod
    def validate_name(cls, v):
        if len(v.strip()) < 2:
            raise ValueError("Name must be at least 2 characters")
        return v.strip()


class UserLogin(BaseModel):
    email: str
    password: str

    @field_validator("email")
    @classmethod
    def normalize_email(cls, v):
        return v.lower().strip()


class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    is_active: bool
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
