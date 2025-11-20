"""Data pipeline orchestration for the Nigeria Music Analytics System (NMAS)."""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Dict, Iterable, List

import logging

from harvesters import REGISTRY, TrackDict

logger = logging.getLogger(__name__)


def collect_platform_snapshots(limit: int = 20) -> List[Dict[str, Any]]:
    """Collect charts from all configured platforms.

    Returns
    -------
    list of dict
        Each entry contains ``platform``, ``display_name``, ``retrieved_at``
        (ISO formatted string), ``tracks`` (list of TrackDict), and ``metadata``.
    """

    snapshots: List[Dict[str, Any]] = []
    timestamp = datetime.now(timezone.utc)

    for slug, info in REGISTRY.items():
        collector = info["collector"]
        try:
            tracks = collector(limit)
        except Exception as exc:  # pragma: no cover - defensive catch
            logger.exception("Collector for %s failed: %s", slug, exc)
            tracks = []

        snapshots.append(
            {
                "platform": slug,
                "display_name": info["name"],
                "homepage": info["homepage"],
                "retrieved_at": timestamp,
                "tracks": _normalise_tracks(tracks),
                "description": info["description"],
            }
        )

    return snapshots


def collect_single_platform(slug: str, limit: int = 20) -> Dict[str, Any]:
    info = REGISTRY.get(slug)
    if not info:
        raise KeyError(slug)

    timestamp = datetime.now(timezone.utc)
    collector = info["collector"]
    try:
        tracks = collector(limit)
    except Exception as exc:  # pragma: no cover - defensive
        logger.exception("Collector for %s failed: %s", slug, exc)
        tracks = []

    return {
        "platform": slug,
        "display_name": info["name"],
        "homepage": info["homepage"],
        "retrieved_at": timestamp,
        "tracks": _normalise_tracks(tracks),
        "description": info["description"],
    }


def list_platforms() -> Iterable[Dict[str, str]]:
    for slug, info in REGISTRY.items():
        yield {
            "platform": slug,
            "display_name": info["name"],
            "homepage": info["homepage"],
            "description": info["description"],
        }


def _normalise_tracks(tracks: List[TrackDict]) -> List[Dict[str, Any]]:
    normalised: List[Dict[str, Any]] = []
    for index, track in enumerate(tracks, start=1):
        normalised.append(
            {
                "position": int(track.get("position", index)),
                "title": track.get("title") or "Unknown",
                "artist": track.get("artist"),
                "source_url": track.get("source_url"),
            }
        )
    return normalised
