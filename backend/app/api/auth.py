from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from ..core.database import get_db
from ..core.auth import (
    authenticate_user, 
    create_access_token, 
    create_refresh_token,
    store_refresh_token,
    verify_refresh_token,
    get_password_hash
)
from ..models.user import User
from ..models.schemas import (
    LoginCredentials, 
    RegisterData, 
    AuthResponse, 
    TokenRefresh, 
    TokenResponse,
    UserProfile
)

router = APIRouter(prefix="/auth", tags=["authentication"])

@router.post("/login", response_model=AuthResponse)
async def login(credentials: LoginCredentials, db: Session = Depends(get_db)):
    """Authenticate user and return access and refresh tokens."""
    try:
        user = authenticate_user(db, credentials.email, credentials.password)
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password"
            )
        
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User account is deactivated"
            )
    except HTTPException:
        raise
    except Exception as e:
        print(f"Login error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Authentication service error"
        )
    
    # Create tokens
    access_token = create_access_token(data={"sub": str(user.id)})
    refresh_token = create_refresh_token()
    
    # Store refresh token in database
    store_refresh_token(db, user.id, refresh_token)
    
    # Convert user to UserProfile format expected by frontend
    user_profile = UserProfile.from_user(user)
    
    return AuthResponse(
        user=user_profile,
        token=access_token,
        refreshToken=refresh_token
    )

@router.post("/register", response_model=AuthResponse)
async def register(user_data: RegisterData, db: Session = Depends(get_db)):
    """Register a new user."""
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered"
        )
    
    # Create new user
    hashed_password = get_password_hash(user_data.password)
    
    db_user = User(
        email=user_data.email,
        firstname=user_data.firstname,
        lastname=user_data.lastname,
        hashed_password=hashed_password,
        role="user",
        is_active=True
    )
    
    try:
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered"
        )
    
    # Create tokens
    access_token = create_access_token(data={"sub": str(db_user.id)})
    refresh_token = create_refresh_token()
    
    # Store refresh token in database
    store_refresh_token(db, db_user.id, refresh_token)
    
    # Convert user to UserProfile format expected by frontend
    user_profile = UserProfile.from_user(db_user)
    
    return AuthResponse(
        user=user_profile,
        token=access_token,
        refreshToken=refresh_token
    )

@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(token_data: TokenRefresh, db: Session = Depends(get_db)):
    """Refresh access token using refresh token."""
    user = verify_refresh_token(db, token_data.refreshToken)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is deactivated"
        )
    
    # Create new access token
    access_token = create_access_token(data={"sub": str(user.id)})
    
    return TokenResponse(token=access_token)