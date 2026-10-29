"""
OrgRepository for FeedbackIQ.
Enforces multi-tenancy: ALL data access requires org_id and filters every query.
No table access may bypass this repository.
"""
import sqlite3
import json
import hashlib
from typing import Dict, Any, List, Optional
from datetime import datetime

class OrgRepository:
    def __init__(self, org_id: str, conn: sqlite3.Connection):
        if not org_id:
            raise ValueError("OrgRepository requires a non-empty org_id")
        self.org_id = org_id
        self.conn = conn

    # --- Feedback Operations ---
    def add_feedback(self, fb: Dict[str, Any]) -> str:
        cursor = self.conn.cursor()
        fb_id = fb.get("id") or f"fb_{datetime.utcnow().strftime('%Y%m%d%H%M%S')}_{hashlib.sha256(str(fb).encode()).hexdigest()[:6]}"
        content_hash = fb.get("content_hash") or hashlib.sha256(f"{fb.get('text', '')}{fb.get('item', '')}".encode()).hexdigest()
        
        query = """
            INSERT INTO feedback (
                id, org_id, location_id, timestamp, rating, text,
                text_clean, channel, meal_type, item, anonymous,
                language, content_hash, raw_json
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """
        cursor.execute(query, (
            fb_id, self.org_id, fb.get("location_id"), fb.get("timestamp", datetime.utcnow().isoformat()),
            fb.get("rating", 3), fb.get("text", ""), fb.get("text_clean", fb.get("text", "")),
            fb.get("channel", "qr_form"), fb.get("meal_type", "lunch"), fb.get("item", "General"),
            1 if fb.get("anonymous", True) else 0, fb.get("language", "en"),
            content_hash, json.dumps(fb.get("raw_json", {}))
        ))
        self.conn.commit()
        return fb_id

    def get_feedback(self, location_id: Optional[str] = None, as_of: Optional[str] = None, limit: Optional[int] = None) -> List[Dict[str, Any]]:
        cursor = self.conn.cursor()
        sql = "SELECT * FROM feedback WHERE org_id = ?"
        params: List[Any] = [self.org_id]
        
        if location_id:
            sql += " AND location_id = ?"
            params.append(location_id)
        if as_of:
            sql += " AND timestamp <= ?"
            params.append(as_of)
            
        sql += " ORDER BY timestamp DESC"
        if limit:
            sql += f" LIMIT {int(limit)}"
            
        cursor.execute(sql, tuple(params))
        rows = cursor.fetchall()
        return [dict(r) for r in rows]

    def get_feedback_by_id(self, feedback_id: str) -> Optional[Dict[str, Any]]:
        cursor = self.conn.cursor()
        cursor.execute("SELECT * FROM feedback WHERE id = ? AND org_id = ?", (feedback_id, self.org_id))
        row = cursor.fetchone()
        return dict(row) if row else None

    # --- Analysis Results ---
    def add_analysis(self, analysis: Dict[str, Any]):
        cursor = self.conn.cursor()
        query = """
            INSERT OR REPLACE INTO analysis_results (
                feedback_id, org_id, sentiment, sentiment_score,
                aspects_json, issue_category, severity, entities_json, is_alert
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """
        cursor.execute(query, (
            analysis["feedback_id"], self.org_id, analysis["sentiment"],
            analysis["sentiment_score"], json.dumps(analysis.get("aspects_json", [])),
            analysis["issue_category"], analysis["severity"],
            json.dumps(analysis.get("entities_json", {})),
            1 if analysis.get("is_alert", False) else 0
        ))
        self.conn.commit()

    def get_analysis_by_feedback_id(self, feedback_id: str) -> Optional[Dict[str, Any]]:
        cursor = self.conn.cursor()
        cursor.execute("SELECT * FROM analysis_results WHERE feedback_id = ? AND org_id = ?", (feedback_id, self.org_id))
        row = cursor.fetchone()
        return dict(row) if row else None

    # --- Actions ---
    def create_action(self, act: Dict[str, Any]) -> str:
        cursor = self.conn.cursor()
        act_id = act.get("id") or f"act_{datetime.utcnow().strftime('%Y%m%d%H%M%S')}_{hashlib.sha256(act.get('issue_key', '').encode()).hexdigest()[:6]}"
        query = """
            INSERT INTO actions (
                id, org_id, issue_key, recommendation, owner_role,
                effort, priority_score, score_breakdown_json, status,
                due_date, published
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """
        cursor.execute(query, (
            act_id, self.org_id, act["issue_key"], act["recommendation"],
            act["owner_role"], act.get("effort", 3), act.get("priority_score", 5.0),
            json.dumps(act.get("score_breakdown_json", {})), act.get("status", "proposed"),
            act.get("due_date"), 1 if act.get("published", False) else 0
        ))
        self.conn.commit()
        return act_id

    def get_actions(self, status: Optional[str] = None) -> List[Dict[str, Any]]:
        cursor = self.conn.cursor()
        sql = "SELECT * FROM actions WHERE org_id = ?"
        params: List[Any] = [self.org_id]
        if status:
            sql += " AND status = ?"
            params.append(status)
        sql += " ORDER BY priority_score DESC"
        cursor.execute(sql, tuple(params))
        return [dict(r) for r in cursor.fetchall()]

    def get_action_by_id(self, action_id: str) -> Optional[Dict[str, Any]]:
        cursor = self.conn.cursor()
        cursor.execute("SELECT * FROM actions WHERE id = ? AND org_id = ?", (action_id, self.org_id))
        row = cursor.fetchone()
        return dict(row) if row else None

    def update_action_status(self, action_id: str, status: str, approved_by: Optional[str] = None, note: Optional[str] = None):
        cursor = self.conn.cursor()
        cursor.execute("""
            UPDATE actions
            SET status = ?, approved_by = coalesce(?, approved_by), completion_note = coalesce(?, completion_note)
            WHERE id = ? AND org_id = ?
        """, (status, approved_by, note, action_id, self.org_id))
        self.conn.commit()

    # --- Alerts ---
    def create_alert(self, feedback_id: str, reason: str) -> str:
        cursor = self.conn.cursor()
        alert_id = f"alt_{datetime.utcnow().strftime('%Y%m%d%H%M%S')}_{hashlib.sha256(reason.encode()).hexdigest()[:6]}"
        cursor.execute("""
            INSERT INTO alerts (id, org_id, feedback_id, reason, status)
            VALUES (?, ?, ?, ?, 'open')
        """, (alert_id, self.org_id, feedback_id, reason))
        self.conn.commit()
        return alert_id

    def get_alerts(self, status: Optional[str] = None) -> List[Dict[str, Any]]:
        cursor = self.conn.cursor()
        sql = "SELECT * FROM alerts WHERE org_id = ?"
        params: List[Any] = [self.org_id]
        if status:
            sql += " AND status = ?"
            params.append(status)
        cursor.execute(sql, tuple(params))
        return [dict(r) for r in cursor.fetchall()]

    def ack_alert(self, alert_id: str):
        cursor = self.conn.cursor()
        cursor.execute("UPDATE alerts SET status = 'acknowledged' WHERE id = ? AND org_id = ?", (alert_id, self.org_id))
        self.conn.commit()

    # --- Audit & LLM Usage ---
    def log_audit(self, user_id: Optional[str], event: str, payload: Dict[str, Any]):
        cursor = self.conn.cursor()
        cursor.execute("""
            INSERT INTO audit_log (id, org_id, user_id, event, payload_json)
            VALUES (?, ?, ?, ?, ?)
        """, (f"aud_{datetime.utcnow().strftime('%Y%m%d%H%M%S%f')}", self.org_id, user_id, event, json.dumps(payload)))
        self.conn.commit()

    def log_llm_usage(self, agent: str, model: str, tokens: int, est_cost: float, latency: float):
        cursor = self.conn.cursor()
        cursor.execute("""
            INSERT INTO llm_usage (id, org_id, agent, model, tokens, est_cost, latency)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (f"llm_{datetime.utcnow().strftime('%Y%m%d%H%M%S%f')}", self.org_id, agent, model, tokens, est_cost, latency))
        self.conn.commit()

    # --- Complaints Data for Stats Tools ---
    def get_complaints_data(self, as_of: Optional[str] = None) -> List[Dict[str, Any]]:
        """Joins feedback and analysis_results to return negative issues up to as_of timestamp."""
        cursor = self.conn.cursor()
        sql = """
            SELECT f.id as feedback_id, f.timestamp, f.item, f.meal_type, f.location_id, f.rating,
                   coalesce(ar.issue_category, json_extract(f.raw_json, '$.issue_category'), 'other') as category,
                   coalesce(ar.severity, 3) as severity
            FROM feedback f
            LEFT JOIN analysis_results ar ON f.id = ar.feedback_id
            WHERE f.org_id = ?
        """
        params: List[Any] = [self.org_id]
        if as_of:
            sql += " AND f.timestamp <= ?"
            params.append(as_of)
        cursor.execute(sql, tuple(params))
        return [dict(r) for r in cursor.fetchall()]
