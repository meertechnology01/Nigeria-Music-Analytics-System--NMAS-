# PowerShell script to install all dependencies
# Run with: .\scripts\install.ps1 (from project root)

# Get the root directory (parent of scripts/)
$scriptsDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$rootDir = Split-Path -Parent $scriptsDir

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "Installing Nigeria Music Analytics System (NMAS)" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Check Python version
Write-Host "Checking Python version..." -ForegroundColor Yellow
$pythonVersion = python --version 2>&1
Write-Host $pythonVersion -ForegroundColor Green

# Check Node version
Write-Host "Checking Node.js version..." -ForegroundColor Yellow
$nodeVersion = node --version 2>&1
Write-Host $nodeVersion -ForegroundColor Green

Write-Host ""

# Install backend dependencies
Write-Host "Installing backend dependencies..." -ForegroundColor Yellow
Push-Location "$rootDir\backend"
try {
    pip install -r requirements.txt
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Backend dependencies installed successfully!" -ForegroundColor Green
    } else {
        Write-Host "Failed to install backend dependencies" -ForegroundColor Red
        exit 1
    }
} finally {
    Pop-Location
}

Write-Host ""

# Install frontend dependencies
Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
Push-Location "$rootDir\frontend"
try {
    npm install
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Frontend dependencies installed successfully!" -ForegroundColor Green
    } else {
        Write-Host "Failed to install frontend dependencies" -ForegroundColor Red
        exit 1
    }
} finally {
    Pop-Location
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "Installation complete!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Copy backend/.env.example to backend/.env and configure" -ForegroundColor White
Write-Host "2. Copy frontend/.env.example to frontend/.env and configure" -ForegroundColor White
Write-Host "3. Run database migrations: cd backend && alembic upgrade head" -ForegroundColor White
Write-Host "4. Start development: .\scripts\dev.ps1" -ForegroundColor White
Write-Host ""
