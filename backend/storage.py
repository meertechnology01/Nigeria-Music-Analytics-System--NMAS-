"""Persistence layer for platform snapshots."""

from __future__ import annotations

import os
from datetime import datetime
from typing import Iterable, List

import logging

from sqlalchemy import func
from sqlalchemy.pool import QueuePool, NullPool
from sqlmodel import Field, SQLModel, Session, create_engine, select

from config import get_settings

logger = logging.getLogger(__name__)

# Get settings
settings = get_settings()

# Build an absolute SQLite path anchored to the repo
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DEFAULT_DB_PATH = os.path.join(BASE_DIR, "data", "engine.db")
os.makedirs(os.path.dirname(DEFAULT_DB_PATH), exist_ok=True)

# Normalise path separators and construct SQLAlchemy URL
DEFAULT_DB_URL = f"sqlite:///{DEFAULT_DB_PATH.replace(os.sep, '/')}"
DATABASE_URL = settings.database_url or DEFAULT_DB_URL

# Configure engine based on database type
if DATABASE_URL.startswith("sqlite"):
    # SQLite configuration
    engine = create_engine(
        DATABASE_URL,
        echo=settings.debug,
        connect_args={"check_same_thread": False},
        poolclass=NullPool  # SQLite doesn't need connection pooling
    )
else:
    # PostgreSQL/MySQL configuration with connection pooling
    engine = create_engine(
        DATABASE_URL,
        echo=settings.debug,
        poolclass=QueuePool,
        pool_size=5,
        max_overflow=10,
        pool_pre_ping=True,  # Verify connections before using
        pool_recycle=3600,   # Recycle connections after 1 hour
    )

logger.info(f"Database engine initialized: {DATABASE_URL.split('@')[-1] if '@' in DATABASE_URL else DATABASE_URL}")


class Track(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    snapshot_id: int = Field(foreign_key="platformsnapshot.id", index=True)
    position: int
    title: str
    artist: str | None = None
    source_url: str | None = None


class PlatformSnapshot(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    platform: str = Field(index=True)
    display_name: str
    homepage: str
    description: str
    retrieved_at: datetime


def init_db() -> None:
    SQLModel.metadata.create_all(engine)


def save_snapshots(snapshots: Iterable[dict]) -> dict:
    """Store snapshots and return a summary payload."""

    platforms = 0
    track_count = 0
    with Session(engine) as session:
        for snapshot in snapshots:
            platforms += 1
            db_snapshot = PlatformSnapshot(
                platform=snapshot["platform"],
                display_name=snapshot["display_name"],
                homepage=snapshot["homepage"],
                description=snapshot["description"],
                retrieved_at=snapshot["retrieved_at"],
            )
            session.add(db_snapshot)
            session.flush()

            for track in snapshot.get("tracks", []):
                track_count += 1
                session.add(
                    Track(
                        snapshot_id=db_snapshot.id,
                        position=int(track.get("position", track_count)),
                        title=track.get("title") or "Unknown",
                        artist=track.get("artist"),
                        source_url=track.get("source_url"),
                    )
                )
        session.commit()

    return {"platforms": platforms, "tracks": track_count}


def get_latest_snapshot_dicts() -> List[dict]:
    """Return the most recent snapshot per platform as dictionaries."""

    with Session(engine) as session:
        subquery = (
            select(
                PlatformSnapshot.platform,
                func.max(PlatformSnapshot.retrieved_at).label("retrieved_at"),
            )
            .group_by(PlatformSnapshot.platform)
            .subquery()
        )

        stmt = (
            select(PlatformSnapshot)
            .join(
                subquery,
                (PlatformSnapshot.platform == subquery.c.platform)
                & (PlatformSnapshot.retrieved_at == subquery.c.retrieved_at),
            )
            .order_by(PlatformSnapshot.retrieved_at.desc())
        )

        snapshots = session.exec(stmt).unique().all()
        return [_snapshot_to_dict(session, snapshot) for snapshot in snapshots]


def get_snapshot_history_dicts(platform: str, limit: int = 10) -> List[dict]:
    with Session(engine) as session:
        stmt = (
            select(PlatformSnapshot)
            .where(PlatformSnapshot.platform == platform)
            .order_by(PlatformSnapshot.retrieved_at.desc())
            .limit(limit)
        )
        snapshots = session.exec(stmt).unique().all()
        return [_snapshot_to_dict(session, snapshot) for snapshot in snapshots]


def _snapshot_to_dict(session: Session, snapshot: PlatformSnapshot) -> dict:
    tracks_stmt = (
        select(Track)
        .where(Track.snapshot_id == snapshot.id)
        .order_by(Track.position.asc())
    )
    tracks = [
        {
            "position": track.position,
            "title": track.title,
            "artist": track.artist,
            "source_url": track.source_url,
        }
        for track in session.exec(tracks_stmt)
    ]

    return {
        "platform": snapshot.platform,
        "display_name": snapshot.display_name,
        "homepage": snapshot.homepage,
        "description": snapshot.description,
        "retrieved_at": snapshot.retrieved_at,
        "tracks": tracks,
    }
