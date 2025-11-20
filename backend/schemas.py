"""Pydantic response models shared across routes."""

from __future__ import annotations

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class Track(BaseModel):
    position: int = Field(..., ge=1)
    title: str
    artist: Optional[str] = None
    source_url: Optional[str] = Field(None, description="Link back to the originating platform")


class PlatformSnapshot(BaseModel):
    platform: str
    display_name: str
    homepage: str
    retrieved_at: datetime
    description: str
    tracks: List[Track]


class PlatformListItem(BaseModel):
    platform: str
    display_name: str
    homepage: str
    description: str


class PlatformCollection(BaseModel):
    items: List[PlatformSnapshot]


class KpiResponse(BaseModel):
    gdp_contribution: str
    jobs_supported: str
    export_revenue: str


class ChartData(BaseModel):
    labels: List[str]
    data: List[float]
