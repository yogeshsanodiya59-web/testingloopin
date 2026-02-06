# 🚀 Loop.in - Quick Reference

## Daily Commands

### Start Everything
```bash
# Terminal 1: Backend
cd backend
.\venv\Scripts\activate  # Windows
uvicorn app.main:app --reload

# Terminal 2: Frontend
cd frontend
npm run dev
```

## URLs

| Service | URL | Purpose |
|---------|-----|---------|
| **Homepage** | http://localhost:3000 | Main app |
| **Login** | http://localhost:3000/login | Authentication |
| **API Docs** | http://localhost:8000/docs | Swagger UI |
| **Health Check** | http://localhost:8000/health | Backend status |

## Common Commands

### Backend
```bash
# Install new package
pip install package-name
pip freeze > requirements.txt

# Database query
psql -U postgres -d loopin
SELECT * FROM users;
\q
```

### Frontend
```bash
# Install package
npm install package-name

# Build for production
npm run build
```

## File Locations

```
backend/.env          ← Database password here
frontend/.env.local   ← API URL here (optional)
```

## Troubleshooting

| Error | Fix |
|-------|-----|
| `ModuleNotFoundError` | Activate venv: `.\venv\Scripts\activate` |
| `Connection refused` | Start PostgreSQL |
| `Port already in use` | Kill process or use different port |
| `Network Error` | Backend not running on port 8000 |

## Need Help?
- Check logs in terminal
- Read full setup guide: [SETUP.md](SETUP.md)
- Review architecture: [backend/ARCHITECTURE.md](backend/ARCHITECTURE.md)
