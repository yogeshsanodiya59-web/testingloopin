# Day 1 Tech Lead Review Checklist

> **Purpose:** Strict validation before proceeding to Day 2  
> **Author:** Tech Lead Review  
> **Pass Criteria:** All items marked ✅ before adding ANY new features

---

## ✅ Backend Validation

### Project Structure
- [ ] Virtual environment exists (`backend/venv/`)
- [ ] All Python packages have `__init__.py` files
- [ ] `.env.example` exists (NO `.env` in git!)
- [ ] `.gitignore` includes: `.env`, `__pycache__`, `venv/`

### Core Files Must Exist
- [ ] `app/main.py` - FastAPI app entry point
- [ ] `app/core/config.py` - Pydantic settings
- [ ] `app/core/security.py` - Password hashing + JWT
- [ ] `app/db/session.py` - Database connection
- [ ] `app/models/user.py` - User table definition
- [ ] `app/api/auth.py` - Register & Login endpoints
- [ ] `requirements.txt` - All dependencies listed

### Health Check Endpoint
```bash
curl http://localhost:8000/health
# MUST return: {"status":"ok"}
```
- [ ] Returns 200 status code
- [ ] Returns JSON response
- [ ] No authentication required

### Auth Endpoints Working
```bash
# Register
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.edu","password":"pass123"}'

# MUST return: {"access_token":"...", "token_type":"bearer"}
```
- [ ] `/auth/register` accepts email + password
- [ ] Returns JWT token on success
- [ ] Returns 400 if email already exists
- [ ] Password is hashed (NEVER stored plain text!)

```bash
# Login
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.edu","password":"pass123"}'
```
- [ ] `/auth/login` validates credentials
- [ ] Returns JWT token on success
- [ ] Returns 401 for wrong password
- [ ] Returns 401 for non-existent user

### Database
- [ ] PostgreSQL is running
- [ ] Database `loopin` exists
- [ ] Table `users` auto-created on startup
- [ ] Can query: `SELECT * FROM users;`
- [ ] User emails are unique (database constraint)

### Code Quality (STRICT)
- [ ] NO hardcoded secrets (use `.env`)
- [ ] NO `print()` statements (use logging)
- [ ] NO bare `except:` (catch specific exceptions)
- [ ] Type hints on all functions
- [ ] NO commented-out code

---

## ✅ Frontend Validation

### Project Structure
- [ ] `node_modules/` in `.gitignore`
- [ ] `.env.example` exists (NO `.env.local` in git!)
- [ ] Proper folder structure: `src/app/`, `src/components/`, `src/lib/`

### Core Files Must Exist
- [ ] `src/app/layout.tsx` - Root layout with sidebar
- [ ] `src/app/page.tsx` - Home feed page
- [ ] `src/app/login/page.tsx` - Auth page
- [ ] `src/lib/api.ts` - Axios API client
- [ ] `tailwind.config.ts` - Tailwind setup
- [ ] `package.json` - Dependencies listed

### Pages Load Successfully
- [ ] `http://localhost:3000` loads (no errors)
- [ ] `http://localhost:3000/login` loads
- [ ] `http://localhost:3000/popular` loads (can be empty state)
- [ ] `http://localhost:3000/deadlines` loads (can be empty state)
- [ ] `http://localhost:3000/announcements` loads (can be empty state)

### Sidebar Navigation
- [ ] Sidebar visible on desktop
- [ ] Links to Home, Popular, Deadlines, Announcements
- [ ] Login/Register link at bottom
- [ ] Logo/branding at top
- [ ] Responsive (hidden on mobile or burger menu)

### Auth Flow Works End-to-End
**Critical Path:**
1. Visit `/login`
2. Click "Register Now"
3. Enter email + password
4. Click "Create Account"
5. **MUST:** Redirect to home feed
6. **MUST:** Token stored in localStorage

- [ ] Registration form submits to backend
- [ ] Success: Redirects to `/`
- [ ] Error: Shows user-friendly message
- [ ] Token persists after page refresh
- [ ] Login form also works

### Code Quality (STRICT)
- [ ] NO `any` types in TypeScript
- [ ] NO `console.log()` (use proper logging if needed)
- [ ] All components have proper TypeScript interfaces
- [ ] NO inline styles (use Tailwind classes)
- [ ] NO dead code or unused imports

---

## ✅ Integration Tests

### Manual End-to-End Test
**Start both servers, then:**

1. **Backend Check:**
   ```bash
   curl http://localhost:8000/docs
   # MUST show Swagger UI
   ```

2. **Frontend Check:**
   - Visit http://localhost:3000
   - MUST see home feed (even if dummy data)

