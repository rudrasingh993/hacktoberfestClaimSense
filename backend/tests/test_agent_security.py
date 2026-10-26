import pytest
from app.agent.guards import (
    enforce_gate1_tool_allowlist,
    enforce_gate2_argument_validation,
    check_workflow_order
)
from app.exceptions import SecurityGateError, ValidationError
from app.agent.app import agent

def test_gate1_blocks_unknown_tool():
    """Security Gate 1: Rejects any function name not in the static allowlist."""
    with pytest.raises(SecurityGateError) as exc_info:
        enforce_gate1_tool_allowlist("unapproved_transfer_funds")
    assert "Gate 1" in exc_info.value.details.get("gate", "")
    assert "Access denied" in exc_info.value.message

def test_gate2_rejects_boolean_for_integer():
    """Security Gate 2: Strictly rejects boolean True/False passed in integer fields."""
    with pytest.raises(ValidationError):
        enforce_gate2_argument_validation(
            "calculate_claim_estimate",
            {
                "input_data": {
                    "room_rate_per_day_paise": True,  # Boolean attempt
                    "room_days": 3,
                    "other_charges_paise": 12000000
                },
                "policy": {}
            }
        )

def test_gate3_enforces_workflow_order():
    """Security Gate 3: Cannot jump straight to compare_room_categories before validate_estimate_inputs."""
    with pytest.raises(SecurityGateError) as exc_info:
        check_workflow_order("compare_room_categories", current_stage="validate_estimate_inputs")
    assert "Workflow violation" in exc_info.value.message

def test_agent_handles_adversarial_tool_gracefully():
    """Agent handles blocked tool call without raising unhandled backend crash."""
    res = agent.execute_tool_call(
        tool_name="malicious_eval_script",
        arguments={"code": "import os; os.system('calc')"}
    )
    assert res["status"] == "blocked"
    assert "Gate 1" in res["gate"]
