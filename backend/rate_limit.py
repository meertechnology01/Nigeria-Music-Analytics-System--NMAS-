"""Rate limiting middleware."""

from __future__ import annotations

import time
from collections import defaultdict
from typing import Callable, Dict, Tuple

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.status import HTTP_429_TOO_MANY_REQUESTS

from config import get_settings
from exceptions import AppException

settings = get_settings()


class RateLimitExceeded(AppException):
    """Rate limit exceeded exception."""
    
    def __init__(self, retry_after: int):
        super().__init__(
            status_code=HTTP_429_TOO_MANY_REQUESTS,
            error="RATE_LIMIT_EXCEEDED",
            message=f"Rate limit exceeded. Try again in {retry_after} seconds.",
            details={"retry_after": retry_after}
        )
        self.retry_after = retry_after


class RateLimiter:
    """Token bucket rate limiter."""
    
    def __init__(self, rate: int = 60, burst: int = 10):
        """
        Initialize rate limiter.
        
        Args:
            rate: Requests per minute
            burst: Maximum burst size
        """
        self.rate = rate
        self.burst = burst
        self.tokens_per_second = rate / 60.0
        
        # Storage: {client_id: (tokens, last_update_time)}
        self.buckets: Dict[str, Tuple[float, float]] = defaultdict(
            lambda: (burst, time.time())
        )
    
    def _refill_bucket(self, client_id: str) -> Tuple[float, float]:
        """Refill the token bucket based on elapsed time."""
        tokens, last_update = self.buckets[client_id]
        now = time.time()
        elapsed = now - last_update
        
        # Add tokens based on elapsed time
        tokens = min(self.burst, tokens + elapsed * self.tokens_per_second)
        
        self.buckets[client_id] = (tokens, now)
        return tokens, now
    
    def is_allowed(self, client_id: str) -> Tuple[bool, int]:
        """
        Check if request is allowed.
        
        Returns:
            Tuple of (is_allowed, retry_after_seconds)
        """
        tokens, _ = self._refill_bucket(client_id)
        
        if tokens >= 1.0:
            # Consume one token
            self.buckets[client_id] = (tokens - 1.0, self.buckets[client_id][1])
            return True, 0
        else:
            # Calculate retry after time
            tokens_needed = 1.0 - tokens
            retry_after = int(tokens_needed / self.tokens_per_second) + 1
            return False, retry_after
    
    def cleanup_old_entries(self, max_age: int = 3600):
        """Remove old entries to prevent memory leak."""
        now = time.time()
        to_remove = [
            client_id
            for client_id, (_, last_update) in self.buckets.items()
            if now - last_update > max_age
        ]
        for client_id in to_remove:
            del self.buckets[client_id]


# Global rate limiter instance
rate_limiter = RateLimiter(
    rate=settings.rate_limit_per_minute,
    burst=settings.rate_limit_burst
)


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Middleware to enforce rate limiting."""
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        """Process request with rate limiting."""
        # Skip rate limiting for health check endpoints
        if request.url.path in ["/", "/health", "/docs", "/redoc", "/openapi.json"]:
            return await call_next(request)
        
        # Get client identifier (IP address)
        client_id = request.client.host if request.client else "unknown"
        
        # Check rate limit
        is_allowed, retry_after = rate_limiter.is_allowed(client_id)
        
        if not is_allowed:
            return Response(
                content='{"error":"RATE_LIMIT_EXCEEDED","message":"Too many requests"}',
                status_code=HTTP_429_TOO_MANY_REQUESTS,
                headers={"Retry-After": str(retry_after)},
                media_type="application/json"
            )
        
        response = await call_next(request)
        
        # Add rate limit headers
        response.headers["X-RateLimit-Limit"] = str(settings.rate_limit_per_minute)
        response.headers["X-RateLimit-Remaining"] = str(
            int(rate_limiter.buckets.get(client_id, (0, 0))[0])
        )
        
        return response


async def cleanup_rate_limiter():
    """Periodic cleanup task for rate limiter."""
    while True:
        await asyncio.sleep(3600)  # Run every hour
        rate_limiter.cleanup_old_entries()


import asyncio
