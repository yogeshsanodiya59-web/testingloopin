from app.db.session import init_db
from app.core.config import settings
from sqlalchemy import text, inspect
import app.db.session as db_session

def migrate():
    print("Initializing DB connection...")
    init_db(settings.DATABASE_URL)

    print("Starting migration check...")
    inspector = inspect(db_session.engine)
    
    # 1. Check posts table for is_anonymous
    post_columns = [col['name'] for col in inspector.get_columns('posts')]
    if 'is_anonymous' not in post_columns:
        print("Adding 'is_anonymous' column to posts table...")
        with db_session.engine.connect() as conn:
            conn.execute(text("ALTER TABLE posts ADD COLUMN is_anonymous BOOLEAN DEFAULT false"))
            conn.commit()
        print("Migration successful: 'is_anonymous' added.")
    else:
        print("Migration skipped: 'is_anonymous' already exists.")

    # 2. Check users table for auth_provider
    user_columns = [col['name'] for col in inspector.get_columns('users')]
    if 'auth_provider' not in user_columns:
        print("Adding 'auth_provider' column to users table...")
        with db_session.engine.connect() as conn:
            conn.execute(text("ALTER TABLE users ADD COLUMN auth_provider VARCHAR DEFAULT 'local'"))
            conn.commit()
        print("Migration successful: 'auth_provider' added.")
    else:
        print("Migration skipped: 'auth_provider' already exists.")

    # 3. Make hashed_password nullable (ALTER COLUMN)
    # We can't easily check nullability with basic inspect, so we just run it safely or assume it's needed if we added auth_provider
    print("Ensuring hashed_password is nullable...")
    try:
        with db_session.engine.connect() as conn:
            conn.execute(text("ALTER TABLE users ALTER COLUMN hashed_password DROP NOT NULL"))
            conn.commit()
        print("Migration successful: hashed_password made nullable.")
    except Exception as e:
        print(f"Migration note: hashed_password alteration might have failed or wasn't needed: {e}")

if __name__ == "__main__":
    migrate()
