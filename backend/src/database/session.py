import logging
import time

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

from core.config import settings
from database.base import Base

logger = logging.getLogger("uvicorn.error")

engine = create_engine(
    settings.database_url,
    pool_pre_ping=True,
    pool_recycle=300,
    pool_size=5,
    max_overflow=10,
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_database(max_attempts: int = 30, retry_delay: float = 2.0) -> None:
    for attempt in range(1, max_attempts + 1):
        try:
            with engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            Base.metadata.create_all(bind=engine)
            logger.info("Database connected and tables ready")
            return
        except Exception as exc:
            if attempt == max_attempts:
                logger.error(
                    "Database connection failed after %d attempts: %s",
                    max_attempts,
                    exc,
                )
                raise
            logger.warning(
                "Database not ready (attempt %d/%d), retrying in %.0fs...",
                attempt,
                max_attempts,
                retry_delay,
            )
            time.sleep(retry_delay)


def check_database_connection() -> str:
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return "connected"
    except Exception as exc:
        return f"error: {exc}"
