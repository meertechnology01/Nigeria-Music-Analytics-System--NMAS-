"""Web scraping helpers for the Nigeria Music Analytics System (NMAS) prototype.

These utilities intentionally err on the side of being defensive. During the
hackathon we rely on publicly visible charts, but always double-check the
website's ``robots.txt`` and terms of service before scraping at scale.
"""

from __future__ import annotations

import logging
import random
import re
import json
from typing import List

import requests
from bs4 import BeautifulSoup

logger = logging.getLogger(__name__)

BOOMPLAY_CHART_URL = "https://www.boomplay.com/charts/Top100Nigeria"
TURNTABLE_CHART_URL = "https://www.turntablecharts.com/charts/1"


def scrape_boomplay_charts(limit: int = 20) -> List[dict]:
    """Scrape the Boomplay Top 100 Nigeria chart for the top entries.

    Notes
    -----
    * Respect Boomplay's ``robots.txt`` and terms of service before deploying
      this in production. Many platforms restrict automated access.
    * The page structure may change at any time, so the parser below is written
      defensively and falls back to sample data when it cannot extract titles.
    """

    headers = {
        "User-Agent": "AfrobeatsEconomicEngine/0.1 (+https://example.com)"
    }

    try:
        response = requests.get(BOOMPLAY_CHART_URL, headers=headers, timeout=10)
        response.raise_for_status()
    except requests.RequestException as exc:  # pragma: no cover - network errors
        logger.error("Failed to fetch Boomplay charts: %s", exc)
        return _sample_boomplay_entries(limit)

    soup = BeautifulSoup(response.text, "html.parser")
    candidates = soup.select(".chart-list .chart-item .title")

    rows = []
    for position, node in enumerate(candidates, start=1):
        title = node.get_text(strip=True)
        artist_node = node.find_next("p", class_="artist")
        artist = artist_node.get_text(strip=True) if artist_node else None
        link_node = node.find_parent("a")
        source_url = link_node["href"] if link_node and link_node.has_attr("href") else None

        if not title:
            continue

        rows.append(
            {
                "position": position,
                "title": title,
                "artist": artist,
                "source_url": source_url,
            }
        )
        if len(rows) >= limit:
            break

    if not rows:
        logger.warning("Boomplay parser found no titles; returning sample data.")
        return _sample_boomplay_entries(limit)

    return rows


def _sample_boomplay_entries(limit: int) -> List[dict]:
    """Provide deterministic sample entries for offline development."""

    sample = [
        {"position": 1, "title": "Calm Down", "artist": "Rema", "source_url": None},
        {"position": 2, "title": "Ku Lo Sa", "artist": "Oxlade", "source_url": None},
        {"position": 3, "title": "Rush", "artist": "Ayra Starr", "source_url": None},
        {"position": 4, "title": "Last Last", "artist": "Burna Boy", "source_url": None},
        {"position": 5, "title": "Organise", "artist": "Asake", "source_url": None},
        {"position": 6, "title": "Bandana", "artist": "Fireboy DML", "source_url": None},
        {"position": 7, "title": "Terminator", "artist": "Asake", "source_url": None},
        {"position": 8, "title": "Sugarcane", "artist": "Camidoh", "source_url": None},
        {"position": 9, "title": "Electricity", "artist": "Pheelz", "source_url": None},
        {"position": 10, "title": "Soso", "artist": "Omah Lay", "source_url": None},
    ]

    return sample[:limit]


def scrape_turntable_top_100() -> List[dict]:
    """Scrape the Top 100 songs from Turntable Charts.
    
    Returns a list of dicts with: rank, title, artist, estimated_streams, 
    last_position, weeks_on_chart, image_url, music_link, chart_category, chart_week.
    """
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0 Safari/537.36'
    }

    try:
        response = requests.get(TURNTABLE_CHART_URL, headers=headers, timeout=20)
        response.raise_for_status()
    except requests.RequestException as exc:
        logger.error("Failed to fetch Turntable charts: %s", exc)
        return _generate_turntable_demo_data()

    html_text = response.text
    data = _extract_turntable_next_data(html_text)
    
    if data:
        return data
    
    # Fallback to demo data if parsing fails
    logger.warning("Turntable parser found no data; returning demo data.")
    return _generate_turntable_demo_data()


