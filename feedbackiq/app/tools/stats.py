"""
Stats and fact computation tools for FeedbackIQ.
Principle: "Code counts, LLM thinks."
All functions filter timestamp < as_of to prevent future data leakage.
"""
from datetime import datetime
from typing import List, Dict, Any, Optional

def parse_iso(ts_str: str) -> datetime:
    for fmt in ("%Y-%m-%d %H:%M:%S", "%Y-%m-%dT%H:%M:%S", "%Y-%m-%d"):
        try:
            return datetime.strptime(ts_str[:19], fmt)
        except ValueError:
            pass
    return datetime.utcnow()

def filter_as_of(records: List[Dict[str, Any]], as_of: Optional[str] = None) -> List[Dict[str, Any]]:
    if not as_of:
        return records
    as_of_dt = parse_iso(as_of)
    return [r for r in records if parse_iso(r["timestamp"]) <= as_of_dt]

def weeks_present(records: List[Dict[str, Any]], n: int = 6) -> int:
    """Calculates how many of the last N weeks had at least 1 complaint."""
    if not records:
        return 0
    # Group by week calendar number
    weeks = set()
    for r in records:
        dt = parse_iso(r["timestamp"])
        weeks.add(dt.isocalendar()[1])
    return min(len(weeks), n)

def day_of_week_pattern(records: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Finds dominant day of week and its share of complaints."""
    if not records:
        return {"dominant_day": None, "dominant_share": 0.0}
    
    day_counts: Dict[str, int] = {}
    for r in records:
        day = parse_iso(r["timestamp"]).strftime("%A")
        day_counts[day] = day_counts.get(day, 0) + 1
        
    total = len(records)
    best_day = max(day_counts, key=day_counts.get)
    share = day_counts[best_day] / total
    return {"dominant_day": best_day, "dominant_share": round(share, 3)}

def is_spike(weekly_counts: List[int]) -> bool:
    """Returns True if only 1 week has a high count and other weeks are near zero."""
    if len(weekly_counts) < 3:
        return False
    max_c = max(weekly_counts)
    if max_c < 5:
        return False
    # If other weeks sum to <= 20% of max
    other_sum = sum(weekly_counts) - max_c
    return (other_sum / max_c) <= 0.25

def rule_risk(facts: Dict[str, Any]) -> str:
    """
    Non-negotiable deterministic risk rule:
    High if present >= 4 of last 6 weeks OR (>= 3 of 6 and rising).
    Medium if 3 of 6 OR (2 of 6 and rising).
    Else Low; spikes forced Low.
    """
    if facts.get("is_spike", False):
        return "Low"
        
    weeks_p = facts.get("weeks_present", 0)
    is_rising = facts.get("is_rising", False)
    
    if weeks_p >= 4 or (weeks_p >= 3 and is_rising):
        return "High"
    elif weeks_p >= 3 or (weeks_p >= 2 and is_rising):
        return "Medium"
    else:
        return "Low"

def build_issue_facts(records: List[Dict[str, Any]], item: str, meal_type: str, category: str, as_of: Optional[str] = None) -> Dict[str, Any]:
    """Builds the verified factual evidence packet for an IssueKey."""
    filtered = [
        r for r in filter_as_of(records, as_of)
        if r.get("item") == item and r.get("meal_type") == meal_type and r.get("category") == category
    ]
    
    # Sort chronological
    filtered.sort(key=lambda x: x["timestamp"])
    
    total_count = len(filtered)
    wp = weeks_present(filtered, n=6)
    dow = day_of_week_pattern(filtered)
    
    # Calculate simple slope / rising
    recent_4w = filtered[-15:] if len(filtered) >= 15 else filtered
    is_rising = len(recent_4w) >= 8 and len(filtered) > 10
    
    # Check spike
    # Sample weekly counts approximation
    w_counts = [0] * 6
    if filtered:
        max_dt = parse_iso(filtered[-1]["timestamp"])
        for r in filtered:
            diff_w = max(0, min(5, (max_dt - parse_iso(r["timestamp"])).days // 7))
            w_counts[5 - diff_w] += 1
            
    spike_flag = is_spike(w_counts)
    
    facts = {
        "item": item,
        "meal_type": meal_type,
        "category": category,
        "total_complaints": total_count,
        "weeks_present": wp,
        "dominant_day": dow["dominant_day"] if dow["dominant_share"] >= 0.4 else None,
        "dominant_share": dow["dominant_share"],
        "is_spike": spike_flag,
        "is_rising": is_rising,
        "sample_quotes": [r.get("text") or r.get("comment", "") for r in filtered[:3] if r.get("text") or r.get("comment")]
    }
    facts["rule_risk"] = rule_risk(facts)
    return facts
