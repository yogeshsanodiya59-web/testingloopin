# 🚀 Loop.in - Complete Setup Guide

**⏱️ Estimated Time:** 15-20 minutes  
**📝 Skill Level:** Beginner-friendly

This guide will walk you through setting up Loop.in on your local machine step-by-step.

---

## ✅ Prerequisites Checklist

Before starting, install these tools:

| Tool | Version | Check Command | Download Link |
|------|---------|---------------|---------------|
| **Python** | 3.10+ | `python --version` | [python.org](https://www.python.org/) |
| **Node.js** | 18+ | `node --version` | [nodejs.org](https://nodejs.org/) |
| **PostgreSQL** | 14+ | `psql --version` | [postgresql.org](https://www.postgresql.org/) |
| **Git** | Any | `git --version` | [git-scm.com](https://git-scm.com/) |

---

## 📥 Part 1: Download the Project

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/loop-in.git
cd loop-in
```

**What this does:** Downloads all the project files to your computer.

---

## 🗄️ Part 2: Database Setup

### 1. Start PostgreSQL
Make sure PostgreSQL is running on your computer.

**Windows:**
1. Press `Win + R`, type `services.msc`
2. Find "PostgreSQL" → Right-click → Start

**Mac:**
```bash
brew services start postgresql
```

**Linux:**
```bash
sudo systemctl start postgresql
```

### 2. Create the Database
```bash
# Open PostgreSQL command line
psql -U postgres

# You'll be asked for your PostgreSQL password (set during installation)
# If you don't remember it, you may need to reset it

# Create the database
CREATE DATABASE loopin;

# Verify it was created
\l

# Exit
\q
```

**What this does:** Creates an empty database called `loopin` where all user data will be stored.

---

## 🐍 Part 3: Backend Setup (FastAPI)

### 1. Navigate to Backend Folder
```bash
cd backend
```

### 2. Create Virtual Environment
```bash
python -m venv venv
```

**What this does:** Creates an isolated Python environment so packages don't conflict with other projects.

### 3. Activate Virtual Environment

**Windows (Command Prompt):**
```bash
.\venv\Scripts\activate
```

**Windows (PowerShell):**
```bash
.\venv\Scripts\Activate.ps1
```

**Mac/Linux:**
```bash
source venv/bin/activate
```

**How to know it worked:** You should see `(venv)` at the start of your command line.

### 4. Install Dependencies
```bash
pip install -r requirements.txt
```

**What this does:** Installs all Python packages needed (FastAPI, SQLAlchemy, etc.)

⏱️ **This may take 2-3 minutes**

### 5. Configure Environment Variables
```bash
# Windows
copy .env.example .env

# Mac/Linux
cp .env.example .env
```

**Now edit the `.env` file:**

Open `backend/.env` in a text editor and update:
```ini
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost/loopin
SECRET_KEY=your-super-secret-key-change-this
```

**Replace:**
- `YOUR_PASSWORD` with your PostgreSQL password
- `your-super-secret-key-change-this` with any random string

### 6. Start the Backend
```bash
uvicorn app.main:app --reload
```

**Expected output:**
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete.
```

✅ **Success!** Backend is running.

**Test it:** Open http://localhost:8000/docs in your browser. You should see API documentation.

---

## ⚛️ Part 4: Frontend Setup (Next.js)

**⚠️ Important:** Keep the backend running! Open a **NEW terminal window** for this part.

### 1. Navigate to Frontend Folder
```bash
cd frontend
```

### 2. Install Dependencies
```bash
npm install
```

**What this does:** Downloads all JavaScript packages (React, Next.js, Tailwind CSS, etc.)

⏱️ **This may take 3-5 minutes**

### 3. Start the Frontend
```bash
npm run dev
```

**Expected output:**
```
- Local:        http://localhost:3000
✓ Ready in 2.1s
```

✅ **Success!** Frontend is running.

**Test it:** Open http://localhost:3000 in your browser. You should see the Loop.in homepage!

---

## 🧪 Part 5: Testing the Full Setup

### Test the Authentication Flow

1. **Visit:** http://localhost:3000/login
2. **Register:** Click "Register Now" and create an account
   - Email: `test@university.edu` (can be any email for now)
   - Password: `password123`
3. **Click "Create Account"**
4. **You should be redirected to the home feed!**

### Verify Database

Check that the user was saved:
```bash
psql -U postgres -d loopin

# Run this query
SELECT * FROM users;

# You should see your test user!
# Exit
\q
```

---

## 🎉 You're All Set!

Your local development environment is ready. Here's what you have running:

| Service | URL | What It Does |
|---------|-----|--------------|
| **Frontend** | http://localhost:3000 | User interface |
| **Backend API** | http://localhost:8000 | Server-side logic |
| **API Docs** | http://localhost:8000/docs | Interactive API testing |
| **Database** | localhost:5432 | Data storage |

---

## 🐛 Troubleshooting Guide

### Backend Issues

#### `ModuleNotFoundError: No module named 'app'`
**Cause:** Virtual environment not activated  
**Fix:**
```bash
# Make sure you're in the backend folder
cd backend

# Activate venv
.\venv\Scripts\activate  # Windows
source venv/bin/activate  # Mac/Linux
```

#### `Connection refused` (Database error)
**Cause:** PostgreSQL is not running  
**Fix:**
- **Windows:** Services → PostgreSQL → Start
- **Mac:** `brew services start postgresql`
- **Linux:** `sudo systemctl start postgresql`

#### `password authentication failed`
**Cause:** Wrong PostgreSQL password in `.env`  
**Fix:** Update `DATABASE_URL` in `backend/.env` with correct password:
```ini
DATABASE_URL=postgresql://postgres:CORRECT_PASSWORD@localhost/loopin
```

#### `Port 8000 already in use`
**Cause:** Another app is using port 8000  
**Fix:** Kill the process or use a different port:
```bash
uvicorn app.main:app --reload --port 8001
```

---

### Frontend Issues

#### `Cannot find module 'next'`
**Cause:** Dependencies not installed  
**Fix:**
```bash
cd frontend
npm install
```

#### `EADDRINUSE: Port 3000 already in use`
**Cause:** Another app is using port 3000  
**Fix:** Kill the process or use a different port:
```bash
npm run dev -- -p 3001
```

#### `Network Error` when clicking Login
**Cause:** Backend is not running  
**Fix:** Make sure backend is running on port 8000. Check http://localhost:8000/health

---

### Database Issues

#### `database "loopin" does not exist`
**Cause:** You haven't created the database yet  
**Fix:**
```bash
psql -U postgres
CREATE DATABASE loopin;
\q
```

#### `psql: command not found`
**Cause:** PostgreSQL is not in your system PATH  
**Fix:**
- **Windows:** Restart your computer after installing PostgreSQL
- **Mac:** `brew install postgresql`
- **Linux:** `sudo apt-get install postgresql`

---

## 🔄 Daily Development Workflow

Once everything is set up, here's how to start working each day:

### 1. Start PostgreSQL
(Usually auto-starts on boot, but check if backend fails to connect)

### 2. Start Backend
```bash
cd backend
.\venv\Scripts\activate  # Windows
source venv/bin/activate  # Mac/Linux
uvicorn app.main:app --reload
```

### 3. Start Frontend (New Terminal)
```bash
cd frontend
npm run dev
```

### 4. Start Coding! 🚀

---

## 📝 Quick Command Reference

### Backend Commands
```bash
# Activate virtual environment
.\venv\Scripts\activate  # Windows
source venv/bin/activate  # Mac/Linux

# Start server
uvicorn app.main:app --reload

# Install new package
pip install package-name
pip freeze > requirements.txt  # Update requirements
```

### Frontend Commands
```bash
# Start dev server
npm run dev

# Install new package
npm install package-name

# Build for production
npm run build
```

### Database Commands
```bash
# Connect to database
psql -U postgres -d loopin

# List all tables
\dt

# View table contents
SELECT * FROM users;

# Exit
\q
```

---

## 🆘 Still Having Issues?

1. **Check the logs** - Read error messages carefully
2. **Google the error** - Copy/paste the exact error message
3. **Ask for help** - Open an issue on GitHub with:
   - Your operating system
   - The exact error message
   - What you were trying to do

---

## 🎯 Next Steps

Now that everything is set up, try:
- [ ] Creating a few test accounts
- [ ] Exploring the API docs at http://localhost:8000/docs
- [ ] Looking at the code in `backend/app/` and `frontend/src/`
- [ ] Making a small change (e.g., change the app title)
- [ ] Reading [CONTRIBUTING.md](CONTRIBUTING.md) to learn how to add features

**Happy coding! 🚀**
