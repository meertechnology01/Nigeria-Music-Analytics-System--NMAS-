#!/usr/bin/env python3
"""
Production startup script for Nigeria Music Analytics System (NMAS) backend.
Ensures database is ready before starting the server.
"""
import sys
import subprocess
import time
from pathlib import Path

def run_command(cmd: list[str], description: str) -> bool:
    """Run a command and return success status."""
    print(f"\n>>> {description}")
    try:
        result = subprocess.run(cmd, check=True, capture_output=True, text=True)
        if result.stdout:
            print(result.stdout)
        return True
    except subprocess.CalledProcessError as e:
        print(f"Error: {e.stderr}", file=sys.stderr)
        return False

def main():
    backend_dir = Path(__file__).parent
    
    # Change to backend directory
    import os
    os.chdir(backend_dir)
    
    print("=" * 60)
    print("Starting Nigeria Music Analytics System (NMAS) Backend")
    print("=" * 60)
    
    # Run database migrations
    if not run_command(
        ["alembic", "upgrade", "head"],
        "Running database migrations..."
    ):
        print("\nWarning: Database migration failed. Continuing anyway...")
    
    # Start uvicorn server
    print("\n" + "=" * 60)
    print("Starting Uvicorn server...")
    print("=" * 60 + "\n")
    
    try:
        subprocess.run([
            "uvicorn",
            "main:app",
            "--host", "0.0.0.0",
            "--port", "8000",
            "--log-level", "info",
        ], check=True)
    except KeyboardInterrupt:
        print("\n\nShutting down gracefully...")
        sys.exit(0)
    except subprocess.CalledProcessError as e:
        print(f"\nFailed to start server: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
