# ⚡ Quick Start Guide

**Get up and running in 5 minutes**

---

## 🚀 One-Command Start

```powershell
.\scripts\start.ps1
```

That's it! The script will:
- ✅ Check Python & Node.js installation
- ✅ Install all dependencies automatically
- ✅ Start backend at **http://localhost:8000**
- ✅ Start frontend at **http://localhost:5173**

---

## 📦 Manual Installation (Optional)

If you prefer to install dependencies separately:

```powershell
.\scripts\install.ps1
```

---

## 🛠️ Development Mode

For development with hot reload:

```powershell
.\scripts\dev.ps1
```

---

## 📂 Project Structure

```
Afrobeats-Economic-Engine/
├── 📂 backend/          # FastAPI + Python 3.13
├── 📂 frontend/         # React 18 + TypeScript + Vite
├── 📂 docs/             # All documentation
│   ├── guides/          # Setup & tutorials
│   ├── architecture/    # Technical specs
│   ├── pitch/           # Pitch materials
│   └── archive/         # Old versions
├── 📂 scripts/          # Automation scripts
│   ├── start.ps1        # Start both servers
│   ├── dev.ps1          # Development mode
│   └── install.ps1      # Install dependencies
└── 📂 deployment/       # Deploy configs
```

For complete structure details, see [PROJECT-STRUCTURE.md](./PROJECT-STRUCTURE.md)

---

## 🔑 Environment Setup (Optional)

**Backend** (`.env` in `backend/` folder):
```env
GEMINI_API_KEY=AIzaSyBmFPthpIdrLptZCekTYyTNNscccF3tjCI
DATABASE_URL=sqlite:///./data/engine.db
```

**Frontend** (`.env` in `frontend/` folder):
```env
VITE_API_BASE=http://127.0.0.1:8000
```

---

## 📊 Access the Application

Once started, open your browser:

- **Frontend Dashboard**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

---

## 🧪 Test the AI Chat

1. Open http://localhost:5173
2. Click **"Settings"** tab
3. Scroll to **"Beats AI Chat"**
4. Ask: *"What's the economic impact of Afrobeats?"*
5. Get AI-powered insights using **Gemini 2.0 Flash**

---

## 🛑 Stop the Application

Press **Ctrl+C** in the PowerShell window where you ran `start.ps1`

---

## 📚 Next Steps

- **Full Documentation**: [docs/guides/SETUP.md](./docs/guides/SETUP.md)
- **Technical Specs**: [docs/architecture/TECHNICAL-SPEC.md](./docs/architecture/TECHNICAL-SPEC.md)
- **Pitch Guide**: [docs/pitch/PITCH-GUIDE.md](./docs/pitch/PITCH-GUIDE.md)
- **Project Structure**: [PROJECT-STRUCTURE.md](./PROJECT-STRUCTURE.md)

---

## ❓ Troubleshooting

**Python not found:**
```powershell
# Install from https://www.python.org/downloads/
# Ensure "Add to PATH" is checked during installation
```

**Node.js not found:**
```powershell
# Install from https://nodejs.org/
```

**Port already in use:**
```powershell
# Kill process using port 8000
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Kill process using port 5173
netstat -ano | findstr :5173
taskkill /PID <PID> /F
```

**Database errors:**
```powershell
# Delete and recreate database
Remove-Item .\data\engine.db
# Restart the application
.\scripts\start.ps1
```

---

## 🤝 Support

- **Issues**: Report bugs via GitHub Issues
- **Documentation**: See `docs/` directory
- **Architecture**: See `PROJECT-STRUCTURE.md`

---

**Last Updated:** November 14, 2025  
**Version:** 1.0.0
