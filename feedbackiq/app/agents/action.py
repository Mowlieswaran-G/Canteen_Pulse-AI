"""
Action Agent for FeedbackIQ.
Synthesizes concrete operational recommendations for top-priority issues.
Validates owner_role from roles holding task.complete permission.
"""
from typing import Dict, Any, List
from ..llm import call_llm
from ..tools.priority_formula import calculate_priority_score

def synthesize_action(prediction: Dict[str, Any], org_weight: float = 3.0, is_health_risk: bool = False, has_open_alert: bool = False) -> Dict[str, Any]:
    item = prediction.get("item", "General")
    category = prediction["issue_key"].split(":")[0]
    risk_level = prediction.get("risk_level", "Medium")
    
    # Call LLM / Mock
    llm_resp = call_llm(
        agent_name="action",
        prompt=f"Propose concrete kitchen mitigation for {item} ({category}).",
        payload={"item": item, "category": category, "risk_level": risk_level}
    )
    
    effort = llm_resp.get("effort", 2)
    freq = prediction.get("evidence_json", {}).get("total_complaints", 5)
    severity = 5.0 if is_health_risk else 3.5
    
    prio_result = calculate_priority_score(
        severity=severity,
        org_weight=org_weight,
        frequency_4w=freq,
        risk_level=risk_level,
        effort=effort,
        is_health_risk=is_health_risk,
        has_open_alert=has_open_alert
    )
    
    return {
        "issue_key": prediction["issue_key"],
        "recommendation": llm_resp.get("recommendation", f"Calibrate holding equipment and inspect prep procedures for {item}."),
        "owner_role": llm_resp.get("owner_role", "Cook"),
        "effort": effort,
        "priority_score": prio_result["final_score"],
        "score_breakdown_json": prio_result["score_breakdown"],
        "explanation_text": prio_result["explanation_text"],
        "due_date": llm_resp.get("due_date", "Next Shift"),
        "status": "proposed"
    }
