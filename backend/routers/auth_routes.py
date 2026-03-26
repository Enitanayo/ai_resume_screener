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
from backend.schemas import RecruiterCreate, RecruiterResponse, Token, CandidateCreate, CandidateResponse

router = APIRouter()

@router.post("/register/recruiter", response_model=RecruiterResponse, status_code=status.HTTP_201_CREATED)
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

@router.post("/register/candidate", response_model=CandidateResponse, status_code=status.HTTP_201_CREATED)
def register_candidate(candidate: CandidateCreate, db: Annotated[Session, Depends(get_db)]):
    result = db.execute(
        select(models.Candidate).where(
            func.lower(models.Candidate.email) == candidate.email.lower(),
        ),
    )
    existing_user = result.scalars().first()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already exists",
        )

    new_candidate = models.Candidate(
        first_name = candidate.first_name,
        last_name = candidate.last_name,
        email=candidate.email.lower(),
        password_hash=hash_password(candidate.password),
    )
    db.add(new_candidate)
    db.commit()
    db.refresh(new_candidate)
    return new_candidate

@router.post("/login", response_model=Token)
def login_for_access_token(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    db: Annotated[Session, Depends(get_db)],
):
    # Look up recruiter by email
    result = db.execute(
        select(models.Recruiter).where(
            func.lower(models.Recruiter.email) == form_data.username.lower(),
        ),
    )
    user = result.scalars().first()
    role = "recruiter"

    if not user:
        # Look up candidate by email
        result = db.execute(
            select(models.Candidate).where(
                func.lower(models.Candidate.email) == form_data.username.lower(),
            ),
        )
        user = result.scalars().first()
        role = "candidate"

    # Verify user exists and password is correct
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Create access token with user id as subject
    access_token_expires = timedelta(minutes=settings.access_token_expires_minutes)
    access_token = create_access_token(
        data={"sub": str(user.id), "role": role},
        expires_delta=access_token_expires,
    )
    return Token(access_token=access_token, token_type="bearer")


@router.get("/me", response_model=RecruiterResponse)
def get_current_recruiter(current_recruiter:CurrentRecruiter):
    return current_recruiter
