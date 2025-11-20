"""Collectors for third-party music platform data."""

from __future__ import annotations

from typing import Callable, Dict, List, TypedDict


class TrackDict(TypedDict, total=False):
    position: int
    title: str
    artist: str | None
    source_url: str | None


class Collector(TypedDict):
    slug: str
    name: str
    homepage: str
    collector: Callable[[int], List[TrackDict]]
    description: str


REGISTRY: Dict[str, Collector] = {}


def _register_collectors() -> None:
    from . import audiomack, apple_music, deezer, turntable
    from scraper import scrape_boomplay_charts

    REGISTRY.update(
        {
            "audiomack": {
                "slug": "audiomack",
                "name": "Audiomack Trending",
                "homepage": "https://audiomack.com/trending",
                "collector": audiomack.fetch_audiomack_trending,
                "description": "Trending songs scraped from the public Audiomack charts page.",
            },
            "apple-music": {
                "slug": "apple-music",
                "name": "Apple Music Top Songs Nigeria",
                "homepage": "https://music.apple.com/ng/playlist/top-songs-in-nigeria/pl.2a7a5b0c62724d42af7d19e7936e70ef",
                "collector": apple_music.fetch_apple_music_top_songs,
                "description": "Official Apple Music Nigeria Top Songs RSS feed.",
            },
            "deezer": {
                "slug": "deezer",
                "name": "Deezer Global Chart",
                "homepage": "https://www.deezer.com/en/channels/explore",
                "collector": deezer.fetch_deezer_top_tracks,
                "description": "Top tracks from Deezer's public chart API.",
            },
            "boomplay": {
                "slug": "boomplay",
                "name": "Boomplay Top 100 Nigeria",
                "homepage": "https://www.boomplay.com/charts/Top100Nigeria",
                "collector": scrape_boomplay_charts,
                "description": "Scraped Boomplay Top 100 Nigeria chart.",
            },
            "turntable": {
                "slug": "turntable",
                "name": "TurnTable Top 100",
                "homepage": "https://www.turntablecharts.com/",
                "collector": turntable.fetch_turntable_top_100,
                "description": "TurnTable Charts (Nigeria) weekly rankings scraped for top songs.",
            },
        }
    )


_register_collectors()


__all__ = ["REGISTRY", "Collector", "TrackDict"]