3. **Auth Check:**
   - Visit http://localhost:3000/login
   - Register: `student@test.edu` / `password123`
   - MUST redirect to home
   - Check browser DevTools → Application → localStorage
   - MUST see `token` key with JWT value

4. **Database Check:**
   ```sql
   psql -U postgres -d loopin
   SELECT email, is_active FROM users;
   -- MUST show: student@test.edu | t
   ```

### Pass Criteria
- [ ] All 4 checks pass without errors
- [ ] No CORS errors in browser console
- [ ] No 500 errors in terminal logs

---

## ✅ Documentation Validation

### Required Files
- [ ] `README.md` - Project overview + quick start
- [ ] `SETUP.md` - Detailed step-by-step guide
- [ ] `CONTRIBUTING.md` - How to contribute
- [ ] `backend/.env.example` - Example config
- [ ] `frontend/.env.example` - Example config

### README Quality Check
- [ ] Has "What is this project?" section
- [ ] Lists prerequisites (Python, Node, PostgreSQL)
- [ ] Shows how to run backend
- [ ] Shows how to run frontend
- [ ] Includes tech stack explanation
- [ ] Has troubleshooting section

### Setup Guide Quality
- [ ] Step-by-step instructions
- [ ] Copy-paste commands work
- [ ] Explains common errors
- [ ] Includes database setup
- [ ] Has verification steps

---

## ❌ What NOT to Build on Day 1

### STOP if you have these (delete them!)
- [ ] ❌ Post creation functionality
- [ ] ❌ Comment system
- [ ] ❌ User profiles
- [ ] ❌ File uploads
- [ ] ❌ Real-time features (WebSockets)
- [ ] ❌ Email verification
- [ ] ❌ Password reset flow
- [ ] ❌ Admin dashboard
- [ ] ❌ Analytics
- [ ] ❌ Search functionality
- [ ] ❌ Notifications
- [ ] ❌ Unit tests (nice to have, but not Day 1)

### Day 1 Scope Is:
✅ Backend runs  
✅ Frontend runs  
✅ Auth works (register + login)  
✅ Database connected  
✅ Dummy data displays  
✅ Documentation exists  

**That's it. Nothing more.**

---

## 🛑 Stop Conditions (When to Call Day 1 Done)

### Minimum Viable Foundation Checklist

#### Backend (5/5 required)
- [ ] Health check returns 200
- [ ] Register creates user in database
- [ ] Login returns JWT token
- [ ] Password is hashed (check database)
- [ ] No hardcoded secrets

#### Frontend (5/5 required)
- [ ] Home page loads without errors
- [ ] Login page loads without errors
- [ ] Can register new user
- [ ] Can login existing user
- [ ] Token stored after login

#### Integration (3/3 required)
- [ ] Frontend can call backend
- [ ] No CORS errors
- [ ] Database persists data

#### Documentation (3/3 required)
- [ ] README explains what the project is
- [ ] SETUP.md has run commands
- [ ] Troubleshooting section exists

### Final Validation Command
```bash
# Run this script to verify everything works:

# 1. Backend health
curl -s http://localhost:8000/health | grep "ok"

# 2. Register
curl -s -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"verify@test.edu","password":"test"}' | grep "access_token"

# 3. Frontend loads
curl -s http://localhost:3000 | grep "Loop.in"

echo "If all 3 commands succeed, Day 1 is COMPLETE ✅"
```

---

## 🚦 Decision Matrix

| Scenario | Action |
|----------|--------|
| **All backend checks pass** | ✅ Proceed to frontend |
| **All frontend checks pass** | ✅ Proceed to integration |
| **Integration passes** | ✅ Proceed to documentation |
| **Documentation complete** | ✅ **DAY 1 DONE - STOP CODING** |
| **Any check fails** | ❌ Fix before proceeding |
| **Tempted to add features** | ❌ Refer to "What NOT to build" |

---

## 📋 Tech Lead Sign-Off

When ALL items above are checked:

**Day 1 Status:** [ ] COMPLETE  
**Reviewed By:** _____________  
**Date:** _____________  
**Approved to Proceed to Day 2:** [ ] YES / [ ] NO

**Blocker Items (if NO):**
- 
- 
- 

---

## 🎯 Day 2 Planning (DO NOT START TODAY)

Only after sign-off, plan:
- Post creation
- Feed updates
- Real database data
- Better error handling
- Basic tests

**RULE:** Do NOT start Day 2 until Day 1 is 100% validated.

---

**Remember:** A solid foundation beats rushed features. Day 1 is about RUNNING, not FEATURES.
