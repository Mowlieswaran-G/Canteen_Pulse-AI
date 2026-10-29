"""
LangGraph Multi-Agent Workflow Engine for FeedbackIQ.
Pipeline: ingestion -> analysis -> insight -> prediction -> priority -> action -> approval (interrupt) -> schedule -> verification -> report -> END.
"""
from typing import Dict, Any, List, Optional
import time
from ..repository import OrgRepository
from ..agents.ingestion import ingest_feedback_item
from ..agents.analysis import analyze_comment
from ..agents.prediction import predict_issue_risk
from ..agents.action import synthesize_action
from ..tools.stats import build_issue_facts

class PipelineWorkflow:
    def __init__(self, repo: OrgRepository, org_config: Dict[str, Any]):
        self.repo = repo
        self.org_config = org_config
        self.events: List[Dict[str, Any]] = []

    def log_event(self, node_id: str, node_name: str, status: str, message: str, items_processed: int = 0):
        self.events.append({
            "node_id": node_id,
            "node_name": node_name,
            "status": status,
            "timestamp": time.strftime("%H:%M:%S"),
            "message": message,
            "items_processed": items_processed
        })

    def run_pipeline(self, as_of: Optional[str] = None) -> Dict[str, Any]:
        """Executes pipeline nodes up to the human-in-the-loop approval pause."""
        self.events.clear()
        
        # 1. Ingestion
        self.log_event("node_1", "Ingestion & PII Scrubbing", "running", "Ingesting raw submissions and scrubbing PII...")
        raw_items = self.repo.get_feedback(as_of=as_of, limit=100)
        cleaned_items = [ingest_feedback_item(r) for r in raw_items]
        self.log_event("node_1", "Ingestion & PII Scrubbing", "completed", f"Scrubbed and normalized {len(cleaned_items)} records.", len(cleaned_items))

        # 2. Analysis & Alert Backstop
        self.log_event("node_2", "Aspect & Severity Analysis", "running", "Classifying sentiments and evaluating keyword alert backstop...")
        alerts_found = 0
        keywords = self.org_config.get("alert_keywords", {})
        for item in cleaned_items:
            res = analyze_comment(item, keywords)
            self.repo.add_analysis(res)
            if res.get("is_alert"):
                self.repo.create_alert(item["id"], res.get("alert_reason", "Safety hazard flagged"))
                alerts_found += 1
        self.log_event("node_2", "Aspect & Severity Analysis", "completed", f"Analysis complete. {alerts_found} critical alerts flagged.", len(cleaned_items))

        # 3. Prediction Engine
        self.log_event("node_3", "Poisson Risk Prediction", "running", "Computing factual recurrence patterns and rule backstop...")
        complaints = self.repo.get_complaints_data(as_of=as_of)
        
        # Discover distinct issue keys
        keys_seen = set()
        predictions = []
        for c in complaints:
            k = (c.get("item"), c.get("meal_type"), c.get("category"))
            if k not in keys_seen and all(k):
                keys_seen.add(k)
                facts = build_issue_facts(complaints, k[0], k[1], k[2], as_of=as_of)
                pred = predict_issue_risk(facts)
                predictions.append(pred)
        self.log_event("node_3", "Poisson Risk Prediction", "completed", f"Generated predictions for {len(predictions)} unique issue keys.", len(predictions))

        # 4. Action Synthesis & Priority Ranking
        self.log_event("node_4", "Action Synthesis & Priority Ranking", "running", "Ranking actions by composite formula and pinning health risks...")
        open_alerts = self.repo.get_alerts(status="open")
        has_alerts = len(open_alerts) > 0
        
        actions = []
        for pred in predictions[:6]:
            cat = pred["issue_key"].split(":")[0]
            is_health = cat in self.org_config.get("health_risk_categories", [])
            act = synthesize_action(pred, is_health_risk=is_health, has_open_alert=has_alerts)
            act_id = self.repo.create_action(act)
            act["id"] = act_id
            actions.append(act)
            
        actions.sort(key=lambda a: a["priority_score"], reverse=True)
        self.log_event("node_4", "Action Synthesis & Priority Ranking", "completed", f"Ranked {len(actions)} high-leverage actions.", len(actions))

        # 5. Human-in-the-Loop Interrupt / Pause
        self.log_event("node_5", "Human Approval Checkpoint", "paused", "Pipeline paused at interrupt: awaiting manager review (action.approve).", len(actions))

        return {
            "status": "paused_at_approval",
            "events": self.events,
            "predictions_count": len(predictions),
            "actions_count": len(actions),
            "alerts_count": alerts_found
        }
