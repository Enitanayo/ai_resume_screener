from fastapi import FastAPI


from backend.database import Base, engine, get_db
from backend.routers import auth_routes ,recruiter, application
from backend.schemas import *

Base.metadata.create_all(bind=engine)


app = FastAPI()

app.include_router(auth_routes.router, prefix="/auth", tags=["auth"])
app.include_router(recruiter.router, prefix="/api/jobs", tags=["recruiter"])
app.include_router(application.router, prefix="/application", tags=["application"])


@app.get("/")
def root():
    return {"message": "resume screener app working"}
