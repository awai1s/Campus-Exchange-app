from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.user import UserResponse, UserUpdate, EmailVerification, IDVerification
from app.schemas.common import ResponseModel
from app.services.user_service import UserService
from app.api.deps import get_current_user, get_current_active_user
from app.models.user import User

router = APIRouter()


@router.get("/profile", response_model=UserResponse)
async def get_user_profile(
    current_user: User = Depends(get_current_active_user)
):
    """Get current user profile"""
    return current_user


@router.put("/profile", response_model=UserResponse)
async def update_user_profile(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update current user profile"""
    user_service = UserService(db)
    
    updated_user = user_service.update_user(current_user.id, user_update)
    
    if not updated_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return updated_user


@router.post("/verify-email", response_model=ResponseModel)
async def verify_email(
    verification_data: EmailVerification,
    db: Session = Depends(get_db)
):
    """Verify user email with token"""
    user_service = UserService(db)
    
    # This is a stub implementation for Day 1
    # In a real implementation, you would:
    # 1. Validate the token
    # 2. Find the user associated with the token
    # 3. Mark their email as verified
    
    return ResponseModel(
        message="Email verification endpoint (stub implementation)",
        data={"token": verification_data.token, "status": "pending"}
    )


@router.post("/upload-id", response_model=ResponseModel)
async def upload_id_verification(
    id_data: IDVerification,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Upload ID for manual verification"""
    user_service = UserService(db)
    
    # This is a stub implementation for Day 1
    # In a real implementation, you would:
    # 1. Store the ID image URL
    # 2. Update verification status to "pending_review"
    # 3. Notify admins for manual review
    
    # Update user verification status
    user_service.update_verification_status(
        current_user.id,
        "pending_review",
        f"ID uploaded: {id_data.id_image_url}"
    )
    
    return ResponseModel(
        message="ID uploaded successfully. Manual verification pending.",
        data={
            "id_image_url": id_data.id_image_url,
            "status": "pending_review",
            "notes": id_data.notes
        }
    )


@router.get("/verification-status", response_model=ResponseModel)
async def get_verification_status(
    current_user: User = Depends(get_current_active_user)
):
    """Get current user verification status"""
    return ResponseModel(
        message="Verification status retrieved",
        data={
            "is_verified": current_user.is_verified,
            "verification_status": current_user.verification_status,
            "email_verified": current_user.email_verified,
            "verification_notes": current_user.verification_notes
        }
    )


@router.post("/resend-verification", response_model=ResponseModel)
async def resend_email_verification(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Resend email verification"""
    if current_user.email_verified:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already verified"
        )
    
    # This is a stub implementation for Day 1
    # In a real implementation, you would:
    # 1. Generate a new verification token
    # 2. Send verification email
    # 3. Update user record with new token
    
    return ResponseModel(
        message="Verification email resent (stub implementation)",
        data={"email": current_user.email}
    )

