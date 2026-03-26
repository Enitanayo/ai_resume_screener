from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware


from backend.database import Base, engine, get_db
from backend.routers import auth_routes ,recruiter, candidate
from backend.schemas import *

Base.metadata.create_all(bind=engine)


app = FastAPI(openapi_version="3.0.3")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, replace with your specific domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_routes.router, prefix="/auth", tags=["auth"])
app.include_router(recruiter.router, prefix="/api/jobs", tags=["recruiter"])
app.include_router(candidate.router, prefix="/api/candidate", tags=["candidate"])


@app.get("/")
def root():
    return {"message": "resume screener app working"}
