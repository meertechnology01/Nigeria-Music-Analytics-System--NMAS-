from datetime import datetime, timezone

from fastapi.testclient import TestClient


def _fake_youtube_stats(*_, **__):
    return {"viewCount": 1_000_000, "likeCount": 50_000, "commentCount": 2_500}


def _fake_snapshots(limit: int = 20):
    timestamp = datetime(2025, 1, 1, tzinfo=timezone.utc)
    track = {"position": 1, "title": "Song A", "artist": "Artist A", "source_url": None}
    return [
        {
            "platform": "boomplay",
            "display_name": "Boomplay Top 100 Nigeria",
            "homepage": "https://www.boomplay.com/charts/Top100Nigeria",
            "retrieved_at": timestamp,
            "tracks": [track] * min(limit, 5),
            "description": "Mock dataset",
        }
    ]


def _fake_single_platform(slug: str, limit: int = 20):
    return _fake_snapshots(limit=limit)[0] | {"platform": slug}


def _fake_platform_list():
    return [
        {
            "platform": "boomplay",
            "display_name": "Boomplay Top 100 Nigeria",
            "homepage": "https://www.boomplay.com/charts/Top100Nigeria",
            "description": "Mock dataset",
        }
    ]


def test_root_status_ok(monkeypatch):
    from backend import main

    monkeypatch.setattr(main.storage, "init_db", lambda: None)
    client = TestClient(main.app)
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_kpi_response(monkeypatch):
    from backend import main

    monkeypatch.setattr(main, "get_youtube_stats", _fake_youtube_stats)
    monkeypatch.setattr(main, "collect_platform_snapshots", _fake_snapshots)
    monkeypatch.setattr(main.storage, "init_db", lambda: None)

    client = TestClient(main.app)
    response = client.get("/api/kpis")
    payload = response.json()

    assert response.status_code == 200
    assert set(payload.keys()) == {"gdp_contribution", "jobs_supported", "export_revenue"}
    assert payload["jobs_supported"].isdigit()


def test_trend_response(monkeypatch):
    from backend import main

    monkeypatch.setattr(main.storage, "init_db", lambda: None)
    client = TestClient(main.app)
    response = client.get("/api/trends")
    payload = response.json()

    assert response.status_code == 200
    assert len(payload["labels"]) == len(payload["data"])
    assert len(payload["data"]) == 6


def test_platform_share_response(monkeypatch):
    from backend import main

    monkeypatch.setattr(main.storage, "init_db", lambda: None)
    client = TestClient(main.app)
    response = client.get("/api/platform-share")
    payload = response.json()

    assert response.status_code == 200
    assert len(payload["labels"]) == 5
    assert abs(sum(payload["data"]) - 100) < 1e-6


def test_platform_listing(monkeypatch):
    from backend import main

    monkeypatch.setattr(main.storage, "init_db", lambda: None)
    monkeypatch.setattr(main, "list_platforms", _fake_platform_list)

    client = TestClient(main.app)
    response = client.get("/api/v1/platforms")
    assert response.status_code == 200
    assert response.json()[0]["platform"] == "boomplay"


def test_platform_snapshot(monkeypatch):
    from backend import main

    monkeypatch.setattr(main.storage, "init_db", lambda: None)
    monkeypatch.setattr(main, "collect_single_platform", _fake_single_platform)

    client = TestClient(main.app)
    response = client.get("/api/v1/platforms/boomplay")
    payload = response.json()

    assert response.status_code == 200
    assert payload["platform"] == "boomplay"
    assert payload["tracks"][0]["title"] == "Song A"


def test_platform_collection(monkeypatch):
    from backend import main

    monkeypatch.setattr(main.storage, "init_db", lambda: None)
    monkeypatch.setattr(main, "collect_platform_snapshots", _fake_snapshots)

    client = TestClient(main.app)
    response = client.get("/api/v1/platforms/all")
    payload = response.json()

    assert response.status_code == 200
    assert payload["items"][0]["tracks"][0]["position"] == 1


def test_harvest_run(monkeypatch):
    from backend import main

    monkeypatch.setattr(main.storage, "init_db", lambda: None)
    monkeypatch.setattr(main, "collect_platform_snapshots", _fake_snapshots)

    captured = {}

    def _fake_save(data):
        captured["snapshots"] = list(data)
        return {"platforms": len(captured["snapshots"]), "tracks": 5}

    monkeypatch.setattr(main.storage, "save_snapshots", _fake_save)

    client = TestClient(main.app)
    response = client.post("/api/v1/harvest/run")
    payload = response.json()

    assert response.status_code == 200
    assert payload["status"] == "stored"
    assert payload["platforms"] == 1


def test_harvest_recent(monkeypatch):
    from backend import main

    monkeypatch.setattr(main.storage, "init_db", lambda: None)
    monkeypatch.setattr(main.storage, "get_latest_snapshot_dicts", lambda: _fake_snapshots())

    client = TestClient(main.app)
    response = client.get("/api/v1/harvest/recent")
    payload = response.json()

    assert response.status_code == 200
    assert payload["items"][0]["platform"] == "boomplay"


def test_harvest_history(monkeypatch):
    from backend import main

    monkeypatch.setattr(main.storage, "init_db", lambda: None)
    monkeypatch.setattr(main.storage, "get_snapshot_history_dicts", lambda slug, limit=10: _fake_snapshots(limit))

    client = TestClient(main.app)
    response = client.get("/api/v1/harvest/history/boomplay")
    payload = response.json()

    assert response.status_code == 200
    assert len(payload["items"][0]["tracks"]) == 5
