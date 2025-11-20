"""Apple Music chart fetcher using the public Marketing Tools RSS."""

from __future__ import annotations

import logging
from typing import List

import requests

from . import TrackDict

logger = logging.getLogger(__name__)

APPLE_MUSIC_RSS = "https://rss.applemarketingtools.com/api/v2/ng/music/most-played/50/tracks.json"


def fetch_apple_music_top_songs(limit: int = 20) -> List[TrackDict]:
    """Fetch Apple Music Nigeria top songs via the marketing tools JSON feed."""

    try:
        response = requests.get(APPLE_MUSIC_RSS, timeout=10)
        response.raise_for_status()
        payload = response.json()
    except requests.RequestException as exc:  # pragma: no cover - network errors
        logger.error("Failed to retrieve Apple Music RSS feed: %s", exc)
        return _sample_data(limit)
    except ValueError as exc:
        logger.error("Apple Music RSS returned invalid JSON: %s", exc)
        return _sample_data(limit)

    results = payload.get("feed", {}).get("results", [])

    tracks: List[TrackDict] = []
    for index, item in enumerate(results, start=1):
        tracks.append(
            {
                "position": index,
                "title": item.get("name"),
                "artist": item.get("artistName"),
                "source_url": item.get("url"),
            }
        )
        if len(tracks) >= limit:
            break

    if not tracks:
        logger.warning("Apple Music feed is empty; serving fallback dataset.")
        return _sample_data(limit)

    return tracks


def _sample_data(limit: int) -> List[TrackDict]:
    sample = [
        {"position": 1, "title": "Calm Down", "artist": "Rema & Selena Gomez", "source_url": None},
        {"position": 2, "title": "Unavailable", "artist": "Davido feat. Musa Keys", "source_url": None},
        {"position": 3, "title": "Soso", "artist": "Omah Lay", "source_url": None},
        {"position": 4, "title": "Charm", "artist": "Rema", "source_url": None},
        {"position": 5, "title": "Reason", "artist": "Omah Lay", "source_url": None},
        {"position": 6, "title": "People", "artist": "Libianca", "source_url": None},
        {"position": 7, "title": "FEEL", "artist": "Davido", "source_url": None},
        {"position": 8, "title": "Over Me", "artist": "Davido", "source_url": None},
        {"position": 9, "title": "City Boys", "artist": "Burna Boy", "source_url": None},
        {"position": 10, "title": "Lonely At The Top", "artist": "Asake", "source_url": None},
    ]
    return sample[:limit]
