"""Custom exception handlers and error responses."""

from __future__ import annotations

import logging
from typing import Any, Dict

from fastapi import HTTPException, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from pydantic import BaseModel

logger = logging.getLogger(__name__)


class ErrorResponse(BaseModel):
    """Standard error response model."""
    error: str
    message: str
    details: Any = None
    path: str
    timestamp: str


class AppException(HTTPException):
    """Base application exception."""
    
    def __init__(
        self,
        status_code: int,
        error: str,
        message: str,
        details: Any = None
    ):
        self.error = error
        self.message = message
        self.details = details
        super().__init__(status_code=status_code, detail=message)


class BadRequestException(AppException):
    """400 Bad Request exception."""
    
    def __init__(self, message: str = "Bad request", details: Any = None):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            error="BAD_REQUEST",
            message=message,
            details=details
        )


class UnauthorizedException(AppException):
    """401 Unauthorized exception."""
    
    def __init__(self, message: str = "Unauthorized", details: Any = None):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            error="UNAUTHORIZED",
            message=message,
            details=details
        )


class ForbiddenException(AppException):
    """403 Forbidden exception."""
    
    def __init__(self, message: str = "Forbidden", details: Any = None):
        super().__init__(
            status_code=status.HTTP_403_FORBIDDEN,
            error="FORBIDDEN",
            message=message,
            details=details
        )


class NotFoundException(AppException):
    """404 Not Found exception."""
    
    def __init__(self, message: str = "Resource not found", details: Any = None):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            error="NOT_FOUND",
            message=message,
            details=details
        )


class ConflictException(AppException):
    """409 Conflict exception."""
    
    def __init__(self, message: str = "Resource conflict", details: Any = None):
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            error="CONFLICT",
            message=message,
            details=details
        )


class InternalServerException(AppException):
    """500 Internal Server Error exception."""
    
    def __init__(self, message: str = "Internal server error", details: Any = None):
        super().__init__(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            error="INTERNAL_SERVER_ERROR",
            message=message,
            details=details
        )


async def app_exception_handler(request: Request, exc: AppException) -> JSONResponse:
    """Handle custom application exceptions."""
    from datetime import datetime
    
    error_response = ErrorResponse(
        error=exc.error,
        message=exc.message,
        details=exc.details,
        path=str(request.url.path),
        timestamp=datetime.utcnow().isoformat()
    )
    
    logger.warning(
        f"{exc.error}: {exc.message}",
        extra={
            "path": request.url.path,
            "method": request.method,
            "status_code": exc.status_code
        }
    )
    
    return JSONResponse(
        status_code=exc.status_code,
        content=error_response.model_dump()
    )


async def http_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
    """Handle FastAPI HTTP exceptions."""
    from datetime import datetime
    
    error_response = ErrorResponse(
        error="HTTP_ERROR",
        message=exc.detail,
        details=None,
        path=str(request.url.path),
        timestamp=datetime.utcnow().isoformat()
    )
    
    return JSONResponse(
        status_code=exc.status_code,
        content=error_response.model_dump()
    )


async def validation_exception_handler(
    request: Request,
    exc: RequestValidationError
) -> JSONResponse:
    """Handle request validation errors."""
    from datetime import datetime
    
    error_response = ErrorResponse(
        error="VALIDATION_ERROR",
        message="Request validation failed",
        details=exc.errors(),
        path=str(request.url.path),
        timestamp=datetime.utcnow().isoformat()
    )
    
    logger.warning(
        f"Validation error: {exc.errors()}",
        extra={
            "path": request.url.path,
            "method": request.method
        }
    )
    
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content=error_response.model_dump()
    )


async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Handle unhandled exceptions."""
    from datetime import datetime
    
    error_response = ErrorResponse(
        error="INTERNAL_SERVER_ERROR",
        message="An unexpected error occurred",
        details=str(exc) if not get_settings().is_production else None,
        path=str(request.url.path),
        timestamp=datetime.utcnow().isoformat()
    )
    
    logger.exception(
        f"Unhandled exception: {str(exc)}",
        extra={
            "path": request.url.path,
            "method": request.method
        }
    )
    
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content=error_response.model_dump()
    )


def get_settings():
    """Import settings to avoid circular dependency."""
    from .config import get_settings
    return get_settings()
