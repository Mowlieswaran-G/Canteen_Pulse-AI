#!/usr/bin/env python3
"""
Seed script for FeedbackIQ.
Seeds:
1. "ABC College" (template: college_mess)
2. "Spice Chain Restaurants" (template: restaurant_chain)
Pre-loads synthetic feedback and runs the multi-agent pipeline up to the approval pause.
Prints demo users and credentials.
"""
import sys
import json
from pathlib import Path

# Add project root to path
sys.path.insert(0, str(Path(__file__).resolve().parent))

from app.db import setup_database, get_connection
from app.auth import hash_password
from app.schemas import TemplateConfig
from app.repository import OrgRepository
from app.graph.workflow import PipelineWorkflow
from data.generate_synthetic import generate_dataset

def seed_database():
    print("Setting up database tables...")
    setup_database()
    conn = get_connection()
    cursor = conn.cursor()

    # Load templates
    templates_dir = Path(__file__).resolve().parent / "app" / "templates"
    college_tpl = TemplateConfig.load_from_file(str(templates_dir / "college_mess.json"))
    restaurant_tpl = TemplateConfig.load_from_file(str(templates_dir / "restaurant_chain.json"))

    # Seed Permissions
    from app.rbac import ALL_PERMISSIONS
    for perm_key in ALL_PERMISSIONS:
        cursor.execute("INSERT OR IGNORE INTO permissions (id, key, description) VALUES (?, ?, ?)",
                       (f"perm_{perm_key}", perm_key, f"Permission for {perm_key}"))

    orgs_to_seed = [
        {"id": "org_abc_college", "name": "ABC College - Central Mess", "type": "college_mess", "tpl": college_tpl, "slug": "abc-college"},
        {"id": "org_spice_chain", "name": "Spice Chain Restaurants", "type": "restaurant_chain", "tpl": restaurant_tpl, "slug": "spice-chain"}
    ]

    demo_creds = []

    for org_data in orgs_to_seed:
        org_id = org_data["id"]
        tpl = org_data["tpl"]
        
        # 1. Insert Org
        cursor.execute("""
            INSERT OR REPLACE INTO organizations (id, name, type, settings_json, plan)
            VALUES (?, ?, ?, ?, 'enterprise')
        """, (org_id, org_data["name"], org_data["type"], json.dumps({
            "categories": tpl.categories,
            "weights": tpl.weights,
            "alert_keywords": tpl.alert_keywords,
            "health_risk_categories": tpl.health_risk_categories,
            "escalation_days": tpl.escalation_days
        })))

        # 2. Insert Locations
        loc_id = f"loc_{org_id}_main"
        cursor.execute("INSERT OR REPLACE INTO locations (id, org_id, name) VALUES (?, ?, ?)",
                       (loc_id, org_id, "Central Facility"))

        # 3. Seed Roles & Role Permissions from Template
        role_map = {}
        for r in tpl.roles:
            role_id = f"role_{org_id}_{r.name.lower().replace(' ', '_')}"
            cursor.execute("INSERT OR REPLACE INTO roles (id, org_id, name, is_default) VALUES (?, ?, ?, 1)",
                           (role_id, org_id, r.name))
            role_map[r.name] = role_id
            
            for p_key in r.permissions:
                cursor.execute("INSERT OR IGNORE INTO role_permissions (role_id, permission_id) VALUES (?, ?)",
                               (role_id, f"perm_{p_key}"))

        # 4. Create one User per role
        pwd_hash = hash_password("DemoPassword123!")
        for r_name, role_id in role_map.items():
            user_id = f"usr_{org_id}_{r_name.lower().replace(' ', '_')}"
            email = f"{r_name.lower().replace(' ', '_')}@{org_data['slug']}.org"
            cursor.execute("INSERT OR REPLACE INTO users (id, name, email, password_hash) VALUES (?, ?, ?, ?)",
                           (user_id, f"{r_name} User", email, pwd_hash))
            
            # Create membership
            cursor.execute("INSERT OR REPLACE INTO memberships (user_id, org_id, location_id, role_id) VALUES (?, ?, ?, ?)",
                           (user_id, org_id, loc_id, role_id))
            
            demo_creds.append({
                "org": org_data["name"],
                "role": r_name,
                "email": email,
                "password": "DemoPassword123!"
            })

    conn.commit()

    # 5. Generate Synthetic Data and run pipeline for ABC College
    print("\nGenerating synthetic records for ABC College...")
    records, gt = generate_dataset("college_mess", weeks=16, seed=42, out_dir="data/out")
    
    repo = OrgRepository("org_abc_college", conn)
    print(f"Loading {len(records)} feedback records into ABC College repository...")
    
    batch_rows = []
    for r in records:
        raw_info = {"issue_category": r["issue_category"]}
        batch_rows.append((
            r["feedback_id"], "org_abc_college", "loc_org_abc_college_main",
            r["date"], int(r["rating"]), r["comment"], r["comment"],
            r["channel"], r["meal_type"], r["item"], 1, "en",
            r["feedback_id"], json.dumps(raw_info)
        ))
    cursor.executemany("""
        INSERT OR REPLACE INTO feedback (
            id, org_id, location_id, timestamp, rating, text,
            text_clean, channel, meal_type, item, anonymous,
            language, content_hash, raw_json
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, batch_rows)
    conn.commit()

    print("Pre-running multi-agent pipeline for ABC College up to approval pause...")
    workflow = PipelineWorkflow(repo, {
        "alert_keywords": college_tpl.alert_keywords,
        "health_risk_categories": college_tpl.health_risk_categories
    })
    res = workflow.run_pipeline()
    print(f"Pipeline Result: {res['status']} | Actions generated: {res['actions_count']} | Alerts: {res['alerts_count']}")

    conn.close()

    # Print Demo Access Information
    print("\n==================================================================")
    print("                    FEEDBACKIQ DEMO USERS SEEDED                  ")
    print("==================================================================")
    for cred in demo_creds:
        print(f"[{cred['org']}] {cred['role']:<15} -> Email: {cred['email']:<30} Pwd: {cred['password']}")
    print("==================================================================\n")

if __name__ == "__main__":
    seed_database()
