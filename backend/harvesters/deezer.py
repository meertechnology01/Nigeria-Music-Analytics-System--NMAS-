"""Deezer public chart API client."""

from __future__ import annotations

import logging
from typing import List

import requests

from . import TrackDict

logger = logging.getLogger(__name__)

DEEZER_CHART_URL = "https://api.deezer.com/chart/0/tracks"


def fetch_deezer_top_tracks(limit: int = 20) -> List[TrackDict]:
    """Fetch top tracks from Deezer's public chart endpoint."""

    params = {"limit": limit}

    try:
        response = requests.get(DEEZER_CHART_URL, params=params, timeout=10)
        response.raise_for_status()
        payload = response.json()
    except requests.RequestException as exc:  # pragma: no cover - network errors
        logger.error("Failed to query Deezer chart API: %s", exc)
        return _sample_data(limit)
    except ValueError as exc:
        logger.error("Deezer chart API returned invalid JSON: %s", exc)
        return _sample_data(limit)

    data = payload.get("data", [])

    tracks: List[TrackDict] = []
    for index, item in enumerate(data, start=1):
        artist = item.get("artist", {}).get("name") if isinstance(item.get("artist"), dict) else None
        tracks.append(
            {
                "position": index,
                "title": item.get("title"),
                "artist": artist,
                "source_url": item.get("link"),
            }
        )
        if len(tracks) >= limit:
            break

    if not tracks:
        logger.warning("Deezer API returned no tracks; using fallback dataset.")
        return _sample_data(limit)

    return tracks


def _sample_data(limit: int) -> List[TrackDict]:
    sample = [
        {"position": 1, "title": "Calm Down", "artist": "Rema", "source_url": None},
        {"position": 2, "title": "Rush", "artist": "Ayra Starr", "source_url": None},
        {"position": 3, "title": "Soweto", "artist": "Victony", "source_url": None},
        {"position": 4, "title": "Who Is Your Guy?", "artist": "Spyro", "source_url": None},
        {"position": 5, "title": "Bounce", "artist": "Rema", "source_url": None},
        {"position": 6, "title": "City Boys", "artist": "Burna Boy", "source_url": None},
        {"position": 7, "title": "Lonely At The Top", "artist": "Asake", "source_url": None},
        {"position": 8, "title": "Peru", "artist": "Fireboy DML", "source_url": None},
        {"position": 9, "title": "Bandana", "artist": "Fireboy DML & Asake", "source_url": None},
        {"position": 10, "title": "Essence", "artist": "Wizkid", "source_url": None},
    ]
    return sample[:limit]
