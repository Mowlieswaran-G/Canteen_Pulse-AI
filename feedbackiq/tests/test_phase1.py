"""
Phase 1 Foundation Test Suite for FeedbackIQ.
Validates:
1. All 4 organization templates validate via TemplateConfig.
2. org_id is present on all non-global database tables.
3. Synthetic generator is 100% deterministic per seed.
4. Each pattern's measured rate is in its defined band (P1 55-70%, P2 ~50%).
5. P6 drops after week 10 (pre-fix ~50% drops to ~8%).
6. P5 yields exactly the configured hygiene comments in week 12 (3 alerts).
7. Code-mixed Hinglish/Tanglish share is between 15% and 25%.
"""
import unittest
import json
import os
import sys
from pathlib import Path

# Add project root to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.schemas import TemplateConfig
from app.models import SQL_SCHEMA_DDL, init_db, ALL_TABLES, GLOBAL_TABLES, TENANT_SCOPED_TABLES
from data.generate_synthetic import generate_dataset

class TestPhase1Foundation(unittest.TestCase):

    def setUp(self):
        self.templates_dir = Path(__file__).resolve().parent.parent / "app" / "templates"

    def test_01_templates_validate(self):
        """All 4 template JSONs must validate cleanly against TemplateConfig."""
        templates = ["college_mess.json", "restaurant_chain.json", "corporate_cafeteria.json", "hospital.json"]
        for tpl_file in templates:
            path = self.templates_dir / tpl_file
            self.assertTrue(path.exists(), f"Template {tpl_file} not found")
            config = TemplateConfig.load_from_file(str(path))
            self.assertIsNotNone(config.org_type)
            self.assertTrue(len(config.categories) > 0)
            self.assertTrue(len(config.roles) > 0)
            self.assertIn(config.approver_role, [r.name for r in config.roles])
            self.assertIn(config.executor_role, [r.name for r in config.roles])

    def test_02_org_id_on_all_tenant_tables(self):
        """Verify that every non-global table in the database schema has an org_id column."""
        conn = init_db(":memory:")
        cursor = conn.cursor()

        for table in TENANT_SCOPED_TABLES:
            cursor.execute(f"PRAGMA table_info({table});")
            columns = [row["name"] for row in cursor.fetchall()]
            self.assertIn(
                "org_id",
                columns,
                f"Multi-tenancy violation: Table '{table}' does NOT have an 'org_id' column!"
            )
        conn.close()

    def test_03_synthetic_generator_deterministic(self):
        """Running the generator twice with the same seed must produce identical output."""
        records_1, gt_1 = generate_dataset("college_mess", weeks=4, seed=42, out_dir="data/out/test_1")
        records_2, gt_2 = generate_dataset("college_mess", weeks=4, seed=42, out_dir="data/out/test_2")

        self.assertEqual(len(records_1), len(records_2))
        self.assertEqual(gt_1["stats"], gt_2["stats"])
        self.assertEqual(records_1[0]["comment"], records_2[0]["comment"])
        self.assertEqual(records_1[-1]["feedback_id"], records_2[-1]["feedback_id"])

    def test_04_pattern_rates_within_bands(self):
        """Verify injected patterns P1 and P2 stay within expected rate bands."""
        records, gt = generate_dataset("college_mess", weeks=16, seed=42, out_dir="data/out/test_run")
        stats = gt["stats"]

        # P1: 55-70% complaint rate
        self.assertGreaterEqual(stats["P1_measured_rate"], 55.0, "P1 Fish curry rate too low")
        self.assertLessEqual(stats["P1_measured_rate"], 72.0, "P1 Fish curry rate too high")

        # P2: ~50% complaint rate (40-60%)
        self.assertGreaterEqual(stats["P2_measured_rate"], 40.0, "P2 Dosa rate too low")
        self.assertLessEqual(stats["P2_measured_rate"], 60.0, "P2 Dosa rate too high")

    def test_05_p6_drops_after_week_10(self):
        """P6 Paneer Salt must drop significantly from ~50% in weeks 1-9 to ~8% in weeks 10+."""
        records, gt = generate_dataset("college_mess", weeks=16, seed=42, out_dir="data/out/test_run")
        stats = gt["stats"]

        pre_rate = stats["P6_pre_fix_rate"]
        post_rate = stats["P6_post_fix_rate"]

        self.assertGreaterEqual(pre_rate, 40.0, "P6 Pre-fix rate should be around 50%")
        self.assertLessEqual(post_rate, 15.0, "P6 Post-fix rate should drop to ~8%")
        self.assertGreater(pre_rate - post_rate, 30.0, "P6 must demonstrate a clear drop after week 10 fix")

    def test_06_p5_exact_hygiene_comments(self):
        """P5 in week 12 must yield exactly 3 critical hygiene alerts."""
        records, gt = generate_dataset("college_mess", weeks=16, seed=42, out_dir="data/out/test_run")
        stats = gt["stats"]
        self.assertEqual(stats["P5_hygiene_alert_count"], 3, "P5 must generate exactly 3 hygiene comments")

    def test_07_code_mixed_share(self):
        """Code-mixed comments (Hinglish/Tanglish) must be between 15% and 25%."""
        records, gt = generate_dataset("college_mess", weeks=16, seed=42, out_dir="data/out/test_run")
        cm_share = gt["stats"]["code_mixed_percentage"]
        self.assertGreaterEqual(cm_share, 15.0, "Code mixed percentage too low")
        self.assertLessEqual(cm_share, 25.0, "Code mixed percentage too high")

if __name__ == "__main__":
    unittest.main()
