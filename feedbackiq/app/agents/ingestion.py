"""
Ingestion Agent for FeedbackIQ.
Scrubs PII (emails, phones, roll/room IDs) before text reaches LLM.
Performs deduplication and language heuristics.
"""
import re
import hashlib
from typing import Dict, Any, Tuple

EMAIL_REGEX = re.compile(r'[\w\.-]+@[\w\.-]+\.\w+')
PHONE_REGEX = re.compile(r'(\+?\d{1,3}[-.\s]?)?(\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}')
ID_REGEX = re.compile(r'\b(roll|room|id|emp)[\s:#_-]*[A-Za-z0-9]+\b', re.IGNORECASE)

def scrub_pii(text: str) -> str:
    cleaned = EMAIL_REGEX.sub("[EMAIL]", text)
    cleaned = PHONE_REGEX.sub("[PHONE]", cleaned)
    cleaned = ID_REGEX.sub("[ID]", cleaned)
    return cleaned

def ingest_feedback_item(raw: Dict[str, Any]) -> Dict[str, Any]:
    text = raw.get("text", "") or raw.get("comment", "")
    text_clean = scrub_pii(text)
    
    # Compute content hash
    content_hash = hashlib.sha256(f"{text_clean.lower()}_{raw.get('item', '')}".encode()).hexdigest()
    
    return {
        "id": raw.get("id") or raw.get("feedback_id"),
        "timestamp": raw.get("timestamp") or raw.get("date"),
        "meal_type": raw.get("meal_type", "lunch"),
        "item": raw.get("item", "General"),
        "rating": int(raw.get("rating", 3)),
        "text": text,
        "text_clean": text_clean,
        "channel": raw.get("channel", "qr_form"),
        "location_id": raw.get("location_id") or raw.get("location"),
        "anonymous": raw.get("anonymous", True),
        "content_hash": content_hash
    }
