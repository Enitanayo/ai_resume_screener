from datetime import timedelta
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from backend import models
from backend.auth import (
    create_access_token,
    hash_password,
    oauth2_scheme,
    verify_access_token,
    verify_password,
    CurrentRecruiter,
)
from backend.config import settings
from backend.database import get_db
from backend.schemas import RecruiterCreate, RecruiterResponse, Token

router = APIRouter()

@router.post("/register", response_model=RecruiterResponse, status_code=status.HTTP_201_CREATED)
def register_recruiter(recruiter:RecruiterCreate, db: Annotated[Session, Depends(get_db)]):
    result = db.execute(
        select(models.Recruiter).where(
            func.lower(models.Recruiter.email) == recruiter.email.lower(),
        ),
    )
    existing_user = result.scalars().first()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already exists",
        )

    new_recruiter = models.Recruiter(
        first_name = recruiter.first_name,
        last_name = recruiter.last_name,
        email=recruiter.email.lower(),
        password_hash=hash_password(recruiter.password),
    )
    db.add(new_recruiter)
    db.commit()
    db.refresh(new_recruiter)
    return new_recruiter



@router.post("/login", response_model=Token)
def login_for_access_token(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    db: Annotated[Session, Depends(get_db)],
):
    # Look up recruiter by email (case-insensitive)
    # Note: OAuth2PasswordRequestForm uses "username" field, but we treat it as email
    result = db.execute(
        select(models.Recruiter).where(
            func.lower(models.Recruiter.email) == form_data.username.lower(),
        ),
    )
    recruiter = result.scalars().first()

    # Verify recruiter exists and password is correct
    # Don't reveal which one failed (security best practice)
    if not recruiter or not verify_password(form_data.password, recruiter.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Create access token with recruiter id as subject
    access_token_expires = timedelta(minutes=settings.access_token_expires_minutes)
    access_token = create_access_token(
        data={"sub": str(recruiter.id)},
        expires_delta=access_token_expires,
    )
    return Token(access_token=access_token, token_type="bearer")


@router.get("/me", response_model=RecruiterResponse)
def get_current_recruiter(current_recruiter:CurrentRecruiter):
    return current_recruiter
