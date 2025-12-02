from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import dotenv_values
from pathlib import Path

# Load .env from same folder as this script
env_path = Path(__file__).parent / ".env"
config = dotenv_values(env_path)

# Read DATABASE_URL from .env
DATABASE_URL = config.get("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("❌ DATABASE_URL not found in .env")

# Create engine
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True
)

# ✅ Test connection & print success
try:
    with engine.connect() as conn:
        conn.execute(text("SELECT 1"))
    print("✅ Database connection successful.")
except Exception as e:
    print("❌ Database connection failed:", e)

# Session factory
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# Base class for models
Base = declarative_base()
