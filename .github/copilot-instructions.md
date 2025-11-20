# Nigeria Music Analytics System (NMAS) - AI Coding Agent Guide

## Overview
Real-time analytics platform tracking Nigeria's Afrobeats industry economic impact (GDP, jobs, exports). **FastAPI backend** + **React TypeScript frontend** with **Gemini AI** chat assistant and **7-platform data aggregation**.

## Architecture Essentials

### Harvester Registry Pattern (Core Pattern)
All data collection uses a **plugin-style registry** in `backend/harvesters/__init__.py`:

```python
REGISTRY: Dict[str, Collector] = {
    "audiomack": {..., "collector": audiomack.fetch_audiomack_trending},
    "apple-music": {..., "collector": apple_music.fetch_apple_music_top_songs},
    # Add new platforms here - just implement TrackDict signature
}
```

**To add a new platform**: Create harvester function `(limit: int) -> List[TrackDict]`, register in `REGISTRY`. System auto-discovers via `pipeline.collect_platform_snapshots()`.

### 3-Tier Fallback Strategy
Every harvester follows: **API → Web Scraping → Demo Data**

```python
try:
    return fetch_from_api(platform)  # Tier 1
except APIError:
    try:
        return scrape_website(platform)  # Tier 2
    except ScrapingError:
        return get_demo_data(platform)  # Tier 3
```

Never let data collection break the app. See `scraper.py` `_sample_boomplay_entries()` for demo data pattern.

### Economic Model Constants
**NEVER hardcode these** - import from `model.py`:

```python
GDP_MULTIPLIER = 1.5           # Indirect economic activity
REVENUE_PER_STREAM = 0.003     # USD per stream (average)
EXPORT_MULTIPLIER = 0.42       # Diaspora consumption %
JOB_COST_USD = 15000          # Average creative industry salary
```

Calculations: `revenue = streams × 0.003`, `gdp = revenue × 1.5`, `jobs = revenue ÷ 15000`, `exports = revenue × 0.42`

### Database Schema
**SQLModel ORM** (Pydantic + SQLAlchemy). Two main tables:

- `PlatformSnapshot`: Metadata per harvest run (platform, timestamp, display_name)
- `Track`: Individual songs (title, artist, position, streams) linked via `snapshot_id` FK

**SQLite** (dev) at `data/engine.db` | **PostgreSQL** (prod). Connection pooling auto-configured based on `DATABASE_URL` prefix.

## Critical Workflows

### Starting the System
**Single command**: `.\scripts\start.ps1` (PowerShell)
- Checks Python 3.13+ and Node.js 18+
- Installs deps if missing (backend: pip in venv, frontend: npm)
- Launches **uvicorn** (backend:8000) + **Vite** (frontend:5173) in parallel jobs
- Press Ctrl+C to stop both

**Development mode**: `.\scripts\dev.ps1` for hot reload. **Never** use `python main.py` directly - always via uvicorn.

### Testing Pattern
**Backend**: `pytest backend/tests/ -v --cov=backend`

Tests use **monkeypatch** to mock external calls:
```python
def test_kpi_response(monkeypatch):
    monkeypatch.setattr("main.get_youtube_stats", lambda _: {"viewCount": 1000000})
    monkeypatch.setattr("main.collect_platform_snapshots", lambda limit: [])
    # ... assertions
```

Run tests before PRs. Coverage target: >85% for core modules.

### Data Harvesting Flow
1. **Trigger**: `POST /api/v1/harvest/run` or scheduled cron
2. **Pipeline** (`pipeline.py`): Loops through `REGISTRY`, calls each collector
3. **Normalization**: Converts to `TrackDict` standard format
4. **Storage** (`storage.py`): Saves to DB via SQLModel session
5. **Frontend**: Polls `/api/v1/harvest/recent` for latest snapshots

**Defensive design**: If a platform fails, others still complete. Check logs via `logger.error()`.

### AI Chat Integration (Beats AI)
**Gemini 2.0 Flash** with RAG (Retrieval-Augmented Generation):

```python
# ai_engine.py → KnowledgeBase stores economic models, glossary, policy docs
context = knowledge_base.get_context_for_query(query)
response = model.generate_content(f"{system_prompt}\n{context}\n{query}")
```

**Adding knowledge**: Use `KnowledgeBase.add_document(title, content, doc_type="economic_model")` in `_load_initial_knowledge()`.

**Endpoints**: `POST /api/v1/ai/chat` (queries), `GET /api/v1/ai/audit-logs` (compliance tracking).

## Project-Specific Conventions

### Import Organization
```python
# 1. Future annotations first
from __future__ import annotations

# 2. Standard library
from datetime import datetime
from typing import List, Dict

# 3. Third-party
from fastapi import FastAPI
from sqlmodel import Field

# 4. Local modules
from config import get_settings
from pipeline import collect_platform_snapshots
```

