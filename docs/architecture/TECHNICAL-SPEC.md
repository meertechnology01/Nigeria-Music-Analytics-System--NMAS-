# 🔧 Technical Specification - Nigeria Music Analytics System (NMAS)

## System Overview

**Version:** 1.0.0  
**Last Updated:** November 14, 2025  
**Status:** Production-Ready Prototype  

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         PRESENTATION LAYER                      │
│                     (React 18.2 + TypeScript)                   │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐           │
│  │   Overview   │ │    Trends    │ │   Artists    │           │
│  │  Dashboard   │ │  Dashboard   │ │  Dashboard   │           │
│  └──────────────┘ └──────────────┘ └──────────────┘           │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐           │
│  │   Economic   │ │   Beats AI   │ │     Data     │           │
│  │    Impact    │ │     Chat     │ │  Management  │           │
│  └──────────────┘ └──────────────┘ └──────────────┘           │
└────────────────────────────┬────────────────────────────────────┘
                             │ REST API (HTTP/JSON)
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                        APPLICATION LAYER                        │
│                      (FastAPI 0.111.0 + Uvicorn)               │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    API ENDPOINTS                         │  │
│  │  • GET  /api/kpis              - Economic KPIs          │  │
│  │  • GET  /api/trends            - Time-series data       │  │
│  │  • GET  /api/platform-share    - Market distribution    │  │
│  │  • POST /api/v1/harvest/run    - Trigger collection     │  │
│  │  • GET  /api/v1/charts/turntable - Top 100 artists      │  │
│  │  • GET  /api/v1/charts/turntable/download - CSV export  │  │
│  │  • POST /api/v1/ai/chat        - AI query endpoint      │  │
│  └──────────────────────────────────────────────────────────┘  │
│                             │                                    │
│       ┌─────────────────────┼─────────────────────┐            │
│       ▼                     ▼                     ▼            │
│  ┌─────────┐         ┌──────────┐         ┌──────────┐        │
│  │Pipeline │         │ Economic │         │  Gemini  │        │
│  │ Manager │         │  Model   │         │AI Engine │        │
│  │pipeline.│         │ model.py │         │ai_engine.│        │
│  │   py    │         │          │         │   py     │        │
│  └────┬────┘         └──────────┘         └──────────┘        │
│       │                                                         │
│       ▼                                                         │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │             HARVESTER REGISTRY PATTERN                   │  │
│  │  (Extensible plugin system for data collectors)          │  │
│  │                                                           │  │
│  │  harvesters/__init__.py REGISTRY = {                     │  │
│  │    "youtube": YouTubeHarvester,                          │  │
│  │    "apple-music": AppleMusicHarvester,                   │  │
│  │    "deezer": DeezerHarvester,                            │  │
│  │    "turntable": TurnTableScraper,                        │  │
│  │    "audiomack": AudiomackScraper,                        │  │
│  │    "boomplay": BoomplayScraper                           │  │
│  │  }                                                        │  │
│  └────────────────────────┬─────────────────────────────────┘  │
└───────────────────────────┼─────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                         DATA LAYER                              │
│                  (SQLModel ORM + SQLAlchemy)                    │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Models:                                                   │  │
│  │  • Track(id, title, artist, platform, streams, ...)     │  │
│  │  • PlatformSnapshot(id, platform, data, timestamp, ...) │  │
│  │  • (Future: Artist, Album, Genre, Geography)            │  │
│  └──────────────────────────────────────────────────────────┘  │
│                             │                                    │
│                             ▼                                    │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  SQLite (Development)  │  PostgreSQL (Production)        │  │
│  │  Location: data/engine.db │ AWS RDS / Render Postgres   │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘

EXTERNAL INTEGRATIONS:
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   YouTube    │  │  TurnTable   │  │    Deezer    │
│   Data API   │  │   Charts     │  │     API      │
│      v3      │  │  (Scraping)  │  │  (Public)    │
└──────────────┘  └──────────────┘  └──────────────┘
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ Apple Music  │  │  Audiomack   │  │   Boomplay   │
│     RSS      │  │  (Scraping)  │  │  (Scraping)  │
└──────────────┘  └──────────────┘  └──────────────┘

