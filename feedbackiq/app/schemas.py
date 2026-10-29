"""
Schemas and validation models for FeedbackIQ.
Compatible with Python 3.10+ standard library and Pydantic.
"""
from dataclasses import dataclass, field
from typing import List, Dict, Any, Optional
import json

@dataclass
class RoleConfig:
    name: str
    permissions: List[str]

@dataclass
class TemplateConfig:
    org_type: str
    display_name: str
    categories: List[str]
    entities: Dict[str, bool]
    meal_types: List[str]
    weights: Dict[str, float]
    health_risk_categories: List[str]
    alert_keywords: Dict[str, List[str]]
    roles: List[RoleConfig]
    approver_role: str
    executor_role: str
    feedback_giver_role: str
    languages: List[str]
    escalation_days: int

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "TemplateConfig":
        # Required fields validation
        required_fields = [
            "org_type", "display_name", "categories", "entities",
            "meal_types", "weights", "health_risk_categories",
            "alert_keywords", "roles", "approver_role",
            "executor_role", "feedback_giver_role", "languages",
            "escalation_days"
        ]
        for f in required_fields:
            if f not in data:
                raise ValueError(f"Missing required template field: '{f}'")

        if not isinstance(data["categories"], list) or len(data["categories"]) == 0:
            raise ValueError("Categories must be a non-empty list")

        if not isinstance(data["roles"], list) or len(data["roles"]) == 0:
            raise ValueError("Roles must be a non-empty list")

        roles_list = []
        for r in data["roles"]:
            if "name" not in r or "permissions" not in r:
                raise ValueError("Each role must contain 'name' and 'permissions'")
            roles_list.append(RoleConfig(name=r["name"], permissions=r["permissions"]))

        # Validate approver and executor exist in roles
        role_names = [r.name for r in roles_list]
        if data["approver_role"] not in role_names:
            raise ValueError(f"approver_role '{data['approver_role']}' not found in defined roles")
        if data["executor_role"] not in role_names:
            raise ValueError(f"executor_role '{data['executor_role']}' not found in defined roles")

        return cls(
            org_type=data["org_type"],
            display_name=data["display_name"],
            categories=data["categories"],
            entities=data["entities"],
            meal_types=data["meal_types"],
            weights=data["weights"],
            health_risk_categories=data["health_risk_categories"],
            alert_keywords=data["alert_keywords"],
            roles=roles_list,
            approver_role=data["approver_role"],
            executor_role=data["executor_role"],
            feedback_giver_role=data["feedback_giver_role"],
            languages=data["languages"],
            escalation_days=int(data["escalation_days"]),
        )

    @classmethod
    def load_from_file(cls, filepath: str) -> "TemplateConfig":
        with open(filepath, "r", encoding="utf-8") as f:
            data = json.load(f)
        return cls.from_dict(data)
