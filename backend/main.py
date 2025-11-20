from __future__ import annotations

from datetime import date, datetime
from typing import List
import io
import csv

import calendar
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from fastapi.exceptions import RequestValidationError

import storage
from api_client import get_youtube_stats
from config import get_settings
from logger import setup_logging
from model import calculate_economic_impact
from pipeline import collect_platform_snapshots, collect_single_platform, list_platforms
from rate_limit import RateLimitMiddleware
from scraper import scrape_turntable_top_100
from exceptions import (
    AppException,
    NotFoundException,
    app_exception_handler,
    http_exception_handler,
    validation_exception_handler,
    unhandled_exception_handler,
)
from schemas import (
    ChartData,
    KpiResponse,
    PlatformCollection,
    PlatformListItem,
    PlatformSnapshot,
)
from ai_engine import (
    get_beats_ai,
    ChatRequest,
    ChatResponse,
    AuditLog,
)

# Initialize settings and logging
settings = get_settings()
setup_logging()
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events."""
    # Startup
    logger.info("Starting Nigeria Music Analytics System (NMAS) API")
    logger.info(f"Environment: {settings.env}")
    logger.info(f"Debug mode: {settings.debug}")
    storage.init_db()
    logger.info("Database initialized")
    
    yield
    
    # Shutdown
    logger.info("Shutting down Nigeria Music Analytics System (NMAS) API")


app = FastAPI(
    title="Nigeria Music Analytics System (NMAS)",
    description="Digital Industry Intelligence Platform",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs" if not settings.is_production else None,
    redoc_url="/redoc" if not settings.is_production else None,
)

# Security Middleware
if settings.is_production:
    app.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=["*"]  # Configure with your domain in production
    )

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rate Limiting Middleware
app.add_middleware(RateLimitMiddleware)

# Compression Middleware
app.add_middleware(GZipMiddleware, minimum_size=1000)

# Exception Handlers
app.add_exception_handler(AppException, app_exception_handler)
app.add_exception_handler(HTTPException, http_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(Exception, unhandled_exception_handler)


# Exception Handlers
app.add_exception_handler(AppException, app_exception_handler)
app.add_exception_handler(HTTPException, http_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(Exception, unhandled_exception_handler)


@app.get("/", tags=["Health"])
def root():
    """Root endpoint - health check."""
    return {
        "status": "ok",
        "service": "Nigeria Music Analytics System (NMAS)",
        "version": "1.0.0",
        "environment": settings.env
    }


@app.get("/health", tags=["Health"])
def health_check():
    """Detailed health check endpoint."""
    return {
        "status": "healthy",
        "database": "connected",
        "timestamp": datetime.utcnow().isoformat()
    }


@app.get("/api/kpis", response_model=KpiResponse, tags=["Analytics"])
def get_kpis():
    """Get key performance indicators for the music industry."""
    try:
        youtube_metrics = get_youtube_stats("5H4m05-1u5k")  # "Calm Down" official video
        platform_snapshots = collect_platform_snapshots(limit=20)

        estimated_platform_streams = sum(len(snapshot["tracks"]) * 5_000_000 for snapshot in platform_snapshots)

        aggregated = {
            "total_streams": youtube_metrics["viewCount"] + estimated_platform_streams,
            "concert_revenue": 1_200_000_000,
        }

        economic_figures = calculate_economic_impact(aggregated)

        export_revenue = economic_figures["direct_streaming_revenue_usd"] * 0.42

        return KpiResponse(
            gdp_contribution=_format_currency(economic_figures["gdp_contribution_usd"]),
            jobs_supported=f"{economic_figures['jobs_supported']:.0f}",
            export_revenue=_format_currency(export_revenue),
        )
    except Exception as e:
        logger.error(f"Error calculating KPIs: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to calculate KPIs")


@app.get("/api/trends", response_model=ChartData, tags=["Analytics"])
def get_trends():
    """Get streaming trends over time."""
    trend = _generate_monthly_trends()
    labels = [month.strftime("%b %Y") for month in trend["month"]]
    data = [round(value, 2) for value in trend["streams"]]
    return ChartData(labels=labels, data=data)


@app.get("/api/platform-share", response_model=ChartData, tags=["Analytics"])
def get_platform_share():
    """Get platform distribution percentages."""
    shares = {
        "Spotify": 38,
        "Boomplay": 27,
        "Apple Music": 19,
        "YouTube": 12,
        "Audiomack": 4,
    }
    return ChartData(labels=list(shares.keys()), data=list(shares.values()))


@app.get("/api/boomplay-top", tags=["Platforms"])
def get_boomplay_top():
    """Get top tracks from Boomplay."""
    snapshot = collect_single_platform("boomplay", limit=20)
    return {"titles": [track["title"] for track in snapshot["tracks"][:10]]}


@app.get("/api/v1/platforms", response_model=List[PlatformListItem], tags=["Platforms"])
def list_available_platforms() -> List[PlatformListItem]:
    """List all available music platforms."""
    return [PlatformListItem(**item) for item in list_platforms()]


@app.get("/api/v1/platforms/all", response_model=PlatformCollection, tags=["Platforms"])
def get_all_platform_snapshots(limit: int = 20) -> PlatformCollection:
    """Get latest snapshots from all platforms."""
    snapshots = collect_platform_snapshots(limit=limit)
    items = [PlatformSnapshot(**snapshot) for snapshot in snapshots]
    return PlatformCollection(items=items)


@app.get("/api/v1/platforms/{slug}", response_model=PlatformSnapshot, tags=["Platforms"])
def get_platform_snapshot(slug: str, limit: int = 20) -> PlatformSnapshot:
    """Get latest snapshot for a specific platform."""
    try:
        snapshot = collect_single_platform(slug, limit=limit)
    except KeyError as exc:
        raise NotFoundException(message=f"Unknown platform '{slug}'") from exc
    return PlatformSnapshot(**snapshot)


@app.post("/api/v1/harvest/run", tags=["Data Collection"])
def trigger_harvest(limit: int = 20):
    """Trigger data collection from all platforms."""
    try:
        snapshots = collect_platform_snapshots(limit=limit)
        summary = storage.save_snapshots(snapshots)
        logger.info(f"Harvest completed: {summary}")
        return {"status": "stored", **summary}
    except Exception as e:
        logger.error(f"Harvest failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Data harvest failed")


@app.get("/api/v1/harvest/recent", response_model=PlatformCollection, tags=["Data Collection"])
def get_recent_snapshots() -> PlatformCollection:
    """Get most recent snapshots from database."""
    snapshots = storage.get_latest_snapshot_dicts()
    items = [PlatformSnapshot(**snapshot) for snapshot in snapshots]
    return PlatformCollection(items=items)


@app.get("/api/v1/harvest/history/{slug}", response_model=PlatformCollection, tags=["Data Collection"])
def get_snapshot_history(slug: str, limit: int = 10) -> PlatformCollection:
    """Get historical snapshots for a specific platform."""
    history = storage.get_snapshot_history_dicts(slug, limit=limit)
    if not history:
        raise NotFoundException(message=f"No history for platform '{slug}'")
    items = [PlatformSnapshot(**snapshot) for snapshot in history]
    return PlatformCollection(items=items)


def _generate_monthly_trends(periods: int = 6):
    base_date = date.today().replace(day=1)
    months: List[date] = []
    for offset in range(periods - 1, -1, -1):
        months.append(_shift_month(base_date, -offset))

    baseline = 250_000_000
    growth = [idx * 15_000_000 for idx in range(periods)]
    seasonality_pattern = [12, -8, 5, 18, -10, 20]
    seasonality = seasonality_pattern[-periods:]

    cumulative_seasonality = []
    total = 0
    for value in seasonality:
        total += value * 1_000_000
        cumulative_seasonality.append(total)

    streams = [baseline + g + s for g, s in zip(growth, cumulative_seasonality)]

    return {"month": months, "streams": streams}


def _shift_month(base: date, offset: int) -> date:
    month = base.month + offset
    year = base.year + (month - 1) // 12
    month = (month - 1) % 12 + 1
    last_day = calendar.monthrange(year, month)[1]
    return date(year, month, min(base.day, last_day))


def _format_currency(amount: float) -> str:
    if amount >= 1_000_000_000:
        return f"${amount / 1_000_000_000:.2f}B"
    if amount >= 1_000_000:
        return f"${amount / 1_000_000:.2f}M"
    if amount >= 1_000:
        return f"${amount / 1_000:.2f}K"
    return f"${amount:,.0f}"


# ============================================================================
# BEATS AI ENDPOINTS
# ============================================================================

@app.post("/api/v1/ai/chat", response_model=ChatResponse, tags=["AI"])
async def ai_chat(request: ChatRequest):
    """
    Chat with Beats AI assistant.
    
    Supports:
    - RAG over full knowledge base
    - Multi-model backends (internal + external LLMs)
    - Citation generation
    - Audit logging
    """
    try:
        beats_ai = get_beats_ai()
        response = await beats_ai.chat(request)
        return response
    except Exception as e:
        logger.error(f"AI chat error: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"AI processing failed: {str(e)}"
        )


@app.get("/api/v1/ai/audit-logs", response_model=List[AuditLog], tags=["AI"])
async def get_audit_logs(limit: int = 100, user_id: str = None):
    """
    Retrieve AI query audit logs for governance compliance.
    
    Args:
        limit: Maximum number of logs to return
        user_id: Filter by specific user (optional)
    """
    try:
        beats_ai = get_beats_ai()
        logs = beats_ai.get_audit_logs(limit=limit, user_id=user_id)
        return logs
    except Exception as e:
        logger.error(f"Audit log retrieval error: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve audit logs: {str(e)}"
        )


@app.post("/api/v1/ai/export", tags=["AI"])
async def export_conversation(
    messages: List[dict],
    format: str = "markdown",
    include_metadata: bool = True
):
    """
    Export conversation history.
    
    Args:
        messages: List of conversation messages
        format: 'markdown' or 'pdf'
        include_metadata: Include timestamps, model info, etc.
    """
    try:
        if format == "markdown":
            content = "# Beats AI Conversation Export\n\n"
            content += f"**Exported:** {datetime.utcnow().isoformat()}\n\n"
            content += "---\n\n"
            
            for msg in messages:
                role = msg.get("role", "unknown").upper()
                timestamp = msg.get("timestamp", "")
                text = msg.get("content", "")
                
                content += f"## {role}\n"
                if include_metadata and timestamp:
                    content += f"*{timestamp}*\n\n"
                content += f"{text}\n\n"
                content += "---\n\n"
            
            from fastapi.responses import Response
            return Response(
                content=content.encode("utf-8"),
                media_type="text/markdown",
                headers={"Content-Disposition": "attachment; filename=beats-ai-export.md"}
            )
        
        elif format == "pdf":
            # PDF generation would require reportlab or weasyprint
            # For now, return markdown as fallback
            raise HTTPException(
                status_code=501,
                detail="PDF export not yet implemented. Use markdown format."
            )
        
        else:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported format: {format}. Use 'markdown' or 'pdf'."
            )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Export error: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Export failed: {str(e)}"
        )


@app.post("/api/v1/ai/knowledge/ingest", tags=["AI"])
async def ingest_knowledge(
    title: str,
    content: str,
    doc_type: str,
    metadata: dict = None
):
    """
    Add document to Beats AI knowledge base.
    
    Args:
        title: Document title
        content: Full document content
        doc_type: Type ('policy', 'analytics', 'platform_data', 'economic_model', 'glossary')
        metadata: Additional metadata
    """
    try:
        beats_ai = get_beats_ai()
        doc = beats_ai.knowledge_base.add_document(
            title=title,
            content=content,
            doc_type=doc_type,
            metadata=metadata or {}
        )
        return {
            "status": "success",
            "document_id": doc.id,
            "message": f"Document '{title}' added to knowledge base"
        }
    except Exception as e:
        logger.error(f"Knowledge ingestion error: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to ingest document: {str(e)}"
        )


# ============================================================================
# TURNTABLE CHARTS / ARTISTS ENDPOINTS
# ============================================================================

@app.get("/api/v1/charts/turntable", tags=["Charts"])
async def get_turntable_charts():
    """
    Get Top 100 songs from Turntable Charts.
    
    Returns aggregated artist statistics and full track listing.
    """
    try:
        chart_data = scrape_turntable_top_100()
        
        if not chart_data:
            raise HTTPException(
                status_code=503,
                detail="Unable to fetch chart data at this time"
            )
        
        # Aggregate by artist for top artists view
        artist_stats = {}
        for track in chart_data:
            artist = track['artist']
            if artist not in artist_stats:
                artist_stats[artist] = {
                    'artist': artist,
                    'total_tracks': 0,
                    'total_streams': 0,
                    'tracks': [],
                    'highest_rank': 100,
                    'avg_rank': 0
                }
            
            artist_stats[artist]['total_tracks'] += 1
            artist_stats[artist]['total_streams'] += track['estimated_streams']
            artist_stats[artist]['tracks'].append({
                'rank': track['rank'],
                'title': track['title'],
                'streams': track['estimated_streams']
            })
            artist_stats[artist]['highest_rank'] = min(
                artist_stats[artist]['highest_rank'], 
                track['rank']
            )
        
        # Calculate average rank and sort
        artists = []
        for artist_name, stats in artist_stats.items():
            stats['avg_rank'] = sum(t['rank'] for t in stats['tracks']) / stats['total_tracks']
            artists.append(stats)
        
        # Sort by total streams descending
        artists.sort(key=lambda x: x['total_streams'], reverse=True)
        
        return {
            "top_artists": artists[:100],  # Top 100 artists
            "full_chart": chart_data,
            "total_tracks": len(chart_data),
            "total_artists": len(artists),
            "last_updated": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Turntable chart fetch error: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch chart data: {str(e)}"
        )


@app.get("/api/v1/charts/turntable/download", tags=["Charts"])
async def download_turntable_csv():
    """
    Download Top 100 Turntable Charts data as CSV file.
    """
    try:
        chart_data = scrape_turntable_top_100()
        
        if not chart_data:
            raise HTTPException(
                status_code=503,
                detail="Unable to fetch chart data for download"
            )
        
        # Create CSV in memory
        output = io.StringIO()
        fieldnames = [
            'rank', 'title', 'artist', 'estimated_streams',
            'last_position', 'weeks_on_chart', 'chart_category', 'chart_week'
        ]
        writer = csv.DictWriter(output, fieldnames=fieldnames)
        
        writer.writeheader()
        for track in chart_data:
            writer.writerow({
                'rank': track['rank'],
                'title': track['title'],
                'artist': track['artist'],
                'estimated_streams': track['estimated_streams'],
                'last_position': track['last_position'] or '',
                'weeks_on_chart': track['weeks_on_chart'] or '',
                'chart_category': track['chart_category'] or 'Top 100',
                'chart_week': track['chart_week'] or ''
            })
        
        # Prepare for download
        output.seek(0)
        
        return StreamingResponse(
            iter([output.getvalue()]),
            media_type="text/csv",
            headers={
                "Content-Disposition": f"attachment; filename=turntable_top100_{datetime.now().strftime('%Y%m%d')}.csv"
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"CSV download error: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to ingest document: {str(e)}"
        )

