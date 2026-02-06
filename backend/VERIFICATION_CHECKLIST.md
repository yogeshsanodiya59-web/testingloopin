# Backend Fix Verification Checklist

## Pre-Flight Checks

### 1. Dependencies Installed
```bash
cd backend
.\venv\Scripts\activate
pip install -r requirements.txt
```

- [ ] No errors during installation
- [ ] All packages installed successfully

---

### 2. Configuration File Created
```bash
copy .env.example .env
# Edit .env with your PostgreSQL password
```

- [ ] `.env` file exists
- [ ] `DATABASE_URL` is correct
- [ ] `SECRET_KEY` is set (change default!)

---

### 3. Database Created
```bash
psql -U postgres
CREATE DATABASE loopin;
\q
```

- [ ] Database `loopin` exists
- [ ] PostgreSQL is running

---

### 4. Validation Script Passes
```bash
python validate.py
```

- [ ] ✅ All packages installed
- [ ] ✅ .env file found
- [ ] ✅ PostgreSQL connection successful
- [ ] ✅ Application imports successfully

---

## Startup Checks

### 5. Backend Starts Without Errors
```bash
uvicorn app.main:app --reload
```

**Expected logs:**
```
INFO:     Starting application...
INFO:     Database URL: localhost/loopin
INFO:     Database engine initialized
INFO:     Database tables created/verified
INFO:     Application startup complete
INFO:     Uvicorn running on http://127.0.0.1:8000
```

- [ ] No errors in startup logs
- [ ] See all 4 INFO messages
- [ ] Server listening on port 8000

---

### 6. Health Check Works
```bash
curl http://localhost:8000/health
```

**Expected response:**
```json
{"status":"ok"}
```

- [ ] Returns `{"status":"ok"}`
- [ ] No errors

---

### 7. API Docs Accessible

Visit: http://localhost:8000/docs

- [ ] Swagger UI loads
- [ ] See `/health` endpoint
- [ ] See `/auth/register` endpoint
- [ ] See `/auth/login` endpoint

---

### 8. Database Tables Created

```bash
psql -U postgres -d loopin
\dt
```

**Expected output:**
```
        List of relations
 Schema | Name  | Type  |  Owner
--------+-------+-------+----------
 public | users | table | postgres
```

- [ ] `users` table exists
- [ ] Has columns: id, email, hashed_password, is_active

---

## Functional Tests

### 9. User Registration Works

```bash
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.edu","password":"password123"}'
```

**Expected response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

- [ ] Returns `access_token`
- [ ] Returns `token_type: "bearer"`
- [ ] No 500 errors

---

### 10. User Login Works

```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.edu","password":"password123"}'
```

**Expected response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

- [ ] Returns `access_token`
- [ ] Same email/password works
- [ ] Token is different from registration (new token)

---

### 11. User Persisted in Database

```bash
psql -U postgres -d loopin
SELECT email, is_active FROM users;
```

**Expected output:**
```
      email       | is_active
------------------+-----------
 test@test.edu    | t
```

- [ ] User exists in database
- [ ] `is_active` is true
- [ ] Email matches what you registered

---

## Reload Tests (Critical for Windows)

### 12. Hot Reload Works

1. Keep server running
2. Edit `app/main.py` - add a comment
3. Save file
4. Watch terminal

**Expected logs:**
```
INFO:     Shutting down application...
INFO:     Database connections closed
INFO:     Application shutdown complete

INFO:     Detected file change...
INFO:     Starting application...
INFO:     Database engine initialized
INFO:     Database tables created/verified
INFO:     Application startup complete
```

- [ ] No errors during reload
- [ ] Sees shutdown logs
- [ ] Sees startup logs again
- [ ] Server responds to requests after reload

---

### 13. Multiple Reloads Work

1. Repeat step 12 five times
2. Make different edits each time

- [ ] No errors after 5 reloads
- [ ] Server still responsive
- [ ] No connection leaks (check PostgreSQL connections)

