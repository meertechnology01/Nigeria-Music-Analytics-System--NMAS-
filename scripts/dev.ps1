# PowerShell script to start development environment
# Run with: .\scripts\dev.ps1 (from project root)

# Get the root directory (parent of scripts/)
$scriptsDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$rootDir = Split-Path -Parent $scriptsDir

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "Nigeria Music Analytics System (NMAS) - Development Mode" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Check if backend dependencies are installed
Write-Host "Checking backend dependencies..." -ForegroundColor Yellow
Push-Location "$rootDir\backend"
try {
    python -c "import fastapi" 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Backend dependencies not found. Installing..." -ForegroundColor Yellow
        pip install -r requirements.txt
    } else {
        Write-Host "Backend dependencies OK" -ForegroundColor Green
    }
} finally {
    Pop-Location
}

# Check if frontend dependencies are installed
Write-Host "Checking frontend dependencies..." -ForegroundColor Yellow
Push-Location "$rootDir\frontend"
try {
    if (-not (Test-Path "node_modules")) {
        Write-Host "Frontend dependencies not found. Installing..." -ForegroundColor Yellow
        npm install
    } else {
        Write-Host "Frontend dependencies OK" -ForegroundColor Green
    }
} finally {
    Pop-Location
}

Write-Host ""
Write-Host "Starting servers..." -ForegroundColor Cyan
Write-Host "Backend:  http://localhost:8000" -ForegroundColor Green
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Green
Write-Host ""
Write-Host "Press Ctrl+C to stop all servers" -ForegroundColor Yellow
Write-Host ""

# Start backend in background
$backendJob = Start-Job -ScriptBlock {
    param($rootDir)
    Set-Location "$rootDir\backend"
    python dev.py
} -ArgumentList $rootDir

# Start frontend in background
$frontendJob = Start-Job -ScriptBlock {
    param($rootDir)
    Set-Location "$rootDir\frontend"
    npm run dev
} -ArgumentList $rootDir

# Wait for user interrupt
try {
    while ($true) {
        # Show output from jobs
        Receive-Job $backendJob -ErrorAction SilentlyContinue
        Receive-Job $frontendJob -ErrorAction SilentlyContinue
        Start-Sleep -Milliseconds 500
    }
} finally {
    Write-Host ""
    Write-Host "Shutting down servers..." -ForegroundColor Yellow
    Stop-Job $backendJob, $frontendJob
    Remove-Job $backendJob, $frontendJob
    Write-Host "Shutdown complete" -ForegroundColor Green
}
