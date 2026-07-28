"""Database engine and session management — SQLAlchemy 2.0."""

from sqlalchemy import create_engine, event
from sqlalchemy.orm import DeclarativeBase, sessionmaker
from sqlalchemy.pool import StaticPool

from infantia.config import settings


class Base(DeclarativeBase):
    """Base class for all ORM models."""

    pass


def _engine_from_url(url: str):
    """Create an engine with SQLite optimizations when applicable."""
    connect_args = {}
    pool_class = None

    if url.startswith("sqlite"):
        connect_args["check_same_thread"] = False
        pool_class = StaticPool

    engine = create_engine(
        url,
        connect_args=connect_args,
        poolclass=pool_class,
        echo=settings.debug,
    )

    # SQLite WAL + performance pragmas
    if url.startswith("sqlite"):

        @event.listens_for(engine, "connect")
        def _set_sqlite_pragmas(dbapi_connection, _connection_record):
            cursor = dbapi_connection.cursor()
            cursor.execute("PRAGMA journal_mode=WAL")
            cursor.execute("PRAGMA busy_timeout=5000")
            cursor.execute("PRAGMA synchronous=NORMAL")
            cursor.execute("PRAGMA foreign_keys=ON")
            cursor.execute("PRAGMA temp_store=MEMORY")
            cursor.execute("PRAGMA mmap_size=67108864")  # 64 MB
            cursor.execute("PRAGMA cache_size=-6400")  # 6.4 MB
            cursor.close()

    return engine


engine = _engine_from_url(settings.database_url)
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)


def get_db():
    """FastAPI dependency that yields a database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Create all tables. For local dev only — use Alembic in production."""
    Base.metadata.create_all(bind=engine)