---

### 14. Graceful Shutdown Works

1. Press `Ctrl+C`

**Expected logs:**
```
INFO:     Shutting down application...
INFO:     Database connections closed
INFO:     Application shutdown complete
INFO:     Shutting down
```

- [ ] Clean shutdown
- [ ] See shutdown logs
- [ ] No errors
- [ ] No dangling processes

---

## Error Handling Tests

### 15. Invalid Database URL

1. Edit `.env` - change DATABASE_URL to invalid
2. Restart server

**Expected behavior:**
```
ERROR:    Startup failed: ...
```

- [ ] Server refuses to start
- [ ] Clear error message shown
- [ ] No infinite retry loop

---

### 16. PostgreSQL Not Running

1. Stop PostgreSQL service
2. Try to start backend

**Expected behavior:**
```
ERROR:    Startup failed: could not connect to server...
```

- [ ] Server refuses to start
- [ ] Clear error message
- [ ] Mentions connection refused

---

### 17. Missing .env File

1. Rename `.env` to `.env.backup`
2. Try to start backend

**Expected behavior:**
- [ ] Uses default DATABASE_URL from `config.py`
- [ ] Starts (if default DB exists) OR shows connection error

---

## Production Readiness

### 18. No Import-Time Side Effects

```bash
python -c "from app.main import app; print('Import OK')"
```

- [ ] No database connections created
- [ ] No "create_all" executed
- [ ] Just prints "Import OK"

---

### 19. Connection Pool Configured

Check `app/db/session.py` - `init_db()` function:

- [ ] `pool_pre_ping=True` present
- [ ] `pool_size` set
- [ ] `max_overflow` set

---

### 20. Logging Configured

Check `app/main.py`:

- [ ] `logging.basicConfig()` present
- [ ] Startup messages logged
- [ ] Shutdown messages logged

---

## Performance Tests

### 21. Concurrent Requests Handled

```bash
# Install apache bench (optional)
ab -n 100 -c 10 http://localhost:8000/health
```

OR just:

```bash
# Multiple requests in parallel
curl http://localhost:8000/health &
curl http://localhost:8000/health &
curl http://localhost:8000/health &
wait
```

- [ ] All requests succeed
- [ ] No connection pool exhaustion
- [ ] No "too many clients" errors

---

## Final Verification

### 22. All Files Present

- [ ] `app/main.py` - Has lifespan context manager
- [ ] `app/db/session.py` - Has init_db, create_tables, close_db
- [ ] `app/core/config.py` - Unchanged
- [ ] `app/models/user.py` - Unchanged
- [ ] `requirements.txt` - Has all dependencies
- [ ] `validate.py` - Validation script exists
- [ ] `BACKEND_FIX_SUMMARY.md` - Summary exists
- [ ] `BACKEND_FIX_REPORT.md` - Detailed report exists
- [ ] `BACKEND_LIFECYCLE_DIAGRAM.md` - Diagrams exist

---

### 23. No Regressions

- [ ] Auth endpoints still work
- [ ] Health check still works
- [ ] API docs still load
- [ ] Database tables created correctly

---

## Sign-Off

**Date:** _______________  
**Tester:** _______________

**All checks passed?** [ ] YES / [ ] NO

**If NO, list failures:**
- 
- 

**If YES, backend is:**
- ✅ Stable
- ✅ Production-ready
- ✅ Reload-safe
- ✅ Well-documented

---

## Next Steps After Verification

1. **Test with Frontend:**
   - Start both backend + frontend
   - Test full auth flow through UI
   
2. **Add Features:**
   - Post creation
   - Comments
   - User profiles

3. **Add Tests:**
   - Unit tests for auth
   - Integration tests for API
   
4. **Deploy:**
   - Set production DATABASE_URL
   - Set strong SECRET_KEY
   - Restrict CORS origins
   - Configure production pool size

---

**Backend is now ready for Day 2 development! 🚀**
