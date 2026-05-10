from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from redis import Redis

from app.config import settings

engine = create_engine(settings.database_url, pool_pre_ping=True, pool_recycle=3600)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


redis_client = Redis.from_url(settings.redis_url, decode_responses=True)