def _extract_turntable_next_data(html_text: str) -> List[dict]:
    """Parse TurntableCharts Next.js __NEXT_DATA__ JSON and return chart items."""
    try:
        m = re.search(r'<script[^>]*id="__NEXT_DATA__"[^>]*>(.*?)</script>', html_text, re.S)
        if not m:
            return []
        
        j = json.loads(m.group(1))
        pp = (j.get('props') or {}).get('pageProps') or {}

        # Primary: pageProps.chartData.chartItems
        items = []
        chart_category = None
        chart_week = None
        chartData = pp.get('chartData') or {}
        
        if isinstance(chartData, dict):
            items = chartData.get('chartItems') or []
            chart_category = chartData.get('category')
            chart_week = chartData.get('dateCreated') or chartData.get('week')

        # Heuristic 1: chart -> items list
        if not items:
            chart = pp.get('chart') or {}
            items = chart.get('items') or chart.get('songs') or []

        # Heuristic 2: nested under data or initialData
        if not items and isinstance(pp.get('data'), dict):
            data = pp['data']
            if isinstance(data.get('chart'), dict):
                c2 = data['chart']
                items = c2.get('items') or c2.get('songs') or []

        # Heuristic 3: scan for any list containing track info
        if not items:
            items = _find_chart_items(pp) or []

        if not items or not isinstance(items, list):
            return []

        records = []
        base_streams = 2_500_000
        
        for i, it in enumerate(items[:100]):  # Top 100 only
            rank = it.get('position') or it.get('rank') or it.get('index') or (i + 1)

            # Title extraction
            title = (
                it.get('title') or
                (it.get('track') or {}).get('title') or
                it.get('name') or
                (it.get('song') or {}).get('title') or
                f"Track {i+1}"
            )
            
            # Artist extraction
            artist_val = (
                it.get('artiste') or
                it.get('artist') or
                (it.get('track') or {}).get('artist') or
                (it.get('song') or {}).get('artist') or
                it.get('author') or
                it.get('artists')
            )
            
            artist = "Unknown"
            if isinstance(artist_val, list):
                if artist_val and isinstance(artist_val[0], dict):
                    artist = ', '.join(a.get('name', '') for a in artist_val if isinstance(a, dict) and a.get('name'))
                else:
                    artist = ', '.join(map(str, artist_val))
            elif artist_val:
                artist = str(artist_val)

            streams = max(1000, int(base_streams * (1 - (i / 120)) * random.uniform(0.95, 1.05)))

            records.append({
                'rank': int(rank) if str(rank).isdigit() else (i + 1),
                'title': str(title).strip(),
                'artist': str(artist).strip(),
                'estimated_streams': streams,
                'last_position': it.get('lastPosition'),
                'weeks_on_chart': it.get('weeksOnChart'),
                'image_url': it.get('imageUri') or it.get('image'),
                'music_link': it.get('musicLink'),
                'chart_category': chart_category,
                'chart_week': chart_week,
            })

        return records
        
    except Exception as e:
        logger.error(f"__NEXT_DATA__ parsing failed: {e}")
        return []


def _find_chart_items(obj):
    """Recursively search for chart items in nested JSON structure."""
    if isinstance(obj, dict):
        for v in obj.values():
            res = _find_chart_items(v)
            if res:
                return res
    elif isinstance(obj, list):
        for v in obj:
            if isinstance(v, dict) and (
                {'title', 'artist'} <= set(map(str.lower, v.keys())) or
                {'name', 'artists'} <= set(map(str.lower, v.keys())) or
                {'track', 'position'} <= set(map(str.lower, v.keys()))
            ):
                return obj
            res = _find_chart_items(v)
            if res:
                return res
    return None


def _generate_turntable_demo_data(n: int = 100) -> List[dict]:
    """Generate demo chart data for development/fallback."""
    random.seed(42)
    demo = []
    base_streams = 2_500_000
    
    demo_artists = [
        "Rema", "Burna Boy", "Wizkid", "Davido", "Asake", "Ayra Starr",
        "Fireboy DML", "Omah Lay", "Oxlade", "Tems", "Kizz Daniel", 
        "Tiwa Savage", "Olamide", "Ckay", "Ruger", "Joeboy", "Victony",
        "Ladipoe", "Mayorkun", "Zinoleesky"
    ]
    
    for i in range(n):
        rank = i + 1
        artist = random.choice(demo_artists)
        title = f"{artist} - Hit Song {rank}"
        streams = int(base_streams * (1 - (i / (n + 5))) * random.uniform(0.85, 1.05))
        
        demo.append({
            "rank": rank,
            "title": title,
            "artist": artist,
            "estimated_streams": streams,
            "last_position": None,
            "weeks_on_chart": None,
            "image_url": None,
            "music_link": None,
            "chart_category": "Top 100",
            "chart_week": None,
        })

    return demo