AI SERVICES:
┌────────────────────────────────────┐
│      Google Gemini 2.0 Flash       │
│  generativelanguage.googleapis.com │
│     (RAG-powered NL queries)       │
└────────────────────────────────────┘
```

---

## Technology Stack

### **Backend**

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| **Runtime** | Python | 3.13.2 | Core language |
| **Web Framework** | FastAPI | 0.111.0 | REST API, async support |
| **ASGI Server** | Uvicorn | 0.30.0 | Production server |
| **ORM** | SQLModel | 0.0.21 | Type-safe database models |
| **Database Driver** | SQLAlchemy | 2.0.32 | Database abstraction |
| **Validation** | Pydantic | 2.8.2 | Request/response schemas |
| **HTTP Client** | Requests | 2.32.3 | External API calls |
| **HTML Parser** | BeautifulSoup4 | 4.12.3 | Web scraping |
| **AI SDK** | google-generativeai | 0.8.5 | Gemini integration |
| **Migrations** | Alembic | 1.13.2 | Database versioning |
| **Auth** | python-jose | 3.3.0 | JWT tokens |
| **Password Hashing** | passlib | 1.7.4 | Bcrypt hashing |

**Additional Backend Dependencies:**
- `lxml`: Fast XML/HTML processing
- `httpx`: Modern async HTTP client
- `python-multipart`: File upload support
- `python-dotenv`: Environment management

### **Frontend**

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| **Framework** | React | 18.2.0 | UI library |
| **Language** | TypeScript | 5.x | Type safety |
| **Build Tool** | Vite | 5.4.8 | Dev server, bundling |
| **Styling** | Tailwind CSS | 3.x | Utility-first CSS |
| **Charts** | Recharts | 2.x | Data visualization |
| **Icons** | Lucide React | Latest | Icon components |
| **Routing** | React Router | 6.x | Client-side routing |
| **State** | React Context | Built-in | Global state |

**Additional Frontend Dependencies:**
- `clsx`: Conditional classNames
- `tailwind-merge`: Merge Tailwind classes
- `date-fns`: Date formatting
- `react-markdown`: Markdown rendering

### **Database**

| Environment | Database | Location |
|-------------|----------|----------|
| **Development** | SQLite 3 | `data/engine.db` |
| **Staging** | PostgreSQL 15+ | Render Managed |
| **Production** | PostgreSQL 15+ | AWS RDS / Render |

### **Infrastructure**

| Service | Provider | Purpose |
|---------|----------|---------|
| **Hosting** | Render | Backend + Frontend deployment |
| **DNS** | Cloudflare | Domain management |
| **Monitoring** | Sentry (optional) | Error tracking |
| **Analytics** | Plausible (optional) | Privacy-friendly analytics |

---

## API Specification

### **Base URL**
- Development: `http://127.0.0.1:8000`
- Production: `https://api.afrobeats-engine.com`

### **Authentication**
Currently open for prototype. Production will use:
- **JWT Bearer Tokens** for authenticated endpoints
- **API Keys** for programmatic access

### **Endpoints**

#### **1. Economic Metrics**

**GET /api/kpis**

Returns overall economic indicators.

```json
{
  "total_streams": 250000000,
  "total_revenue_usd": 750000,
  "gdp_contribution_usd": 1125000,
  "jobs_supported": 75,
  "export_value_usd": 315000,
  "top_platform": "youtube",
  "last_updated": "2025-11-14T22:00:00Z"
}
```

**GET /api/trends**

Time-series data for charts.

```json
{
  "revenue_over_time": [
    {"date": "2025-10-01", "value": 680000},
    {"date": "2025-10-15", "value": 720000},
    {"date": "2025-11-01", "value": 750000}
  ],
  "streams_over_time": [...],
  "platform": "all"
}
```

**GET /api/platform-share**

Market distribution by platform.

```json
{
  "platforms": [
    {"name": "YouTube", "percentage": 45.2, "streams": 113000000},
    {"name": "Apple Music", "percentage": 20.5, "streams": 51250000},
    {"name": "Spotify", "percentage": 15.0, "streams": 37500000},
    ...
  ]
}
```

#### **2. Data Collection**

**POST /api/v1/harvest/run**

Triggers manual data collection.

Request:
```json
{
  "platforms": ["youtube", "turntable", "all"],
  "limit": 100
}
```

Response:
```json
{
  "status": "success",
  "platforms_updated": ["youtube", "turntable"],
  "tracks_collected": 200,
  "timestamp": "2025-11-14T22:05:00Z"
}
```

#### **3. TurnTable Charts**

**GET /api/v1/charts/turntable**

Top 100 Nigerian artists aggregated.

