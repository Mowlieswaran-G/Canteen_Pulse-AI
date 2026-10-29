"""
Database helper and connection factory for FeedbackIQ.
"""
import sqlite3
from typing import Optional
from .config import DATABASE_URL, BASE_DIR
from .models import init_db

def get_connection(db_url: Optional[str] = None) -> sqlite3.Connection:
    url = db_url or DATABASE_URL
    if url.startswith("sqlite:///"):
        path = url.replace("sqlite:///", "")
    else:
        path = f"{BASE_DIR}/feedbackiq.db"
    
    conn = sqlite3.connect(path)
    conn.row_factory = sqlite3.Row
    # Enable WAL mode and foreign keys for SQLite
    conn.execute("PRAGMA foreign_keys = ON;")
    conn.execute("PRAGMA journal_mode = WAL;")
    return conn

def setup_database():
    """Initializes tables in database."""
    conn = get_connection()
    from .models import SQL_SCHEMA_DDL
    conn.executescript(SQL_SCHEMA_DDL)
    conn.commit()
    conn.close()
