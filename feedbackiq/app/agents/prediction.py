"""
Prediction Agent for FeedbackIQ.
Evaluates recurring risk with programmatic citation verification and rule backstop.
Rule: final_risk = max(llm_risk, rule_risk). Never let the LLM lower a rule-High.
"""
from typing import Dict, Any, List
from ..llm import call_llm
from ..tools.stats import build_issue_facts

RISK_RANK = {"Low": 1, "Medium": 2, "High": 3}
RANK_TO_RISK = {1: "Low", 2: "Medium", 3: "High"}

def predict_issue_risk(facts: Dict[str, Any]) -> Dict[str, Any]:
    rule_level = facts.get("rule_risk", "Low")
    
    # LLM prediction call
    llm_resp = call_llm(
        agent_name="prediction",
        prompt="Synthesize recurring risk for dining issue.",
        payload={"facts": facts}
    )
    
    llm_risk = llm_resp.get("risk_level", "Low")
    
    # Verify citations: programmatically check cited evidence values match facts
    evidence_verified = True
    for item in llm_resp.get("evidence_items", []):
        field = item.get("field")
        val = item.get("value")
        if field in facts and facts[field] != val:
            evidence_verified = False
            break
            
    # Deterministic Backstop: never lower a rule-High
    rule_score = RISK_RANK.get(rule_level, 1)
    llm_score = RISK_RANK.get(llm_risk, 1)
    final_score = max(rule_score, llm_score)
    final_risk = RANK_TO_RISK[final_score]
    
    likely_day = facts.get("dominant_day") if facts.get("dominant_share", 0) >= 0.4 else None
    
    return {
        "issue_key": f"{facts['category']}:{facts['item']}:{facts['meal_type']}",
        "item": facts["item"],
        "meal_type": facts["meal_type"],
        "risk_level": final_risk,
        "likely_day": likely_day,
        "evidence_json": facts,
        "evidence_verified": evidence_verified,
        "rationale": llm_resp.get("rationale") or f"Historical frequency in {facts.get('weeks_present')} of recent weeks."
    }
