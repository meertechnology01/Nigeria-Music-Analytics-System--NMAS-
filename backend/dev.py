#!/usr/bin/env python3
"""
Development startup script with hot reload enabled.
"""
import subprocess
import sys
from pathlib import Path

def main():
    backend_dir = Path(__file__).parent
    import os
    os.chdir(backend_dir)
    
    print("=" * 60)
    print("Starting Nigeria Music Analytics System (NMAS) Backend (Development)")
    print("Hot reload enabled - changes will auto-reload")
    print("=" * 60 + "\n")
    
    try:
        subprocess.run([
            "uvicorn",
            "main:app",
            "--host", "127.0.0.1",
            "--port", "8000",
            "--reload",
            "--log-level", "debug",
        ], check=True)
    except KeyboardInterrupt:
        print("\n\nShutting down gracefully...")
        sys.exit(0)
    except subprocess.CalledProcessError as e:
        print(f"\nFailed to start server: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
