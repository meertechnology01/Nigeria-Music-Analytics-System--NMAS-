# Nigeria Music Analytics System (NMAS) - Startup Script
# This script starts both the backend (FastAPI) and frontend (Vite React) concurrently

Write-Host "Starting Nigeria Music Analytics System (NMAS)..." -ForegroundColor Cyan
Write-Host ""

# Get the root directory (parent of scripts/)
$scriptsDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$rootDir = Split-Path -Parent $scriptsDir

# Check if Python is installed
Write-Host "Checking Python installation..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>&1
    Write-Host "[OK] $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Python is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Python 3.8+ from https://www.python.org/downloads/" -ForegroundColor Yellow
    exit 1
}

# Check if Node.js is installed
Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version 2>&1
    Write-Host "[OK] Node.js $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Node.js is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "Installing dependencies..." -ForegroundColor Yellow
Write-Host ""

# Install backend dependencies
Write-Host "[BACKEND] Installing dependencies..." -ForegroundColor Cyan
Set-Location "$rootDir\backend"
if (-not (Test-Path "venv")) {
    Write-Host "Creating Python virtual environment..." -ForegroundColor Yellow
    python -m venv venv
}
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Failed to install backend dependencies" -ForegroundColor Red
    exit 1
}
Write-Host "[OK] Backend dependencies installed" -ForegroundColor Green

# Install frontend dependencies
Write-Host "[FRONTEND] Installing dependencies..." -ForegroundColor Cyan
Set-Location "$rootDir\frontend"
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Failed to install frontend dependencies" -ForegroundColor Red
    exit 1
}
Write-Host "[OK] Frontend dependencies installed" -ForegroundColor Green

Write-Host ""
Write-Host "Starting servers..." -ForegroundColor Cyan
Write-Host ""

# Create script blocks for parallel execution
$backendScript = {
    param($rootDir)
    Set-Location "$rootDir\backend"
    .\venv\Scripts\Activate.ps1
    Write-Host "[BACKEND] Running at http://localhost:8000" -ForegroundColor Green
    Write-Host "[BACKEND] API docs at http://localhost:8000/docs" -ForegroundColor Blue
    Write-Host ""
    uvicorn main:app --reload --host 0.0.0.0 --port 8000
}

$frontendScript = {
    param($rootDir)
    Set-Location "$rootDir\frontend"
    Write-Host "[FRONTEND] Running at http://localhost:5173" -ForegroundColor Green
    Write-Host ""
    npm run dev
}

# Start backend and frontend in parallel using background jobs
Write-Host "Starting Backend Server..." -ForegroundColor Yellow
$backendJob = Start-Job -ScriptBlock $backendScript -ArgumentList $rootDir

Write-Host "Starting Frontend Server..." -ForegroundColor Yellow
$frontendJob = Start-Job -ScriptBlock $frontendScript -ArgumentList $rootDir

# Wait a moment for servers to initialize
Start-Sleep -Seconds 3

Write-Host ""
Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host "Nigeria Music Analytics System (NMAS) is running!" -ForegroundColor Green
Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Frontend:  http://localhost:5173" -ForegroundColor Blue
Write-Host "Backend:   http://localhost:8000" -ForegroundColor Blue
Write-Host "API Docs:  http://localhost:8000/docs" -ForegroundColor Blue
Write-Host ""
Write-Host "Press Ctrl+C to stop all servers" -ForegroundColor Yellow
Write-Host ""

# Monitor the jobs and display output
try {
    while ($true) {
        # Check if jobs are still running
        if ($backendJob.State -eq 'Failed' -or $frontendJob.State -eq 'Failed') {
            Write-Host "One or more servers failed to start" -ForegroundColor Red
            break
        }

        # Receive output from jobs
        Receive-Job -Job $backendJob -ErrorAction SilentlyContinue | ForEach-Object {
            Write-Host "[Backend] $_" -ForegroundColor Magenta
        }
        Receive-Job -Job $frontendJob -ErrorAction SilentlyContinue | ForEach-Object {
            Write-Host "[Frontend] $_" -ForegroundColor Cyan
        }

        Start-Sleep -Milliseconds 100
    }
} finally {
    # Cleanup: Stop all jobs when script is interrupted
    Write-Host ""
    Write-Host "Stopping servers..." -ForegroundColor Yellow
    Stop-Job -Job $backendJob, $frontendJob -ErrorAction SilentlyContinue
    Remove-Job -Job $backendJob, $frontendJob -Force -ErrorAction SilentlyContinue
    Write-Host "[OK] Servers stopped" -ForegroundColor Green
}
