"""
Database models and schema definitions for FeedbackIQ.
PostgreSQL and SQLite compatible.
Enforces multi-tenancy: ALL tables except users and permissions carry org_id (indexed).
"""
import sqlite3
from typing import Dict, Any, List, Optional

# Standard SQL DDL Statements
SQL_SCHEMA_DDL = """
-- 1. Organizations
CREATE TABLE IF NOT EXISTS organizations (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    settings_json TEXT NOT NULL DEFAULT '{}',
    plan TEXT NOT NULL DEFAULT 'standard',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Locations
CREATE TABLE IF NOT EXISTS locations (
    id TEXT PRIMARY KEY,
    org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_locations_org ON locations(org_id);

-- 3. Users (Global)
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Permissions (Global)
CREATE TABLE IF NOT EXISTS permissions (
    id TEXT PRIMARY KEY,
    key TEXT UNIQUE NOT NULL,
    description TEXT
);

-- 5. Roles (Org-scoped)
CREATE TABLE IF NOT EXISTS roles (
    id TEXT PRIMARY KEY,
    org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    is_default BOOLEAN DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_roles_org ON roles(org_id);

-- 6. Role Permissions (Cross-ref)
CREATE TABLE IF NOT EXISTS role_permissions (
    role_id TEXT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id TEXT NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

-- 7. Memberships (User in Org with Role and optional location)
CREATE TABLE IF NOT EXISTS memberships (
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    location_id TEXT REFERENCES locations(id) ON DELETE SET NULL,
    role_id TEXT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, org_id, role_id)
);
CREATE INDEX IF NOT EXISTS idx_memberships_org ON memberships(org_id);

-- 8. Feedback (The Core Data Table)
CREATE TABLE IF NOT EXISTS feedback (
    id TEXT PRIMARY KEY,
    org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    location_id TEXT REFERENCES locations(id),
    timestamp TIMESTAMP NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    text TEXT NOT NULL,
    text_clean TEXT NOT NULL,
    channel TEXT NOT NULL DEFAULT 'qr_form',
    meal_type TEXT NOT NULL,
    item TEXT NOT NULL,
    anonymous BOOLEAN DEFAULT 1,
    language TEXT DEFAULT 'en',
    content_hash TEXT NOT NULL,
    raw_json TEXT DEFAULT '{}'
);
CREATE INDEX IF NOT EXISTS idx_feedback_org_time ON feedback(org_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_feedback_org_item_meal ON feedback(org_id, item, meal_type);
CREATE INDEX IF NOT EXISTS idx_feedback_org_hash ON feedback(org_id, content_hash);

-- 9. Analysis Results
CREATE TABLE IF NOT EXISTS analysis_results (
    feedback_id TEXT PRIMARY KEY REFERENCES feedback(id) ON DELETE CASCADE,
    org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    sentiment TEXT NOT NULL,
    sentiment_score REAL NOT NULL,
    aspects_json TEXT NOT NULL DEFAULT '[]',
    issue_category TEXT NOT NULL,
    severity INTEGER NOT NULL CHECK (severity >= 1 AND severity <= 5),
    entities_json TEXT NOT NULL DEFAULT '{}',
    is_alert BOOLEAN DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_analysis_org ON analysis_results(org_id);

-- 10. Topics
CREATE TABLE IF NOT EXISTS topics (
    id TEXT PRIMARY KEY,
    org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    week INTEGER NOT NULL,
    name TEXT NOT NULL,
    summary TEXT NOT NULL,
    comment_count INTEGER NOT NULL,
    trend TEXT NOT NULL,
    example_ids_json TEXT NOT NULL DEFAULT '[]'
);
CREATE INDEX IF NOT EXISTS idx_topics_org ON topics(org_id);

-- 11. Predictions
CREATE TABLE IF NOT EXISTS predictions (
    id TEXT PRIMARY KEY,
    org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    week INTEGER NOT NULL,
    issue_key TEXT NOT NULL,
    item TEXT NOT NULL,
    meal_type TEXT NOT NULL,
    risk_level TEXT NOT NULL CHECK (risk_level IN ('High', 'Medium', 'Low')),
    evidence_json TEXT NOT NULL DEFAULT '{}',
    rationale TEXT NOT NULL,
    likely_day TEXT
);
CREATE INDEX IF NOT EXISTS idx_predictions_org ON predictions(org_id);

-- 12. Actions
CREATE TABLE IF NOT EXISTS actions (
    id TEXT PRIMARY KEY,
    org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    issue_key TEXT NOT NULL,
    recommendation TEXT NOT NULL,
    owner_role TEXT NOT NULL,
    effort INTEGER NOT NULL CHECK (effort >= 1 AND effort <= 5),
    priority_score REAL NOT NULL,
    score_breakdown_json TEXT NOT NULL DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'proposed',
    approved_by TEXT,
    due_date TEXT,
    completed_at TIMESTAMP,
    completion_note TEXT,
    fixed_on TIMESTAMP,
    published BOOLEAN DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_actions_org ON actions(org_id);

-- 13. Verification Results
CREATE TABLE IF NOT EXISTS verification_results (
    id TEXT PRIMARY KEY,
    org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    action_id TEXT NOT NULL REFERENCES actions(id) ON DELETE CASCADE,
    before_count INTEGER NOT NULL,
    after_count INTEGER NOT NULL,
    change_pct REAL NOT NULL,
    verdict TEXT NOT NULL,
    confidence TEXT NOT NULL,
    caveats TEXT,
    summary TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_verification_org ON verification_results(org_id);

-- 14. Alerts
CREATE TABLE IF NOT EXISTS alerts (
    id TEXT PRIMARY KEY,
    org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    feedback_id TEXT REFERENCES feedback(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'acknowledged', 'resolved'))
);
CREATE INDEX IF NOT EXISTS idx_alerts_org ON alerts(org_id);

-- 15. Reports
CREATE TABLE IF NOT EXISTS reports (
    id TEXT PRIMARY KEY,
    org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    week INTEGER NOT NULL,
    content_md TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_reports_org ON reports(org_id);

-- 16. Escalations
CREATE TABLE IF NOT EXISTS escalations (
    id TEXT PRIMARY KEY,
    org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    reason TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_escalations_org ON escalations(org_id);

-- 17. LLM Usage
CREATE TABLE IF NOT EXISTS llm_usage (
    id TEXT PRIMARY KEY,
    org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    agent TEXT NOT NULL,
    model TEXT NOT NULL,
    tokens INTEGER NOT NULL,
    est_cost REAL NOT NULL,
    latency REAL NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_llm_usage_org ON llm_usage(org_id);

-- 18. Audit Log
CREATE TABLE IF NOT EXISTS audit_log (
    id TEXT PRIMARY KEY,
    org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    event TEXT NOT NULL,
    payload_json TEXT NOT NULL DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_audit_log_org ON audit_log(org_id);
"""

# Tables list for tenant verification
ALL_TABLES = [
    "organizations",
    "locations",
    "users",
    "permissions",
    "roles",
    "role_permissions",
    "memberships",
    "feedback",
    "analysis_results",
    "topics",
    "predictions",
    "actions",
    "verification_results",
    "alerts",
    "reports",
    "escalations",
    "llm_usage",
    "audit_log"
]

GLOBAL_TABLES = ["organizations", "users", "permissions", "role_permissions"]
TENANT_SCOPED_TABLES = [t for t in ALL_TABLES if t not in GLOBAL_TABLES]

def init_db(db_path: str = ":memory:") -> sqlite3.Connection:
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    conn.executescript(SQL_SCHEMA_DDL)
    conn.commit()
    return conn
