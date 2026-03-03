from sqlalchemy.orm import DeclarativeBase, sessionmaker
from sqlalchemy import create_engine
from backend.config import settings

engine = create_engine(
    url= settings.database_url,
)

SessionLocal = sessionmaker(autoflush=False, autocommit=False, bind= engine)

class Base(DeclarativeBase):
    pass

def get_db():
    with SessionLocal() as db:
        yield db