### Error Handling
Use **custom exceptions** from `exceptions.py`:
```python
from exceptions import NotFoundException, AppException

if not resource:
    raise NotFoundException(message=f"Platform '{slug}' not found")
```

FastAPI exception handlers registered in `main.py` handle conversion to JSON error responses.

### Configuration Management
**Never hardcode secrets**. Use `config.py` `Settings` (Pydantic BaseSettings):
```python
from config import get_settings
settings = get_settings()  # Cached singleton
api_key = settings.gemini_api_key  # From .env or default
```

`.env` files **not committed** to Git. See `.env.example` for reference.

### Frontend State Management
**React Context API** via `SettingsContext.tsx` for global state (currency, theme). **No Redux/Zustand** - keep simple.

API calls in `lib/api.ts` with centralized error handling:
```typescript
import { getKpis, runHarvest, APIError } from '@/lib/api';

try {
  const kpis = await getKpis();
} catch (error) {
  if (error instanceof APIError) {
    // Handle API errors with status codes
  }
}
```

### Component Structure
**Dashboard pattern**: Each view (Overview, Trends, Artists) is a self-contained page in `frontend/src/pages/`. Shared UI in `components/` (DashboardLayout, StatCard, ErrorBoundary).

Use **Tailwind utility classes** + **liquid glass effects** (backdrop-blur, bg-opacity). Dark mode via `bg-gray-900` variants.

## Integration Points

### TurnTable Charts (Official Nigerian Data)
**Primary data source** for artist rankings. Scraper in `scraper.py`:
1. Tries JSON extraction from `__NEXT_DATA__` script tag (Next.js site)
2. Falls back to BeautifulSoup DOM parsing
3. Returns `rank, title, artist, estimated_streams, weeks_on_chart`

**CSV Export**: `GET /api/v1/charts/turntable/download` generates downloadable CSV for stakeholders.

### YouTube Data API
`api_client.py` `get_youtube_stats()` fetches view counts. **Rate limited** to 10K units/day. Cache results in production.

### Gemini AI API
**Configured key** in `config.py`. Model: `gemini-2.0-flash-exp` (latest). Temperature: 0.7 for balanced responses. Max tokens: 2048.

Fallback to internal model if Gemini unavailable (see `ai_engine.py` `_generate_internal_response()`).

## Common Pitfalls

1. **Don't bypass the registry** - Always add new platforms via `REGISTRY`, not direct imports in `main.py`
2. **Database sessions** - Use context managers: `with Session(engine) as session:` to prevent leaks
3. **Scrapers break easily** - Always have demo data fallback. TurnTable HTML structure changes weekly.
4. **CORS in development** - Backend allows `localhost:5173,5174` (Vite ports). Update `cors_origins` in `.env` if needed.
5. **PowerShell execution policy** - If scripts fail: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`

## Debugging Tips

- **Backend logs**: Check `backend/logs/app.log` for exceptions
- **Frontend console**: React error boundaries catch crashes - check browser DevTools
- **API docs**: Visit `http://localhost:8000/docs` (FastAPI Swagger) to test endpoints manually
- **Database inspection**: Use SQLite browser on `data/engine.db` or connect via SQLAlchemy session
- **Harvester issues**: Test individual collectors in Python REPL: `from harvesters.turntable import fetch_turntable_top_100; fetch_turntable_top_100(10)`

## Key Files Reference

- `backend/main.py`: FastAPI app, all endpoints, middleware setup
- `backend/pipeline.py`: Orchestrates multi-platform data collection
- `backend/harvesters/__init__.py`: Registry pattern for extensibility
- `backend/ai_engine.py`: Beats AI, RAG, knowledge base
- `backend/storage.py`: Database ORM models, session management
- `frontend/src/App.tsx`: React router, tab-based navigation
- `frontend/src/lib/api.ts`: Centralized API client with error handling
- `scripts/start.ps1`: Primary development workflow entry point

## When Making Changes

- **Backend schema changes**: Generate Alembic migration: `alembic revision --autogenerate -m "description"`
- **New endpoints**: Add OpenAPI tags for documentation grouping (e.g., `tags=["Charts"]`)
- **New harvesters**: Update both `REGISTRY` and `pipeline.py` to handle new platform metadata
- **Frontend API changes**: Update TypeScript interfaces in `api.ts` to match backend schemas
- **Economic model updates**: Change constants in `model.py`, document rationale in docstrings, update `ai_engine.py` knowledge base

## Resources

- **Technical spec**: `docs/architecture/TECHNICAL-SPEC.md` (detailed architecture diagrams)
- **Quick start**: `docs/guides/QUICK-START.md` (user-facing setup)
- **Project structure**: `docs/guides/PROJECT-STRUCTURE.md` (full directory tree)
- **API docs (live)**: http://localhost:8000/docs when backend running
