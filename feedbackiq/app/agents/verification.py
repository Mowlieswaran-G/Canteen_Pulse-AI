"""
Verification Agent for FeedbackIQ (Phase 8).
Measures post-intervention effectiveness using before/after rate drop and z-test confidence.
Verdict: improved (relative drop >= 30%), worse (rise >= 20%), no_change, or insufficient_data.
"""
import math
from typing import Dict, Any

def verify_action_resolution(before_count: int, before_total: int, after_count: int, after_total: int) -> Dict[str, Any]:
    if before_total < 10 or after_total < 10:
        return {
            "verdict": "insufficient_data",
            "before_rate": 0.0,
            "after_rate": 0.0,
            "change_pct": 0.0,
            "confidence": "low",
            "summary": "Insufficient sample volume to measure post-intervention shift."
        }
        
    p1 = before_count / before_total
    p2 = after_count / after_total
    
    change_pct = ((p2 - p1) / max(0.0001, p1)) * 100.0
    
    # Simple two-proportion pooled z-test
    p_pool = (before_count + after_count) / (before_total + after_total)
    se = math.sqrt(p_pool * (1 - p_pool) * (1/before_total + 1/after_total))
    z = (p1 - p2) / max(0.00001, se)
    
    # Confidence from z-score: |z| > 1.96 (p < 0.05) -> high, |z| > 1.44 (p < 0.15) -> medium
    confidence = "high" if abs(z) >= 1.96 else ("medium" if abs(z) >= 1.44 else "low")
    
    if change_pct <= -30.0 and (before_count - after_count) >= 3:
        verdict = "improved"
        summary = f"Complaints dropped significantly by {abs(change_pct):.1f}% after kitchen intervention."
    elif change_pct >= 20.0:
        verdict = "worse"
        summary = f"Issue recurrence increased by {change_pct:.1f}% post-intervention."
    else:
        verdict = "no_change"
        summary = "No statistically significant reduction in issue complaints observed."
        
    return {
        "verdict": verdict,
        "before_count": before_count,
        "after_count": after_count,
        "change_pct": round(change_pct, 1),
        "confidence": confidence,
        "summary": summary
    }
