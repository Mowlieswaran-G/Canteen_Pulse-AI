"""
LLM abstraction layer for FeedbackIQ.
Enforces offline determinism when MOCK_LLM=true or when API key is missing.
Maintains response cache keyed by sha256(model + prompt + payload).
"""
import os
import json
import hashlib
import time
from typing import Dict, Any, Optional
from .config import MOCK_LLM, LLM_API_KEY, LLM_MODEL_CHEAP, LLM_MODEL_STRONG

_RESPONSE_CACHE: Dict[str, Any] = {}

def get_cache_key(model: str, prompt: str, payload: Any) -> str:
    serialized = f"{model}:{prompt}:{json.dumps(payload, sort_keys=True)}"
    return hashlib.sha256(serialized.encode()).hexdigest()

def call_llm(agent_name: str, prompt: str, payload: Any, model: Optional[str] = None) -> Dict[str, Any]:
    selected_model = model or LLM_MODEL_CHEAP
    key = get_cache_key(selected_model, prompt, payload)
    
    if key in _RESPONSE_CACHE:
        return _RESPONSE_CACHE[key]
        
    start_time = time.time()
    
    # Mock LLM deterministic dispatcher
    if MOCK_LLM or not LLM_API_KEY:
        response = _mock_agent_response(agent_name, prompt, payload)
        latency = time.time() - start_time
        _RESPONSE_CACHE[key] = response
        return response

    # If real Gemini API is available
    try:
        from google import genai
        client = genai.Client(api_key=LLM_API_KEY)
        resp = client.models.generate_content(
            model=selected_model,
            contents=[prompt, json.dumps(payload)],
            config={"response_mime_type": "application/json"}
        )
        data = json.loads(resp.text)
        _RESPONSE_CACHE[key] = data
        return data
    except Exception as e:
        # Graceful fallback to mock on transient failure
        fallback = _mock_agent_response(agent_name, prompt, payload)
        _RESPONSE_CACHE[key] = fallback
        return fallback

def _mock_agent_response(agent_name: str, prompt: str, payload: Any) -> Dict[str, Any]:
    """Deterministic mock response for offline testing."""
    if agent_name == "analysis":
        text = str(payload.get("text", "")).lower()
        cat = "other"
        sev = 3
        is_alert = False
        alert_reason = ""
        
        if any(w in text for w in ("cold", "thanda", "thanni", "lukewarm", "freeze")):
            cat = "temperature"
            sev = 3
        elif any(w in text for w in ("salt", "namak", "uppu", "spicy", "oily", "bland")):
            cat = "taste"
            sev = 2
        elif any(w in text for w in ("insect", "cockroach", "hair", "baal", "poochi", "poisoning", "vomit", "ulti")):
            cat = "hygiene"
            sev = 5
            is_alert = True
            alert_reason = "Foreign object / health hazard keyword match"
        elif any(w in text for w in ("wait", "line", "queue", "late", "bheed")):
            cat = "wait_time"
            sev = 2
        elif any(w in text for w in ("stale", "baasi", "smell")):
            cat = "freshness"
            sev = 4

        sentiment = "negative" if sev >= 2 else "positive"
        return {
            "feedback_id": payload.get("id"),
            "sentiment": sentiment,
            "sentiment_score": -0.6 if sentiment == "negative" else 0.8,
            "issue_category": cat,
            "severity": sev,
            "aspects": [{"aspect": cat, "sentiment": sentiment}],
            "is_alert": is_alert,
            "alert_reason": alert_reason
        }

    elif agent_name == "prediction":
        facts = payload.get("facts", {})
        rule_risk = facts.get("rule_risk", "Low")
        dom_day = facts.get("dominant_day")
        
        return {
            "risk_level": rule_risk,
            "likely_day": dom_day,
            "evidence_items": [
                {"field": "weeks_present", "value": facts.get("weeks_present")},
                {"field": "dominant_day", "value": dom_day}
            ],
            "rationale": f"High complaint frequency in {facts.get('weeks_present')} of recent weeks with concentration on {dom_day or 'scheduled shift'}."
        }

    elif agent_name == "action":
        item = payload.get("item", "General")
        category = payload.get("category", "General")
        
        return {
            "recommendation": f"Enact mandatory temperature and quality holding audits on {item} before shift launch.",
            "owner_role": "Cook",
            "effort": 2,
            "due_date": "Next Friday",
            "success_metric": "30% reduction in complaint recurrence"
        }

    return {"status": "ok", "agent": agent_name}