```json
{
  "top_artists": [
    {
      "artist_name": "Asake",
      "total_tracks": 3,
      "total_streams": 5108854,
      "highest_rank": 1,
      "avg_rank": 8.3,
      "estimated_revenue_usd": 15326.56,
      "tracks": [
        {
          "rank": 1,
          "title": "Lonely At The Top",
          "estimated_streams": 3014363,
          "last_position": 2,
          "weeks_on_chart": 12
        },
        ...
      ]
    },
    ...
  ],
  "full_chart": [...],
  "total_tracks": 100,
  "total_artists": 88,
  "last_updated": "2025-11-14T22:00:00Z"
}
```

**GET /api/v1/charts/turntable/download**

CSV export of Top 100 chart.

Response: `Content-Type: text/csv`

Filename: `turntable_top100_20251114.csv`

#### **4. AI Chat**

**POST /api/v1/ai/chat**

Natural language query processing.

Request:
```json
{
  "message": "What's the total GDP contribution from Afrobeats?",
  "conversation_id": "uuid-optional",
  "llm_config": {
    "provider": "gemini",
    "modelName": "Gemini 2.0 Flash",
    "apiKey": "AIzaSy...",
    "temperature": 0.7,
    "maxTokens": 2048
  }
}
```

Response:
```json
{
  "response": "Based on current data, Afrobeats contributes approximately $1.125M to Nigeria's GDP. This is calculated from total streaming revenue of $750K, multiplied by our economic multiplier of 1.5x to account for indirect economic activity...",
  "citations": [
    "Source: TurnTable Charts (2025-11-14)",
    "Calculation: $750K revenue × 1.5x multiplier = $1.125M GDP"
  ],
  "conversation_id": "uuid",
  "timestamp": "2025-11-14T22:10:00Z"
}
```

### **Rate Limiting**

| Endpoint | Limit | Window |
|----------|-------|--------|
| `/api/kpis` | 60 req | 1 minute |
| `/api/trends` | 30 req | 1 minute |
| `/api/v1/harvest/run` | 5 req | 5 minutes |
| `/api/v1/ai/chat` | 20 req | 1 minute |
| All others | 100 req | 1 minute |

### **Error Responses**

```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again in 60 seconds.",
    "status": 429
  }
}
```

---

## Data Models

### **Track**

```python
class Track(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str = Field(index=True)
    artist: str = Field(index=True)
    platform: str = Field(index=True)
    streams: int = Field(default=0)
    url: Optional[str] = None
    image_url: Optional[str] = None
    rank: Optional[int] = None
    estimated_revenue: float = Field(default=0.0)
    collected_at: datetime = Field(default_factory=datetime.utcnow)
    metadata: Optional[dict] = Field(default=None, sa_column=Column(JSON))
```

### **PlatformSnapshot**

```python
class PlatformSnapshot(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    platform: str = Field(index=True)
    total_tracks: int
    total_streams: int
    total_revenue: float
    data: dict = Field(sa_column=Column(JSON))
    snapshot_date: datetime = Field(default_factory=datetime.utcnow, index=True)
```

---

## Economic Model Specifications

### **Constants**

```python
# Revenue per stream (USD)
REVENUE_PER_STREAM = {
    "youtube": 0.003,
    "spotify": 0.004,
    "apple_music": 0.005,
    "deezer": 0.0035,
    "audiomack": 0.002,
    "boomplay": 0.002,
    "turntable": 0.003  # Average
}

# Economic multipliers
GDP_MULTIPLIER = 1.5  # Indirect/induced economic activity
EXPORT_MULTIPLIER = 0.42  # International streams percentage
JOB_COST_USD = 15000  # Average annual salary in creative industry
```

### **Calculations**

#### **Streaming Revenue**
```python
def calculate_revenue(streams: int, platform: str) -> float:
    rate = REVENUE_PER_STREAM.get(platform, 0.003)
    return streams * rate
```

#### **GDP Contribution**
```python
def calculate_gdp_impact(revenue: float) -> float:
    return revenue * GDP_MULTIPLIER
```

#### **Jobs Supported**
```python
def calculate_jobs(revenue: float) -> int:
    return int(revenue / JOB_COST_USD)
```

#### **Export Earnings**
```python
def calculate_exports(revenue: float) -> float:
    return revenue * EXPORT_MULTIPLIER
```

---

## Data Collection Strategy

### **Harvester Interface**

Every harvester must implement:

