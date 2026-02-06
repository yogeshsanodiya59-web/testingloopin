# Backend Lifecycle: Before vs After

## ❌ BEFORE (Broken)

```
┌─────────────────────────────────────────────────────┐
│  Python imports main.py                             │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│  main.py imports session.py                         │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│  session.py: engine = create_engine(...)           │
│  ┌──────────────────────────────────────────────┐  │
│  │ ⚠️  PROBLEM: Database connection created     │  │
│  │     at import time!                          │  │
│  └──────────────────────────────────────────────┘  │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│  main.py: Base.metadata.create_all(bind=engine)    │
│  ┌──────────────────────────────────────────────┐  │
│  │ ⚠️  PROBLEM: Tables created at import time!  │  │
│  └──────────────────────────────────────────────┘  │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│  main.py: app = FastAPI()                          │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│  Uvicorn starts serving requests                    │
└─────────────────────────────────────────────────────┘

Issues:
1. DB connection happens BEFORE app is ready
2. Reload creates new connection pool WITHOUT closing old one
3. No control over initialization order
4. Windows reload fails due to multiple processes
```

---

## ✅ AFTER (Fixed)

```
┌─────────────────────────────────────────────────────┐
│  Python imports main.py                             │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│  main.py imports session.py                         │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│  session.py: engine = None                          │
│  ┌──────────────────────────────────────────────┐  │
│  │ ✅ FIXED: No side effects at import time     │  │
│  └──────────────────────────────────────────────┘  │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│  main.py: app = FastAPI(lifespan=lifespan)         │
│  ┌──────────────────────────────────────────────┐  │
│  │ ✅ FIXED: Lifespan events registered        │  │
│  └──────────────────────────────────────────────┘  │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│  FastAPI calls lifespan startup                     │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│  lifespan: init_db(DATABASE_URL)                    │
│  ┌──────────────────────────────────────────────┐  │
│  │ ✅ Engine created with connection pool       │  │
│  │ ✅ pool_pre_ping=True (health check)         │  │
│  │ ✅ pool_size=5, max_overflow=10             │  │
│  └──────────────────────────────────────────────┘  │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│  lifespan: create_tables()                          │
│  ┌──────────────────────────────────────────────┐  │
│  │ ✅ Import models (deferred)                  │  │
│  │ ✅ Create tables only if missing             │  │
│  └──────────────────────────────────────────────┘  │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│  logger.info("Application startup complete")       │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│  Uvicorn starts serving requests                    │
│  ┌──────────────────────────────────────────────┐  │
│  │ ✅ DB is ready                               │  │
│  │ ✅ Tables exist                              │  │
│  │ ✅ Connection pool configured                │  │
│  └──────────────────────────────────────────────┘  │
└─────────────────┬───────────────────────────────────┘
                  │
                  │ (Serving requests...)
                  │
                  ▼ (Ctrl+C pressed)
┌─────────────────────────────────────────────────────┐
│  FastAPI calls lifespan shutdown                    │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│  lifespan: close_db()                               │
│  ┌──────────────────────────────────────────────┐  │
│  │ ✅ engine.dispose() called                   │  │
│  │ ✅ All connections closed                    │  │
│  │ ✅ Resources cleaned up                      │  │
│  └──────────────────────────────────────────────┘  │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│  logger.info("Application shutdown complete")      │
└─────────────────────────────────────────────────────┘

Benefits:
✅ Predictable initialization order
✅ Graceful shutdown
✅ Works with uvicorn --reload  
✅ Production-ready connection pool
✅ Clear logs for debugging
```

---

## Request Flow (After Fix)

```
User Request: POST /auth/register
│
▼
┌─────────────────────────────────────────────────────┐
│ FastAPI: Route handler called                       │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│ Depends(get_db) injected                            │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│ get_db(): Check if SessionLocal is initialized      │
│ ┌──────────────────────────────────────────────┐   │
│ │ if SessionLocal is None:                     │   │
│ │     raise RuntimeError(...)                  │   │
│ │ ✅ Prevents using DB before startup complete │   │
│ └──────────────────────────────────────────────┘   │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│ SessionLocal() creates new session                  │
│ ┌──────────────────────────────────────────────┐   │
│ │ Gets connection from pool                    │   │
│ │ pool_pre_ping verifies it's alive            │   │
│ └──────────────────────────────────────────────┘   │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│ Route handler uses db.query(User)...                │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│ get_db(): finally block executes                    │
│ ┌──────────────────────────────────────────────┐   │
│ │ db.close()                                   │   │
│ │ Returns connection to pool                   │   │
│ └──────────────────────────────────────────────┘   │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│ Response sent to user                               │
└─────────────────────────────────────────────────────┘
```

---

## Connection Pool Behavior

```
Application Lifetime
│
├── STARTUP
│   │
│   ├─ init_db() creates engine
│   │  └─ Connection pool created (0 connections)
│   │
│   └─ create_tables()
│      └─ Opens 1 connection, creates tables, closes it
│
├── RUNNING
│   │
│   ├─ Request 1 arrives
│   │  └─ Pool opens connection #1 (pool size: 1)
│   │
│   ├─ Request 2 arrives  
│   │  └─ Pool opens connection #2 (pool size: 2)
│   │
│   ├─ Request 1 completes
│   │  └─ Connection #1 returned to pool (still alive)
│   │
│   ├─ Request 3 arrives
│   │  └─ Reuses connection #1 from pool (no new connection!)
│   │
│   └─ ... pool grows up to pool_size + max_overflow
│
└── SHUTDOWN
    │
    └─ close_db() calls engine.dispose()
       └─ All connections closed
          └─ Pool destroyed
```

---

## Error Handling Flow

```
Startup (lifespan)
│
├─ try:
│   ├─ init_db(DATABASE_URL)
│   │  │
│   │  └─ ERROR: Invalid DATABASE_URL
│   │     │
│   │     ▼
│   │     except Exception as e:
│   │         logger.error(f"Startup failed: {e}")
│   │         raise  ← App won't start
│   │
│   └─ create_tables()
│      │
│      └─ ERROR: PostgreSQL not running
│         │
│         ▼
│         except Exception as e:
│             logger.error(f"Startup failed: {e}")
│             raise  ← App won't start
│
└─ Result: Uvicorn sees exception, shows error, exits
   ✅ User sees clear error message
   ✅ App doesn't run with broken DB
```

---

## Why pool_pre_ping Matters

```
Without pool_pre_ping:
│
├─ Connection created
├─ Connection idle for 2 hours
├─ Network interruption (router restart)
├─ Connection becomes STALE
├─ Request uses stale connection
└─ ERROR: "server closed the connection unexpectedly"

With pool_pre_ping=True:
│
├─ Connection created
├─ Connection idle for 2 hours  
├─ Network interruption (router restart)
├─ Connection becomes STALE
├─ Request arrives
├─ pool_pre_ping: SELECT 1  ← Verify connection
│   └─ ERROR: Connection dead
│       └─ Pool discards dead connection
│           └─ Pool creates NEW connection
│               └─ Request succeeds!
└─ ✅ Automatic recovery
```

This is why `pool_pre_ping=True` is essential for production!
