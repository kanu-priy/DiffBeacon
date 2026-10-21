# DiffBeacon Deployment and Local Setup Guide

**Version:** 1.0.0  
**Status:** Approved  
**Date:** October 2026  

---

## 1. Prerequisites

- **Python:** 3.11+
- **Node.js:** v18+ (Node v20 or v22 recommended)
- **Package Managers:** `pip` and `npm`
- **Optional:** Docker & Docker Compose (for containerized PostgreSQL & Redis)

---

## 2. Fast Local Development Setup (Zero-Docker / Zero-Credentials)

DiffBeacon is engineered to run out of the box using SQLite for zero-friction local development.

### Step 1: Clone and Enter Directory
```bash
git clone https://github.com/your-org/diffbeacon.git
cd diffbeacon
```

### Step 2: Configure Environment
Copy the example environment configuration:
```bash
cp .env.example .env
```
Default `.env` settings operate locally without external API keys:
```env
DEBUG=True
SECRET_KEY=diffbeacon-local-insecure-dev-key-change-in-production
DATABASE_URL=sqlite:///db.sqlite3
LLM_PROVIDER=mock
ALLOWED_HOSTS=*
CORS_ALLOW_ALL_ORIGINS=True
```

### Step 3: Backend Setup
```bash
# Create virtual environment (optional but recommended)
python -m venv .venv
# On Windows:
.venv\Scripts\activate
# On Linux/macOS:
# source .venv/bin/activate

# Install dependencies
pip install -r backend/requirements.txt

# Apply migrations
python backend/manage.py migrate

# Seed the built-in demo fixtures
python backend/manage.py seed_demo

# Run backend development server
python backend/manage.py runserver 8000
```

### Step 4: Frontend Setup
In a separate terminal:
```bash
cd frontend
npm install
npm run dev
```
Open your browser to `http://localhost:5173`. You can immediately launch the built-in `BeaconWorks API` demo or upload custom base/head ZIP files.

---

## 3. Containerized Deployment (Docker Compose)

For production or staging environments:
```bash
docker-compose up --build -d
```
Services started:
- `db`: PostgreSQL 16
- `redis`: Redis 7
- `backend`: Gunicorn + Django REST Framework on port `8000`
- `frontend`: Nginx serving production Vite build on port `80` (or `3000`)
