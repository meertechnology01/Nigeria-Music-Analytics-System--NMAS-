"""Audiomack chart scraper."""

from __future__ import annotations

import logging
from typing import List

import requests
from bs4 import BeautifulSoup

from . import TrackDict

logger = logging.getLogger(__name__)

AUDIOMACK_TRENDING_URL = "https://audiomack.com/trending"


def fetch_audiomack_trending(limit: int = 20) -> List[TrackDict]:
    """Scrape the public Audiomack trending page.

    Audiomack does not provide an officially documented public API for charts, so
    we conservatively parse the public trending HTML. When the structure changes
    or the request fails, a deterministic fallback dataset keeps the prototype
    functional.
    """

    headers = {
        "User-Agent": "AfrobeatsEconomicEngine/0.1 (+https://example.com)",
    }

    try:
        response = requests.get(AUDIOMACK_TRENDING_URL, headers=headers, timeout=10)
        response.raise_for_status()
    except requests.RequestException as exc:  # pragma: no cover - network errors
        logger.error("Failed to fetch Audiomack trending page: %s", exc)
        return _sample_data(limit)

    soup = BeautifulSoup(response.text, "html.parser")
    track_nodes = soup.select("article.music__item")

    tracks: List[TrackDict] = []
    for index, node in enumerate(track_nodes, start=1):
        title = node.get("data-title") or node.select_one(".music__title")
        if hasattr(title, "get_text"):
            title = title.get_text(strip=True)

        artist_node = node.select_one(".music__artist")
        artist = artist_node.get_text(strip=True) if artist_node else None

        link_node = node.find("a", href=True)
        url = f"https://audiomack.com{link_node['href']}" if link_node else None

        if not title:
            continue

        tracks.append(
            {
                "position": index,
                "title": str(title),
                "artist": artist,
                "source_url": url,
            }
        )

        if len(tracks) >= limit:
            break

    if not tracks:
        logger.warning("Audiomack parser produced no results; using fallback data.")
        return _sample_data(limit)

    return tracks


def _sample_data(limit: int) -> List[TrackDict]:
    sample = [
        {"position": 1, "title": "Alone", "artist": "Burna Boy", "source_url": None},
        {"position": 2, "title": "Sability", "artist": "Ayra Starr", "source_url": None},
        {"position": 3, "title": "Party No Dey Stop", "artist": "Adekunle Gold", "source_url": None},
        {"position": 4, "title": "Who Is Your Guy", "artist": "Spyro", "source_url": None},
        {"position": 5, "title": "Unavailable", "artist": "Davido", "source_url": None},
        {"position": 6, "title": "Charm", "artist": "Rema", "source_url": None},
        {"position": 7, "title": "Feel", "artist": "Davido", "source_url": None},
        {"position": 8, "title": "Gwagwalada", "artist": "BNXN", "source_url": None},
        {"position": 9, "title": "City Boys", "artist": "Burna Boy", "source_url": None},
        {"position": 10, "title": "Asiwaju", "artist": "Ruger", "source_url": None},
    ]
    return sample[:limit]
