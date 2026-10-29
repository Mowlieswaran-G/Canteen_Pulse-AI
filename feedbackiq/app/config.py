"""
Configuration and settings for FeedbackIQ.
"""
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

# Database
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{BASE_DIR}/feedbackiq.db")

# LLM & Mode
LLM_PROVIDER = os.getenv("LLM_PROVIDER", "gemini")
LLM_MODEL_CHEAP = os.getenv("LLM_MODEL_CHEAP", "gemini-2.5-flash")
LLM_MODEL_STRONG = os.getenv("LLM_MODEL_STRONG", "gemini-2.5-pro")
LLM_API_KEY = os.getenv("LLM_API_KEY", os.getenv("GEMINI_API_KEY", ""))
MOCK_LLM = os.getenv("MOCK_LLM", "true").lower() in ("true", "1", "yes")

# Auth & Forecasting
JWT_SECRET = os.getenv("JWT_SECRET", "feedbackiq_super_secret_jwt_key_change_in_prod_2026")
JWT_ALGORITHM = "HS256"
JWT_EXPIRY_HOURS = 24
FORECAST_WINDOW_WEEKS = int(os.getenv("FORECAST_WINDOW_WEEKS", "6"))
VERIFY_AFTER_DAYS = int(os.getenv("VERIFY_AFTER_DAYS", "7"))

# Templates path
TEMPLATES_DIR = BASE_DIR / "app" / "templates"
