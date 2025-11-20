# 📁 Nigeria Music Analytics System (NMAS) - Project Structure

**Industry-Standard Organization** | **Last Updated:** November 14, 2025

---

## 📋 Table of Contents

- [Root Structure](#root-structure)
- [Backend Architecture](#backend-architecture)
- [Frontend Architecture](#frontend-architecture)
- [Documentation Organization](#documentation-organization)
- [Scripts & Automation](#scripts--automation)
- [Deployment Configuration](#deployment-configuration)
- [Development Workflow](#development-workflow)

---

## 🌳 Root Structure

```
Afrobeats-Economic-Engine/
├── 📄 README.md                    # Main project documentation
├── 📄 LICENSE                      # Project license
├── 📄 .gitignore                   # Git ignore patterns
├── 📄 .pre-commit-config.yaml      # Pre-commit hooks
├── 📄 Makefile                     # Build automation
│
├── 📂 backend/                     # Python/FastAPI backend
├── 📂 frontend/                    # React/TypeScript frontend
├── 📂 data/                        # SQLite database & data files
│
├── 📂 docs/                        # All documentation
│   ├── guides/                     # User & developer guides
│   ├── architecture/               # Technical specs & designs
│   ├── api/                        # API documentation
│   ├── pitch/                      # Pitch decks & marketing
│   └── archive/                    # Old versions & backups
│
├── 📂 scripts/                     # Automation scripts
│   ├── start.ps1                   # Start both servers
│   ├── dev.ps1                     # Development mode
│   └── install.ps1                 # Setup & dependencies
│
├── 📂 deployment/                  # Deployment configurations
│   ├── render.yaml                 # Render.com config
│   └── docker-compose.dev.yml      # Docker development
│
└── 📂 .github/                     # GitHub workflows & templates
```

---

## 🐍 Backend Architecture

```
backend/
├── 📄 main.py                      # FastAPI application entry
├── 📄 config.py                    # Settings & environment vars
├── 📄 logger.py                    # Logging configuration
├── 📄 requirements.txt             # Python dependencies
├── 📄 pyproject.toml               # Project metadata
│
├── 📄 pipeline.py                  # Data collection orchestrator
├── 📄 storage.py                   # Database operations (SQLModel)
├── 📄 model.py                     # Economic impact calculations
├── 📄 schemas.py                   # Pydantic response models
├── 📄 exceptions.py                # Custom exception handlers
├── 📄 rate_limit.py                # Rate limiting middleware
├── 📄 auth.py                      # Authentication (future)
│
├── 📄 api_client.py                # External API integrations
├── 📄 scraper.py                   # Web scraping utilities
├── 📄 ai_engine.py                 # Beats AI (Gemini 2.0 Flash)
│
├── 📂 harvesters/                  # Platform-specific collectors
│   ├── __init__.py                 # Harvester registry
│   ├── apple_music.py              # Apple Music RSS feeds
│   ├── audiomack.py                # Audiomack scraper
│   ├── deezer.py                   # Deezer API client
│   └── turntable.py                # TurnTable Charts scraper
│
├── 📂 alembic/                     # Database migrations
│   ├── env.py                      # Migration environment
│   └── versions/                   # Migration scripts
│
├── 📂 tests/                       # Backend unit tests
│   └── test_main.py                # API endpoint tests
│
├── 📂 logs/                        # Application logs
└── 📂 venv/                        # Python virtual environment
```

### **Key Backend Files**

| File | Purpose |
|------|---------|
| `main.py` | FastAPI app, middleware, endpoints |
| `ai_engine.py` | Gemini 2.0 Flash integration, RAG, knowledge base |
| `pipeline.py` | Orchestrates data collection from all platforms |
| `storage.py` | SQLModel ORM, database operations |
| `model.py` | Economic impact formulas (GDP, jobs, exports) |
| `scraper.py` | TurnTable Charts scraping (BeautifulSoup) |
| `harvesters/*.py` | Platform-specific data collectors |

---

## ⚛️ Frontend Architecture

```
frontend/
├── 📄 package.json                 # Node.js dependencies
├── 📄 vite.config.ts               # Vite build configuration
├── 📄 tsconfig.json                # TypeScript configuration
├── 📄 tailwind.config.js           # Tailwind CSS settings
├── 📄 postcss.config.js            # PostCSS configuration
├── 📄 eslint.config.js             # ESLint rules
├── 📄 vercel.json                  # Vercel deployment config
│
├── 📄 index.html                   # HTML entry point
│
├── 📂 src/
│   ├── 📄 main.tsx                 # React app entry point
│   ├── 📄 App.tsx                  # Root component
│   ├── 📄 index.css                # Global styles + glass effects
│   ├── 📄 vite-env.d.ts            # Vite type definitions
│   │
│   ├── 📂 components/              # Reusable UI components
│   │   ├── DashboardLayout.tsx     # Main layout with navigation
│   │   ├── StatCard.tsx            # KPI card component
│   │   ├── LoadingSpinner.tsx      # Loading state UI
│   │   ├── ErrorBoundary.tsx       # Error handling wrapper
│   │   └── ErrorAlert.tsx          # Error message display
│   │
│   ├── 📂 pages/                   # Full-page dashboard views
│   │   ├── OverviewDashboard.tsx   # KPIs & summary
│   │   ├── ArtistsDashboard.tsx    # Top 100 artists (TurnTable)
│   │   ├── TrendsDashboard.tsx     # Time-series analytics
│   │   ├── EconomicImpactDashboard.tsx  # GDP/jobs/exports
│   │   ├── SettingsDashboard.tsx   # Global settings
│   │   ├── DataManagementDashboard.tsx  # Data admin
│   │   └── SourcesManagementDashboard.tsx  # Platform config
│   │
│   ├── 📂 contexts/                # React Context providers
│   │   └── SettingsContext.tsx     # Global settings state
│   │
│   └── 📂 lib/                     # Utilities & services
│       ├── api.ts                  # Backend API client
│       ├── database.types.ts       # TypeScript types
│       └── supabase.ts             # Supabase client (optional)
│
└── 📂 node_modules/                # NPM dependencies
```

### **Key Frontend Files**

| File | Purpose |
|------|---------|
| `DashboardLayout.tsx` | Navigation tabs, glass morphism UI |
| `SettingsContext.tsx` | Theme, currency, glass effect state |
| `api.ts` | Centralized API calls with error handling |
| `index.css` | Tailwind base + liquid glass CSS utilities |
| `*Dashboard.tsx` | Full-page views for each analytics section |

---

## 📚 Documentation Organization

```
docs/
├── 📂 guides/                      # How-to guides
│   ├── SETUP.md                    # Installation & setup
│   └── QUICKSTART.md               # Quick start tutorial
│
├── 📂 architecture/                # Technical documentation
│   ├── TECHNICAL-SPEC.md           # Complete system spec
│   ├── FEATURE-GAP-ANALYSIS.md     # Feature roadmap
│   ├── UI-IMPROVEMENTS.md          # UI enhancement history
│   ├── GEMINI-2.0-UPGRADE.md       # AI model upgrade guide
│   └── GEMINI-INTEGRATION-COMPLETE.md  # Integration docs
│
├── 📂 api/                         # API documentation
│   └── (Auto-generated at /docs)   # FastAPI Swagger UI
│
├── 📂 pitch/                       # Pitch & marketing materials
│   ├── PITCH-GUIDE.md              # Presentation strategies
│   ├── VISUAL-ASSETS.md            # Screenshots & diagrams
│   ├── pitch-deck.md               # Main pitch deck
│   ├── pitch-deck-alt.md           # Alternative version
│   └── Hackathon-Guidebook.pdf     # Original hackathon brief
│
└── 📂 archive/                     # Historical documents
    ├── README-OLD.md               # Original README
    └── README-PITCH.md             # Pitch version backup
```

### **Documentation Index**

| Document | Audience | Purpose |
|----------|----------|---------|
| `README.md` | Everyone | Main project overview |
| `SETUP.md` | Developers | Installation instructions |
| `QUICKSTART.md` | New users | 5-minute tutorial |
| `TECHNICAL-SPEC.md` | Engineers | Full system architecture |
| `PITCH-GUIDE.md` | Presenters | How to pitch the solution |
| `VISUAL-ASSETS.md` | Marketers | Diagrams & visual aids |

---

## 🔧 Scripts & Automation

```
scripts/
├── start.ps1                       # Start backend + frontend
├── dev.ps1                         # Development mode with hot reload
└── install.ps1                     # Install all dependencies
```

### **Script Usage**

**Start Application (Production Mode):**
```powershell
.\scripts\start.ps1
# Backend: http://localhost:8000
# Frontend: http://localhost:5173
```

**Development Mode:**
```powershell
.\scripts\dev.ps1
# Runs with file watchers and auto-reload
```

**Install Dependencies:**
```powershell
.\scripts\install.ps1
# Installs Python + Node.js dependencies
```

---

## 🚀 Deployment Configuration

```
deployment/
├── render.yaml                     # Render.com blueprint
└── docker-compose.dev.yml          # Docker development setup
```

### **Deployment Targets**

| Platform | Config File | Status |
|----------|-------------|--------|
| **Render.com** | `deployment/render.yaml` | ✅ Production |
| **Vercel** | `frontend/vercel.json` | ✅ Frontend |
| **Docker** | `deployment/docker-compose.dev.yml` | ⚠️ Dev only |

---

## 🔄 Development Workflow

### **1. Initial Setup**

```powershell
# Clone repository
git clone <repo-url>
cd Afrobeats-Economic-Engine

# Install dependencies
.\scripts\install.ps1

# Start development servers
.\scripts\start.ps1
```

### **2. Daily Development**

```powershell
# Backend changes
cd backend
.\venv\Scripts\Activate.ps1
uvicorn main:app --reload

# Frontend changes
cd frontend
npm run dev
```

### **3. Testing**

```powershell
# Backend tests
cd backend
pytest

# Frontend (when tests added)
cd frontend
npm test
```

### **4. Deployment**

```powershell
# Commit changes
git add .
git commit -m "feat: <description>"
git push

# Render.com auto-deploys from main branch
# Vercel auto-deploys frontend
```

---

## 📊 Data Flow Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    DATA SOURCES                         │
│  YouTube • Apple Music • Spotify • TurnTable • etc.     │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│               HARVESTERS (backend/harvesters/)          │
│  Platform-specific collectors with fallback strategies  │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│               PIPELINE (backend/pipeline.py)            │
│  Normalizes, validates, aggregates data                 │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│               STORAGE (backend/storage.py)              │
│  SQLite (dev) or PostgreSQL (prod) via SQLModel         │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│            ECONOMIC MODEL (backend/model.py)            │
│  Calculates GDP, jobs, exports from streaming data      │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              FASTAPI ENDPOINTS (backend/main.py)        │
│  REST API with auto-generated docs at /docs             │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│            REACT FRONTEND (frontend/src/)               │
│  Dashboards, charts, AI chat interface                  │
└─────────────────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                 END USERS                               │
│  Government • Investors • Industry • Artists            │
└─────────────────────────────────────────────────────────┘
```

---

## 🔐 Security & Configuration

### **Environment Variables**

```bash
# Backend (.env or config.py)
GEMINI_API_KEY=AIzaSyBmFPthpIdrLptZCekTYyTNNscccF3tjCI
YOUTUBE_API_KEY=<optional>
DATABASE_URL=sqlite:///./data/engine.db  # or PostgreSQL URL
CORS_ORIGINS=http://localhost:5173,http://localhost:5174

# Frontend (.env)
VITE_API_BASE=http://127.0.0.1:8000
```

### **Sensitive Files (.gitignore)**

- `*.env`
- `data/*.db`
- `backend/logs/*.log`
- `backend/venv/`
- `frontend/node_modules/`

---

## 📈 Growth & Scalability

### **Current Limits**

- **Database:** SQLite (single-file, suitable for <100K records)
- **API Rate Limit:** 100 requests/minute per IP
- **Gemini API:** 2 requests/second (free tier)

### **Scaling Path**

1. **Database:** Migrate to PostgreSQL via `DATABASE_URL`
2. **Caching:** Add Redis for API response caching
3. **Load Balancing:** Deploy multiple backend instances
4. **CDN:** Serve frontend via Cloudflare or similar
5. **API Tier:** Upgrade Gemini to paid tier for higher limits

---

## 🛠️ Maintenance Checklist

### **Weekly**

- [ ] Review backend logs (`backend/logs/`)
- [ ] Check API error rates in Render dashboard
- [ ] Update TurnTable Charts scraper if website changes
- [ ] Test AI chat responses for accuracy

### **Monthly**

- [ ] Update Python dependencies (`pip install -U -r requirements.txt`)
- [ ] Update Node.js dependencies (`npm update`)
- [ ] Review and archive old logs
- [ ] Backup database (`data/engine.db`)

### **Quarterly**

- [ ] Security audit (dependency vulnerabilities)
- [ ] Performance profiling (API response times)
- [ ] User feedback analysis
- [ ] Roadmap planning (see `FEATURE-GAP-ANALYSIS.md`)

---

## 🤝 Contributing

### **File Organization Standards**

1. **Backend:** Follow PEP 8, use type hints
2. **Frontend:** Use TypeScript, ESLint rules enforced
3. **Documentation:** Markdown with proper headings
4. **Scripts:** PowerShell with comments explaining each step

### **Git Workflow**

```bash
# Feature branch
git checkout -b feature/new-platform-harvester

# Commit with conventional commits
git commit -m "feat(harvesters): add Boomplay scraper"

# Push and create PR
git push origin feature/new-platform-harvester
```

---

## 📞 Support & Resources

- **API Documentation:** http://localhost:8000/docs (when running)
- **GitHub Issues:** For bugs and feature requests
- **Architecture Docs:** `docs/architecture/TECHNICAL-SPEC.md`
- **Pitch Materials:** `docs/pitch/PITCH-GUIDE.md`

---

**Last Updated:** November 14, 2025  
**Maintained By:** Nigeria Music Analytics System (NMAS) Team  
**License:** See LICENSE file
