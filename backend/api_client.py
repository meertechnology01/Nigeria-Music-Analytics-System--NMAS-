"""API clients for third-party services used by the Nigeria Music Analytics System (NMAS).

The functions in this module should remain thin wrappers around external APIs so
that they can be mocked easily during tests. Where possible, graceful fallbacks
are provided so the prototype continues to work without privileged credentials.
"""

from __future__ import annotations

from typing import Dict

import os
import logging

import requests

logger = logging.getLogger(__name__)

YOUTUBE_API_URL = "https://www.googleapis.com/youtube/v3/videos"


def get_youtube_stats(video_id: str, api_key: str | None = None) -> Dict[str, int]:
    """Fetch lightweight statistics for a YouTube video.

    Parameters
    ----------
    video_id: str
        The unique YouTube video identifier (11 characters).
    api_key: str | None
        Google API key. Optional to make local development easier; if not
        provided the function will look for a ``YOUTUBE_API_KEY`` environment
        variable. When no key is available or the request fails, a transparent
        fallback with illustrative data is returned.

    Returns
    -------
    Dict[str, int]
        A dictionary with integer counts for ``viewCount``, ``likeCount`` and
        ``commentCount``.
    """

    effective_key = api_key or os.getenv("YOUTUBE_API_KEY")
    if not effective_key:
        logger.warning("No YOUTUBE_API_KEY provided; returning sample metrics.")
        return _sample_youtube_metrics()

    params = {
        "id": video_id,
        "part": "statistics",
        "key": effective_key,
    }

    try:
        response = requests.get(YOUTUBE_API_URL, params=params, timeout=10)
        response.raise_for_status()
        payload = response.json()
        items = payload.get("items", [])
        if not items:
            logger.warning("YouTube API returned no items; using fallback data.")
            return _sample_youtube_metrics()

        stats = items[0].get("statistics", {})
        return {
            "viewCount": int(stats.get("viewCount", 0)),
            "likeCount": int(stats.get("likeCount", 0)),
            "commentCount": int(stats.get("commentCount", 0)),
        }
    except requests.RequestException as exc:  # pragma: no cover - network errors
        logger.error("YouTube API request failed: %s", exc)
        return _sample_youtube_metrics()
    except (TypeError, ValueError) as exc:
        logger.error("Unexpected YouTube API payload: %s", exc)
        return _sample_youtube_metrics()


def _sample_youtube_metrics() -> Dict[str, int]:
    """Provide deterministic sample metrics for offline development."""

    return {
        "viewCount": 3_200_000,
        "likeCount": 115_000,
        "commentCount": 9_250,
    }
