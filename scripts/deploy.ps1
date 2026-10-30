# ==============================================================================
# DiffBeacon Windows Deployment Script
# ==============================================================================
param(
    [switch]$Dev = $false
)

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host " Starting DiffBeacon Deployment" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

# 1. Check prerequisites
if ($Dev) {
    Write-Host "[INFO] Starting local development mode..." -ForegroundColor Yellow
    
    # Check Python
    $pythonCmd = "python"
    if (Get-Command "python" -ErrorAction SilentlyContinue) {
        $pythonCmd = "python"
    } elseif (Test-Path "C:\Users\hp\anaconda3123\python.exe") {
        $pythonCmd = "C:\Users\hp\anaconda3123\python.exe"
    }

    # Run migrations
    & $pythonCmd backend/manage.py migrate

    # Start Backend
    Start-Process $pythonCmd -ArgumentList "backend/manage.py runserver 127.0.0.1:8000" -NoNewWindow

    # Start Frontend
    Set-Location frontend
    Start-Process "cmd.exe" -ArgumentList "/c npx vite --host 0.0.0.0 --port 5173" -NoNewWindow
    Set-Location ..

    Write-Host "Development servers started:" -ForegroundColor Green
    Write-Host "Frontend: http://127.0.0.1:5173/" -ForegroundColor Green
    Write-Host "Backend:  http://127.0.0.1:8000/api/v1/" -ForegroundColor Green
    exit 0
}

# 2. Production Docker Deployment
if (-not (Get-Command "docker" -ErrorAction SilentlyContinue)) {
    Write-Error "[ERROR] Docker is required for containerized deployment. Use -Dev to run locally without Docker."
    exit 1
}

Write-Host "[INFO] Building and starting Docker Compose containers..." -ForegroundColor Yellow
docker compose down --remove-orphans 2>$null
docker compose up -d --build

Write-Host "[INFO] Polling health probe..." -ForegroundColor Yellow
$healthy = $false
for ($i = 0; $i -lt 20; $i++) {
    try {
        $resp = Invoke-RestMethod -Uri "http://localhost:8000/api/v1/health/" -Method Get -TimeoutSec 3 -ErrorAction Stop
        if ($resp.status -eq "healthy") {
            $healthy = $true
            break
        }
    } catch {
        Start-Sleep -Seconds 3
    }
}

if ($healthy) {
    Write-Host "==================================================" -ForegroundColor Green
    Write-Host " DiffBeacon Deployed Successfully!" -ForegroundColor Green
    Write-Host " Web Frontend: http://localhost:3000" -ForegroundColor Green
    Write-Host " Backend API:  http://localhost:8000/api/v1/" -ForegroundColor Green
    Write-Host " Health Check: http://localhost:8000/api/v1/health/" -ForegroundColor Green
    Write-Host "==================================================" -ForegroundColor Green
} else {
    Write-Warning "[WARNING] Backend container did not respond to health check in time. Inspect via 'docker compose logs'."
}
