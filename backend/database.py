from pathlib import Path
from dotenv import load_dotenv
import os

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base

# ----- Load .env -----
BASE_DIR = Path(__file__).resolve().parent
env_path = BASE_DIR / ".env"

print(f"🔍 Loading .env from: {env_path}")
print("🔍 .env exists:", env_path.exists())

# Load variables into environment
load_dotenv(dotenv_path=env_path)

# Read DATABASE_URL
DATABASE_URL = os.getenv("DATABASE_URL")
print("🔍 DATABASE_URL loaded:", bool(DATABASE_URL))

if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL not set. Check that .env is in the same folder as database.py and contains a DATABASE_URL entry.")

# ----- SQLAlchemy setup -----
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True
)

# Test connection
try:
    with engine.connect() as conn:
        conn.execute(text("SELECT 1"))
    print("✅ Database connection successful.")
except Exception as e:
    print("❌ Database connection failed:", e)
    raise

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
