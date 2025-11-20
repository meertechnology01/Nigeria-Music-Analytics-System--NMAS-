# PROJECT CLEANUP SCRIPT - Nigeria Music Analytics System (NMAS)
# This script organizes the project structure to industry standards

Write-Host "Starting Project Cleanup..." -ForegroundColor Cyan
Write-Host ""

# Define paths
$projectRoot = Split-Path $PSScriptRoot -Parent
$archivedPath = Join-Path $projectRoot "archived\pitch-materials"

# Ensure archived directory exists
if (-not (Test-Path $archivedPath)) {
    New-Item -ItemType Directory -Path $archivedPath -Force | Out-Null
    Write-Host "Created archived directory" -ForegroundColor Green
}

# Move pitch materials to archived folder
Write-Host "`nMoving pitch materials to archived folder..." -ForegroundColor Yellow

$pitchFiles = @(
    "convert_to_ppt.py",
    "nmaspitch.html",
    "whatis.md",
    "NMAS_Pitch.pptx",
    "NMAS_Pitch_Enhanced.pptx",
    "slide2-growth-chart.svg",
    "slide3-dashboard-mockup.svg",
    "slide6-demo-dashboard.svg"
)

foreach ($file in $pitchFiles) {
    $sourcePath = Join-Path $projectRoot $file
    if (Test-Path $sourcePath) {
        $destPath = Join-Path $archivedPath $file
        Move-Item -Path $sourcePath -Destination $destPath -Force
        Write-Host "  Moved: $file" -ForegroundColor Gray
    }
}

# Clean up build artifacts and cache
Write-Host "`nCleaning build artifacts and cache..." -ForegroundColor Yellow

# Python cache
Get-ChildItem -Path $projectRoot -Filter "__pycache__" -Recurse -Directory -ErrorAction SilentlyContinue | Remove-Item -Recurse -Force
Write-Host "  Removed Python cache directories" -ForegroundColor Gray

# Python compiled files
Get-ChildItem -Path $projectRoot -Filter "*.pyc" -Recurse -File -ErrorAction SilentlyContinue | Remove-Item -Force
Get-ChildItem -Path $projectRoot -Filter "*.pyo" -Recurse -File -ErrorAction SilentlyContinue | Remove-Item -Force
Write-Host "  Removed .pyc/.pyo files" -ForegroundColor Gray

# Egg info
Get-ChildItem -Path $projectRoot -Filter "*.egg-info" -Recurse -Directory -ErrorAction SilentlyContinue | Remove-Item -Recurse -Force
Write-Host "  Removed .egg-info directories" -ForegroundColor Gray

# Backend logs (keep directory, remove files)
$backendLogs = Join-Path $projectRoot "backend\logs\app.log"
if (Test-Path $backendLogs) {
    Remove-Item $backendLogs -Force
    Write-Host "  Cleared backend log file" -ForegroundColor Gray
}

# Verify essential files exist
Write-Host "`nVerifying essential project files..." -ForegroundColor Yellow

$essentialFiles = @(
    ".gitignore",
    ".dockerignore",
    "README.md",
    "LICENSE",
    "CONTRIBUTING.md",
    "SECURITY.md",
    "CHANGELOG.md",
    ".env.example",
    "backend\requirements.txt",
    "backend\main.py",
    "frontend\package.json",
    "scripts\start.ps1"
)

$allFound = $true
foreach ($file in $essentialFiles) {
    $filePath = Join-Path $projectRoot $file
    if (Test-Path $filePath) {
        Write-Host "  OK: $file" -ForegroundColor Green
    } else {
        Write-Host "  MISSING: $file" -ForegroundColor Red
        $allFound = $false
    }
}

# Create archived README
Write-Host "`nCreating archived materials README..." -ForegroundColor Yellow

$archivedReadme = @"
# Archived Pitch Materials

This directory contains materials created for hackathon pitch presentations and demonstrations. These files are preserved for reference but are not part of the production application.

## Contents

- **PowerPoint Presentations**: NMAS_Pitch.pptx, NMAS_Pitch_Enhanced.pptx
- **HTML Pitch Deck**: nmaspitch.html
- **Generation Script**: convert_to_ppt.py
- **Visual Assets**: SVG files for slides
- **Project Overview**: whatis.md

## Note

These materials were created for the hackathon and showcase the project vision and initial prototype. For current project documentation, see the main docs/ directory.

---

*Archived on: $(Get-Date -Format "yyyy-MM-dd")*
"@

$archivedReadmePath = Join-Path $archivedPath "README.md"
Set-Content -Path $archivedReadmePath -Value $archivedReadme
Write-Host "  Created archived/pitch-materials/README.md" -ForegroundColor Gray

# Project structure summary
Write-Host "`nCurrent Project Structure:" -ForegroundColor Cyan
Write-Host ""
Write-Host "Afrobeats-Economic-Engine/" -ForegroundColor White
Write-Host "  backend/          (Python FastAPI application)" -ForegroundColor Gray
Write-Host "  frontend/         (React TypeScript application)" -ForegroundColor Gray
Write-Host "  docs/             (All documentation)" -ForegroundColor Gray
Write-Host "  scripts/          (Automation scripts)" -ForegroundColor Gray
Write-Host "  deployment/       (Deployment configurations)" -ForegroundColor Gray
Write-Host "  data/             (SQLite database - dev only)" -ForegroundColor Gray
Write-Host "  archived/         (Pitch materials and old docs)" -ForegroundColor Gray
Write-Host "  .gitignore        (Git ignore rules)" -ForegroundColor Gray
Write-Host "  .dockerignore     (Docker ignore rules)" -ForegroundColor Gray
Write-Host "  README.md         (Main project documentation)" -ForegroundColor Gray
Write-Host ""

# Final recommendations
Write-Host "Cleanup Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "  1. Review archived materials in: archived/pitch-materials/" -ForegroundColor White
Write-Host "  2. Commit changes with: git add . && git commit -m 'chore: restructure to industry standards'" -ForegroundColor White
Write-Host "  3. Verify application still runs: .\scripts\start.ps1" -ForegroundColor White
Write-Host ""
Write-Host "Important:" -ForegroundColor Yellow
Write-Host "  - Pitch materials moved to archived/pitch-materials/" -ForegroundColor White
Write-Host "  - SQLite databases in data/ directory were not removed" -ForegroundColor White
Write-Host "  - Log files cleared but directories preserved" -ForegroundColor White
Write-Host ""
