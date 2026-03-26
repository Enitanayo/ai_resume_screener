from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field

# RecruiterCreate, RecruiterBase, RecruiterResponse
# JobPostingCreate, JobPostingBase, JobPostingResponse
# CandidateApplicationCreate, CandidateApplicationBase, CandidateApplicationResponse

class RecruiterBase(BaseModel):
    first_name:str
    last_name:str
    email:EmailStr

class RecruiterCreate(RecruiterBase):
    password: str = Field(min_length=8) 

class RecruiterResponse(RecruiterBase):
    model_config = ConfigDict(from_attributes= True)

    id: int

class RecruiterPublic(BaseModel):
    pass

class RecruiterPrivate(RecruiterPublic):
    pass

class CandidateBase(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr

class CandidateCreate(CandidateBase):
    password: str = Field(min_length=8)

class CandidateResponse(CandidateBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    created_at: datetime

class JobPostingBase(BaseModel):
    job_title:str
    job_description:str
    required_skills:list[str]

class JobPostingCreate(JobPostingBase):
    pass

class JobPostingResponse(JobPostingBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    recruiter_id: int
    processing_status: str
    processing_error: str | None
    recruiter: RecruiterResponse
    created_at: datetime
    # job_vector: list[float] | None
    # skills_vector: list[float] | None

class JobPostingUpdate(BaseModel):
    job_title: str | None = Field(default=None)
    job_description: str | None= Field(default=None)
    required_skills: list[str] | None = Field(default=None)

class CandidateApplicationBase(BaseModel):
    job_id: int
    candidate_id: int | None = None
    resume_path: str

class CandidateApplicationCreate(CandidateApplicationBase):
    pass

# class CandidateApplicationResponse(CandidateApplicationBase):
#     model_config = ConfigDict(from_attributes=True)

#     id: int
#     processing_status: str
#     processing_error: str | None
#     parsed_skills: list[str] | None
#     semantic_score: float | None
#     context_score: float | None
#     keyword_score: float | None
#     total_weighted_score: float | None
#     applied_at: datetime

class CandidateApplicationPublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    candidate_id: int | None = None
    candidate: CandidateResponse | None = None
    source: str = "self_applied"
    applicant_name: str | None = None
    applicant_email: str | None = None
    resume_path: str
    processing_status: str
    parsed_skills: list[str] | None
    total_weighted_score: float | None
    applied_at: datetime

class CandidateApplicationPrivate(CandidateApplicationPublic):
    # resume_vector: list[float] | None
    # candidate_skills_vector: list[float] | None
    # job: JobPostingResponse
    matched_skills: list[str] | None
    processing_error: str | None
    semantic_score: float | None
    context_score: float | None
    keyword_score: float | None

class Token(BaseModel):
    access_token: str
    token_type: str

class Analytics(BaseModel):
    total_applicants: int
    average_score: float
    top_skills: list[str]

class BatchUploadFileResult(BaseModel):
    filename: str
    status: str  # "created" | "invalid_type" | "error"
    application_id: int | None = None
    detail: str | None = None

class BatchUploadResponse(BaseModel):
    message: str
    total_files: int
    created: int
    failed: int
    results: list[BatchUploadFileResult]

class DashboardAnalytics(BaseModel):
    total_jobs: int
    total_candidates: int
    processing_candidates: int
    ready_candidates: int
    average_candidate_score: float

class CandidateAnalytics(BaseModel):
    total_applications: int
    pending_applications: int
    scored_applications: int