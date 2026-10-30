#!/usr/bin/env bash
# ==============================================================================
# DiffBeacon Production Deployment Script
# ==============================================================================
set -euo pipefail

echo "=================================================="
echo " Starting DiffBeacon Production Deployment"
echo "=================================================="

# 1. Prerequisite checks
command -v docker >/dev/null 2>&1 || { echo >&2 "[ERROR] Docker is required but not installed. Aborting."; exit 1; }
docker compose version >/dev/null 2>&1 || { echo >&2 "[ERROR] Docker Compose is required. Aborting."; exit 1; }

# 2. Environment Configuration
if [ ! -f .env ]; then
  if [ -f .env.example ]; then
    echo "[INFO] Creating .env from .env.example..."
    cp .env.example .env
  else
    echo "[INFO] Creating basic .env..."
    cat <<EOF > .env
DEBUG=False
SECRET_KEY=$(openssl rand -hex 32 2>/dev/null || echo "diffbeacon-production-secret-key-change-me")
LLM_PROVIDER=mock
STORAGE_DIR=storage/snapshots
EOF
  fi
fi

# 3. Build & Launch Containers
echo "[INFO] Building and starting Docker services..."
docker compose down --remove-orphans || true
docker compose up -d --build

# 4. Await Health Check
echo "[INFO] Waiting for backend service to become healthy..."
MAX_RETRIES=20
RETRY_COUNT=0
HEALTHY=false

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
  if curl -sf http://localhost:8000/api/v1/health/ >/dev/null 2>&1; then
    HEALTHY=true
    break
  fi
  echo "  Waiting for healthcheck (attempt $((RETRY_COUNT+1))/$MAX_RETRIES)..."
  sleep 3
  RETRY_COUNT=$((RETRY_COUNT+1))
done

if [ "$HEALTHY" = true ]; then
  echo "=================================================="
  echo " DiffBeacon Deployed Successfully!"
  echo " Web Frontend: http://localhost:3000"
  echo " Backend API:  http://localhost:8000/api/v1/"
  echo " Health Probe: http://localhost:8000/api/v1/health/"
  echo "=================================================="
else
  echo "[WARNING] Backend health probe did not respond in time. Check logs via 'docker compose logs'."
  exit 1
fi