```python
def fetch_platform_data(limit: int = 100) -> List[TrackDict]:
    """
    Returns list of tracks from platform.
    
    Args:
        limit: Maximum number of tracks to fetch
        
    Returns:
        List of dicts with keys: title, artist, streams, url, etc.
    """
    pass
```

### **3-Tier Fallback Strategy**

```python
def collect_with_fallback(platform: str):
    try:
        # Tier 1: Official API
        return fetch_from_api(platform)
    except APIError:
        try:
            # Tier 2: Web scraping
            return scrape_website(platform)
        except ScrapingError:
            # Tier 3: Demo data
            return get_demo_data(platform)
```

### **Scraping Techniques**

#### **TurnTable Charts (Primary)**
```python
# Method 1: JSON extraction from __NEXT_DATA__
html = requests.get(url).text
script_tag = soup.find("script", id="__NEXT_DATA__")
data = json.loads(script_tag.string)

# Method 2: BeautifulSoup DOM parsing
tracks = soup.select(".chart-track")
for track in tracks:
    title = track.select_one(".title").text
    artist = track.select_one(".artist").text
```

---

## Security

### **Environment Variables**

```env
# API Keys (NEVER commit to Git)
YOUTUBE_API_KEY=AIza...
GEMINI_API_KEY=AIza...

# Secrets
SECRET_KEY=random-256-bit-key
JWT_SECRET_KEY=random-256-bit-key

# Database
DATABASE_URL=postgresql://user:pass@host:5432/db

# CORS
CORS_ORIGINS=https://afrobeats-engine.com,https://app.afrobeats-engine.com
```

### **Security Headers**

```python
# middleware.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Content Security Policy
app.add_middleware(
    SecurityHeadersMiddleware,
    csp="default-src 'self'; script-src 'self' 'unsafe-inline'"
)
```

---

## Performance Optimization

### **Caching Strategy**

```python
from functools import lru_cache
from datetime import timedelta

@lru_cache(maxsize=128)
def get_kpis(cache_key: str) -> dict:
    # Cache for 5 minutes
    return calculate_kpis()

# Redis for production
redis_client.setex("kpis", timedelta(minutes=5), json.dumps(kpis))
```

### **Database Indexes**

```sql
CREATE INDEX idx_track_platform ON track(platform);
CREATE INDEX idx_track_artist ON track(artist);
CREATE INDEX idx_track_collected_at ON track(collected_at);
CREATE INDEX idx_snapshot_platform_date ON platform_snapshot(platform, snapshot_date);
```

### **Query Optimization**

```python
# Efficient aggregation
tracks = (
    session.query(Track)
    .filter(Track.platform == "turntable")
    .order_by(Track.rank)
    .limit(100)
    .all()
)

# Use select_related for joins
tracks = session.query(Track).options(joinedload(Track.artist)).all()
```

---

## Testing

### **Unit Tests**

```bash
cd backend
pytest tests/ -v --cov=backend
```

Coverage targets:
- **API endpoints**: >90%
- **Economic model**: 100%
- **Harvesters**: >80%
- **Database**: >85%

### **Integration Tests**

```python
# Test full pipeline
def test_harvest_to_kpi_pipeline():
    # Trigger harvest
    response = client.post("/api/v1/harvest/run")
    assert response.status_code == 200
    
    # Verify KPIs updated
    kpis = client.get("/api/kpis").json()
    assert kpis["total_streams"] > 0
```

---

## Deployment

### **Render (Recommended)**

**Backend:**
```yaml
services:
  - type: web
    name: afrobeats-backend
    env: python
    buildCommand: pip install -r requirements.txt
    startCommand: uvicorn main:app --host 0.0.0.0 --port $PORT
    envVars:
      - key: DATABASE_URL
        fromDatabase:
          name: afrobeats-db
          property: connectionString
```

**Frontend:**
```yaml
  - type: web
    name: afrobeats-frontend
    env: static
    buildCommand: npm install && npm run build
    staticPublishPath: ./dist
    envVars:
      - key: VITE_API_BASE
        value: https://afrobeats-backend.onrender.com
```

### **Docker**

```dockerfile
# backend/Dockerfile
FROM python:3.13-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

---

## Monitoring

### **Logs**

```python
# logger.py
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('logs/app.log'),
        logging.StreamHandler()
    ]
)
```

### **Metrics to Track**

- API response times (p50, p95, p99)
- Data collection success rate
- AI query latency
- Database query performance
- Error rates by endpoint

---

**Document Version:** 1.0.0  
**Last Updated:** November 14, 2025  
**Maintainer:** Development Team
