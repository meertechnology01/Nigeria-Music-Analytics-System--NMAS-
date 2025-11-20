"""TurnTable Charts scraper."""

from __future__ import annotations

import logging
from typing import List

import requests
from bs4 import BeautifulSoup

from . import TrackDict

logger = logging.getLogger(__name__)

TURNTABLE_CHART_URL = "https://www.turntablecharts.com/Charts"


def fetch_turntable_top_100(limit: int = 20) -> List[TrackDict]:
    """Scrape TurnTable Charts (Nigeria) weekly top songs."""

    headers = {
        "User-Agent": "AfrobeatsEconomicEngine/0.1 (+https://example.com)",
    }

    try:
        response = requests.get(TURNTABLE_CHART_URL, headers=headers, timeout=10)
        response.raise_for_status()
    except requests.RequestException as exc:  # pragma: no cover - network errors
        logger.error("Failed to download TurnTable charts: %s", exc)
        return _sample_data(limit)

    soup = BeautifulSoup(response.text, "html.parser")
    table_rows = soup.select("table tbody tr")

    tracks: List[TrackDict] = []
    for row in table_rows:
        cells = row.find_all("td")
        if len(cells) < 4:
            continue
        try:
            position = int(cells[0].get_text(strip=True).replace("#", ""))
        except ValueError:
            position = len(tracks) + 1
        title = cells[1].get_text(strip=True)
        artist = cells[2].get_text(strip=True)
        url_tag = cells[1].select_one("a[href]")
        source_url = url_tag["href"] if url_tag else None

        if not title:
            continue

        tracks.append(
            {
                "position": position,
                "title": title,
                "artist": artist or None,
                "source_url": source_url,
            }
        )
        if len(tracks) >= limit:
            break

    if not tracks:
        logger.warning("TurnTable parser found no entries; using fallback dataset.")
        return _sample_data(limit)

    return tracks


def _sample_data(limit: int) -> List[TrackDict]:
    sample = [
        {"position": 1, "title": "Water", "artist": "Tyla", "source_url": None},
        {"position": 2, "title": "Lonely At The Top", "artist": "Asake", "source_url": None},
        {"position": 3, "title": "Pay Me", "artist": "FAVE", "source_url": None},
        {"position": 4, "title": "Ngozi", "artist": "Crayon feat. Ayra Starr", "source_url": None},
        {"position": 5, "title": "Party No Dey Stop", "artist": "Adekunle Gold", "source_url": None},
        {"position": 6, "title": "Jaho", "artist": "Kizz Daniel", "source_url": None},
        {"position": 7, "title": "My G", "artist": "Kizz Daniel", "source_url": None},
        {"position": 8, "title": "Bandana", "artist": "Fireboy DML & Asake", "source_url": None},
        {"position": 9, "title": "Sittin' On Top Of The World", "artist": "Burna Boy", "source_url": None},
        {"position": 10, "title": "Feel", "artist": "Davido", "source_url": None},
    ]
    return sample[:limit]
