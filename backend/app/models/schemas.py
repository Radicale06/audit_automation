from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

# Auth Schemas
class LoginCredentials(BaseModel):
    email: EmailStr
    password: str

class RegisterData(BaseModel):
    email: EmailStr
    password: str
    firstname: str
    lastname: str

class UserProfile(BaseModel):
    _id: str  # Changed to match frontend expectation (string ID like MongoDB)
    firstname: str
    lastname: str
    email: str
    role: str
    isActive: bool
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
        
    @classmethod
    def from_user(cls, user):
        """Create UserProfile from User model, mapping id to _id"""
        return cls(
            _id=str(user.id),  # Map id to _id as string for frontend compatibility
            firstname=user.firstname,
            lastname=user.lastname,
            email=user.email,
            role=user.role,
            isActive=user.is_active,
            created_at=user.created_at
        )

class AuthResponse(BaseModel):
    user: UserProfile
    token: str
    refreshToken: str

class UserProfileResponse(BaseModel):
    user: UserProfile

class TokenRefresh(BaseModel):
    refreshToken: str

class TokenResponse(BaseModel):
    token: str

class UpdateUserStatus(BaseModel):
    isActive: bool

class UpdateProfile(BaseModel):
    firstname: Optional[str] = None
    lastname: Optional[str] = None
    email: Optional[EmailStr] = None

class UserListResponse(BaseModel):
    users: list[UserProfile]