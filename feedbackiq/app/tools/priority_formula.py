"""
Priority ranking formula and pinning engine for FeedbackIQ.
Formula: score = severity * org_weight * frequency(4w) * recurrence_weight(High 3, Medium 2, Low 1) * reach / effort
PIN RULE: health_risk categories with severity >= 4 or open alert rank above all unpinned issues.
"""
from typing import Dict, Any, List

def calculate_priority_score(
    severity: float,
    org_weight: float,
    frequency_4w: int,
    risk_level: str,
    effort: int = 2,
    reach: float = 1.0,
    is_health_risk: bool = False,
    has_open_alert: bool = False
) -> Dict[str, Any]:
    # Recurrence multiplier: High=3, Medium=2, Low=1
    rec_mult = 3.0 if risk_level == "High" else (2.0 if risk_level == "Medium" else 1.0)
    eff = max(1, min(5, effort))
    
    # Base calculation
    freq = max(1, frequency_4w)
    base_score = (severity * org_weight * freq * rec_mult * reach) / eff
    
    # Health risk or open alert pin
    is_pinned = is_health_risk or has_open_alert
    final_score = base_score + 1000.0 if is_pinned else base_score
    
    explanation = ""
    if has_open_alert:
        explanation = "Ranked with top priority due to an active, unacknowledged critical alert."
    elif is_health_risk:
        explanation = "Ranked with top priority because it involves a mandatory health risk category."
    elif risk_level == "High":
        explanation = f"Ranked high due to recurring High risk (weeks present) and severity weight ({org_weight:.1f}x)."
    else:
        explanation = f"Standard priority based on {frequency_4w} recent complaints and effort score {eff}."
        
    return {
        "final_score": round(final_score, 2),
        "is_pinned": is_pinned,
        "score_breakdown": {
            "severity": severity,
            "org_weight": org_weight,
            "frequency_4w": frequency_4w,
            "recurrence_multiplier": rec_mult,
            "effort": eff,
            "reach": reach,
            "is_pinned": is_pinned,
            "base_score": round(base_score, 2)
        },
        "explanation_text": explanation
    }
