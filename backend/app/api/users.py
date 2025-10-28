from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy.orm import Session
from typing import List

from ..core.database import get_db
from ..core.auth import get_current_user, get_current_admin_user
from ..models.user import User
from ..models.schemas import (
    UserProfile, 
    UserProfileResponse, 
    UpdateProfile, 
    UpdateUserStatus,
    UserListResponse
)

router = APIRouter(prefix="/user", tags=["users"])

@router.get("/profile", response_model=UserProfileResponse)
async def get_user_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current user's profile."""
    user_profile = UserProfile.from_user(current_user)
    
    return UserProfileResponse(user=user_profile)

@router.patch("/profile", response_model=UserProfileResponse)
async def update_user_profile(
    profile_data: UpdateProfile,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update current user's profile."""
    # Update only provided fields
    if profile_data.firstname is not None:
        current_user.firstname = profile_data.firstname
    if profile_data.lastname is not None:
        current_user.lastname = profile_data.lastname
    if profile_data.email is not None:
        # Check if email is already taken by another user
        existing_user = db.query(User).filter(
            User.email == profile_data.email,
            User.id != current_user.id
        ).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email already in use"
            )
        current_user.email = profile_data.email
    
    try:
        db.commit()
        db.refresh(current_user)
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to update profile"
        )
    
    user_profile = UserProfile(
        id=current_user.id,
        firstname=current_user.firstname,
        lastname=current_user.lastname,
        email=current_user.email,
        role=current_user.role,
        isActive=current_user.is_active,
        created_at=current_user.created_at
    )
    
    return UserProfileResponse(user=user_profile)

@router.get("/all", response_model=UserListResponse)
async def get_all_users(
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Get all users (admin only)."""
    users = db.query(User).all()
    
    user_profiles = [UserProfile.from_user(user) for user in users]
    
    return UserListResponse(users=user_profiles)

@router.patch("/{user_id}/status")
async def update_user_status(
    user_id: int,
    status_data: UpdateUserStatus,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Update user active status (admin only)."""
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Prevent admin from deactivating themselves
    if user.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot modify your own status"
        )
    
    user.is_active = status_data.isActive
    
    try:
        db.commit()
        db.refresh(user)
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to update user status"
        )
    
    return {"message": "User status updated successfully"}