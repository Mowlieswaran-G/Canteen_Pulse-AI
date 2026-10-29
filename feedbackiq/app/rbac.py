"""
Dynamic RBAC (Role-Based Access Control) for FeedbackIQ.
Principle: Roles/permissions are DB rows. Code calls can(user_id, permission, org_id, location_id).
Never checks role names.
"""
import sqlite3
from typing import List, Optional, Set
from .db import get_connection

ALL_PERMISSIONS = [
    "feedback.submit",
    "dashboard.view",
    "forecast.view",
    "action.approve",
    "task.view",
    "task.complete",
    "report.view",
    "report.export",
    "users.manage",
    "roles.manage",
    "settings.edit",
    "alerts.receive",
    "audit.view"
]

def get_user_permissions(user_id: str, org_id: str, location_id: Optional[str] = None, conn: Optional[sqlite3.Connection] = None) -> Set[str]:
    """Retrieves flattened set of permission keys for user in active org."""
    close_conn = False
    if conn is None:
        conn = get_connection()
        close_conn = True

    try:
        cursor = conn.cursor()
        # Find memberships in active org
        query = """
            SELECT p.key, m.location_id
            FROM memberships m
            JOIN role_permissions rp ON m.role_id = rp.role_id
            JOIN permissions p ON rp.permission_id = p.id
            WHERE m.user_id = ? AND m.org_id = ?
        """
        cursor.execute(query, (user_id, org_id))
        rows = cursor.fetchall()
        
        perms = set()
        for row in rows:
            perm_key = row[0]
            mem_loc = row[1]
            # Org-wide membership (location_id is None) grants permission everywhere;
            # or location-specific membership matches the requested location_id
            if mem_loc is None or location_id is None or mem_loc == location_id:
                perms.add(perm_key)
        return perms
    finally:
        if close_conn:
            conn.close()

def can(user_id: str, permission: str, org_id: str, location_id: Optional[str] = None, conn: Optional[sqlite3.Connection] = None) -> bool:
    """Returns True if user has the requested permission in the active org context."""
    user_perms = get_user_permissions(user_id, org_id, location_id, conn)
    return permission in user_perms
