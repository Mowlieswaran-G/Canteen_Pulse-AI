"""
Analysis Agent for FeedbackIQ.
Analyzes sentiment, extracts aspects, and assigns severity.
Features DETERMINISTIC ALERT BACKSTOP: keyword matching fires alerts even if LLM misses.
"""
from typing import Dict, Any, List
from ..llm import call_llm

def analyze_comment(feedback_item: Dict[str, Any], alert_keywords: Dict[str, List[str]]) -> Dict[str, Any]:
    text_clean = feedback_item.get("text_clean", "")
    
    # Check deterministic keyword alert backstop
    keyword_hit = None
    lower_text = text_clean.lower()
    for lang, kw_list in alert_keywords.items():
        for kw in kw_list:
            if kw.lower() in lower_text:
                keyword_hit = kw
                break
        if keyword_hit:
            break
            
    # Call LLM / Mock
    llm_res = call_llm(
        agent_name="analysis",
        prompt="Analyze feedback for food quality issues.",
        payload={"id": feedback_item.get("id"), "text": text_clean}
    )
    
    # DETERMINISTIC ALERT BACKSTOP
    is_alert = llm_res.get("is_alert", False) or (keyword_hit is not None)
    alert_reason = llm_res.get("alert_reason", "")
    if keyword_hit:
        alert_reason = f"Critical safety keyword matched: '{keyword_hit}'"
        
    severity = llm_res.get("severity", 3)
    if is_alert:
        severity = 5
        
    return {
        "feedback_id": feedback_item.get("id"),
        "sentiment": llm_res.get("sentiment", "negative"),
        "sentiment_score": llm_res.get("sentiment_score", -0.5),
        "issue_category": llm_res.get("issue_category", "other"),
        "severity": severity,
        "aspects_json": llm_res.get("aspects", []),
        "entities_json": {
            "item": feedback_item.get("item"),
            "meal_type": feedback_item.get("meal_type")
        },
        "is_alert": is_alert,
        "alert_reason": alert_reason
    }
