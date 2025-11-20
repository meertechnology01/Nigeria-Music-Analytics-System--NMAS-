# Nigeria Music Analytics System (NMAS)

A production-ready platform for tracking and analyzing the economic impact of Nigeria's music industry through real-time data aggregation and transparent economic modeling.

## 📋 Table of Contents

- [Overview](#overview)
- [System Architecture](#system-architecture)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [Development](#development)
- [Deployment](#deployment)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Contributing](#contributing)

## 🎯 Overview

Nigeria's music sector is booming, yet policymakers lack transparent, real-time insight into its full economic contribution. The Nigeria Music Analytics System (NMAS) addresses this by:

- **Data Collection**: Aggregating streaming data from multiple platforms (Audiomack, Apple Music, Deezer, Boomplay, TurnTable)
- **Economic Modeling**: Converting raw metrics into GDP, jobs, and export estimates with transparent assumptions
- **Visualization**: Presenting actionable insights through an interactive dashboard

## 🏗️ System Architecture

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│   Data Sources  │ ───> │  FastAPI Backend │ ───> │  React Frontend │
│  (Harvesters)   │      │  + PostgreSQL    │      │   (Dashboard)   │
└─────────────────┘      └─────────────────┘      └─────────────────┘
```

### Technology Stack

**Backend:**
- FastAPI 0.111.0 (Python 3.10+)
- PostgreSQL with SQLModel/SQLAlchemy
- JWT authentication with python-jose
- Alembic for database migrations
- Rate limiting with custom token bucket algorithm

**Frontend:**
- React 18.3.1 with TypeScript
- Vite 5.4.2 for fast builds
- Tailwind CSS 3.4.1 for styling
- Recharts for data visualization
- Comprehensive error boundaries and loading states

**DevOps:**
- Pre-commit hooks for code quality
- Black, Flake8, MyPy for Python linting
- Prettier, ESLint for TypeScript/React
- PowerShell and Bash deployment scripts

## ✨ Features

### Backend
- ✅ RESTful API with automatic OpenAPI documentation
- ✅ JWT-based authentication with refresh tokens
- ✅ Rate limiting (60 requests/min with 10 burst capacity)
- ✅ Comprehensive error handling with typed exceptions
- ✅ Database connection pooling for scalability
- ✅ Structured logging with file and console handlers
- ✅ CORS configuration for frontend integration
- ✅ Health check endpoint for monitoring

### Frontend
- ✅ Responsive dashboard with multiple views
- ✅ Real-time data visualization with charts
- ✅ Error boundaries for graceful failure handling
- ✅ Loading states for all async operations
- ✅ Platform-specific data management
- ✅ Economic impact metrics and trends

### Data Collection
- ✅ Multi-platform harvester support
- ✅ Configurable rate limiting per platform
- ✅ Automatic fallback to mock data
- ✅ Snapshot-based historical tracking

## 📦 Prerequisites

- **Python**: 3.10 or higher
- **Node.js**: 18 or higher
- **PostgreSQL**: 15 or higher (optional for development, uses SQLite)
- **Git**: For version control

## 🚀 Quick Start

### Option 1: PowerShell Script (Windows - Recommended)

```powershell
# Install dependencies
.\install.ps1

# Configure environment
cp backend\.env.example backend\.env
cp frontend\.env.example frontend\.env

# Edit .env files with your configuration
notepad backend\.env
notepad frontend\.env

# Run database migrations
cd backend
alembic upgrade head
cd ..

# Start development servers
.\dev.ps1
```

### Option 2: Manual Setup

```powershell
# Backend setup
cd backend
python -m venv .venv
.\.venv\Scripts\Activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your configuration
alembic upgrade head
python dev.py

# Frontend setup (in new terminal)
cd frontend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

The backend will be available at `http://localhost:8000` and the frontend at `http://localhost:5173`.

## ⚙️ Configuration

### Backend Environment Variables

Create `backend/.env` from `backend/.env.example`:

```env
# Server Configuration
ENVIRONMENT=development          # development, staging, production
HOST=127.0.0.1
PORT=8000

# Database
DATABASE_URL=sqlite:///./afrobeats.db  # or postgresql://user:pass@host/db

# Security
JWT_SECRET_KEY=your-secret-key-min-32-chars
JWT_REFRESH_SECRET_KEY=your-refresh-secret-min-32-chars
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=30
JWT_REFRESH_TOKEN_EXPIRE_DAYS=7

# API Keys (optional for development)
YOUTUBE_API_KEY=your-youtube-api-key
SPOTIFY_CLIENT_ID=your-spotify-client-id
SPOTIFY_CLIENT_SECRET=your-spotify-client-secret

# CORS
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:4173

# Rate Limiting
RATE_LIMIT_REQUESTS=60
RATE_LIMIT_WINDOW=60

# Logging
LOG_LEVEL=INFO
LOG_FILE=logs/app.log
```

### Frontend Environment Variables

Create `frontend/.env` from `frontend/.env.example`:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:8000

# Optional: API timeout in milliseconds
VITE_API_TIMEOUT=30000
```

## 💻 Development

### Backend Development

```powershell
# Activate virtual environment
cd backend
.\.venv\Scripts\Activate

# Start development server with hot reload
python dev.py

# Or use uvicorn directly
uvicorn main:app --reload --host 127.0.0.1 --port 8000

# Run tests
pytest

# Format code
black .
isort .

# Lint code
flake8
mypy .

# Create migration
alembic revision --autogenerate -m "Description of changes"

# Apply migrations
alembic upgrade head

# Rollback migration
alembic downgrade -1
```

### Frontend Development

```powershell
cd frontend

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type check
npm run typecheck

# Lint
npm run lint

# Format
npm run format
```

### Using Make (Linux/macOS)

```bash
# View all commands
make help

# Install dependencies
make install

# Start both servers
make dev

# Run tests
make test

# Build for production
make build

# Database migrations
make migrate
make migrate-create MSG="your message"
```

## 🚢 Deployment

### Render.com (Backend)

1. Push your code to GitHub
2. Connect your repository to Render
3. Use the provided `render.yaml` configuration
4. Set environment variables in Render dashboard
5. Deploy!

The configuration includes:
- Automatic PostgreSQL database provisioning
- Health check monitoring
- Auto-scaling capabilities

### Vercel (Frontend)

```powershell
cd frontend

# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Production deployment
vercel --prod
```

Configuration in `frontend/vercel.json`:
- SPA routing support
- Asset caching optimization
- Environment variable injection

### Manual Deployment

```powershell
# Build backend
cd backend
pip install -r requirements.txt
alembic upgrade head

# Start with production settings
python start.py

# Build frontend
cd frontend
npm run build

# Serve static files with any web server
# dist/ folder contains production build
```

## 📚 API Documentation

Once the backend is running, visit:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **OpenAPI JSON**: http://localhost:8000/openapi.json

### Key Endpoints

#### Health & Status
- `GET /health` - Health check with service status

#### Economic Metrics
- `GET /api/kpis` - GDP contribution, jobs supported, export revenue
- `GET /api/trends` - Historical trend data
- `GET /api/platform-share` - Platform distribution metrics

#### Platform Data
- `GET /api/v1/platforms` - List all supported platforms
- `GET /api/v1/platforms/{slug}` - Latest data for specific platform
- `GET /api/v1/platforms/all` - Bulk export of all platform data

#### Data Collection
- `POST /api/v1/harvest/run` - Trigger data harvest
- `GET /api/v1/harvest/recent` - Recent harvest snapshots
- `GET /api/v1/harvest/history/{slug}` - Platform-specific history

### Rate Limits

- 60 requests per minute per IP address
- 10 burst requests allowed
- Returns `429 Too Many Requests` when exceeded

## 🧪 Testing

### Backend Tests

```powershell
cd backend
pytest                          # Run all tests
pytest -v                       # Verbose output
pytest --cov=.                  # With coverage
pytest tests/test_main.py       # Specific file
```

### Frontend Tests

```powershell
cd frontend
npm test                        # Run tests (not configured yet)
npm run typecheck              # Type checking
```

## 🤝 Contributing

### Code Quality

This project uses pre-commit hooks to ensure code quality:

```powershell
# Install pre-commit hooks
pip install pre-commit
pre-commit install

# Run manually
pre-commit run --all-files
```

### Code Style

**Python:**
- Line length: 100 characters
- Formatter: Black
- Import sorting: isort (Black-compatible)
- Linter: Flake8
- Type checker: MyPy

**TypeScript/React:**
- Line length: 100 characters
- Formatter: Prettier
- Linter: ESLint
- Single quotes, semicolons, trailing commas

### Workflow

1. Create a feature branch
2. Make your changes
3. Run linters and tests
4. Commit with descriptive messages
5. Push and create a pull request

## 📊 Data Sources & Economic Model

### Supported Platforms

| Platform | Type | Authentication |
|----------|------|----------------|
| Audiomack | Scraping | No |
| Apple Music | API | No |
| Deezer | API | No |
| Boomplay | Scraping | No |
| TurnTable | Scraping | No |
| YouTube | API | Yes (API Key) |
| Spotify | API | Yes (Client Credentials) |

### Economic Assumptions

- **Stream Payout**: $0.003 USD per stream
- **Economic Multiplier**: 1.75× (captures indirect/induced effects)
- **Jobs Ratio**: 50 jobs per $1M USD of activity
- **Export Share**: 42% attributed to diaspora consumption

### Transparency

- Every metric includes calculation methodology
- Fallback to mock data when APIs unavailable
- All assumptions documented and configurable
- Open to community feedback and refinement

## 📝 License

This project is open source and available for use in policy research and creative industry development.

## 🙏 Acknowledgments

- IFPI for regional music consumption data
- Nigerian music industry stakeholders
- Open-source community

---

For questions or support, please open an issue on GitHub.
