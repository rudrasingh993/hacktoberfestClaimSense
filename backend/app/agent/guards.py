from typing import Any
from app.exceptions import SecurityGateError, ValidationError
from app.schemas import EstimateInput, PolicyProfile
from app.validation.input_guards import require_strict_int

APPROVED_TOOLS = {
    "validate_estimate_inputs",
    "calculate_claim_estimate",
    "compare_room_categories"
}

WORKFLOW_ORDER = (
    "validate_estimate_inputs",
    "calculate_claim_estimate",
    "compare_room_categories"
)

def enforce_gate1_tool_allowlist(tool_name: str) -> str:
    """Security Gate 1: Rejects any tool not in the static tool allowlist."""
    if not isinstance(tool_name, str) or tool_name not in APPROVED_TOOLS:
        raise SecurityGateError(
            gate="Gate 1 (Tool Allowlist)",
            message=f"Access denied: Tool '{tool_name}' is not in the approved static tool registry.",
            details={"requested_tool": tool_name, "approved_tools": sorted(list(APPROVED_TOOLS))}
        )
    return tool_name

def enforce_gate2_argument_validation(tool_name: str, arguments: dict[str, Any]) -> dict[str, Any]:
    """Security Gate 2: Strictly validates argument names, types, and ranges."""
    if not isinstance(arguments, dict):
        raise SecurityGateError(
            gate="Gate 2 (Argument Validation)",
            message="Tool arguments must be provided as a structured JSON object/dictionary.",
            details={"received_type": type(arguments).__name__}
        )
        
    if tool_name == "validate_estimate_inputs":
        if "input_data" not in arguments:
            raise SecurityGateError(
                gate="Gate 2 (Argument Validation)",
                message="Missing required argument 'input_data' for validate_estimate_inputs.",
                details={"missing_arg": "input_data"}
            )
            
    elif tool_name == "calculate_claim_estimate":
        if "input_data" not in arguments:
            raise SecurityGateError(
                gate="Gate 2 (Argument Validation)",
                message="Missing required argument 'input_data' for calculate_claim_estimate.",
                details={"missing_arg": "input_data"}
            )
        if "policy" not in arguments:
            raise SecurityGateError(
                gate="Gate 2 (Argument Validation)",
                message="Missing required argument 'policy' for calculate_claim_estimate.",
                details={"missing_arg": "policy"}
            )
            
        # Inspect input_data types
        inp = arguments["input_data"]
        if isinstance(inp, dict):
            # Strict type guard: reject boolean for room_rate_per_day_paise
            if "room_rate_per_day_paise" in inp:
                require_strict_int("room_rate_per_day_paise", inp["room_rate_per_day_paise"], min_val=0)
            if "room_days" in inp:
                require_strict_int("room_days", inp["room_days"], min_val=1, max_val=365)
            if "other_charges_paise" in inp:
                require_strict_int("other_charges_paise", inp["other_charges_paise"], min_val=0)

    elif tool_name == "compare_room_categories":
        if "base_input" not in arguments or "policy" not in arguments:
            raise SecurityGateError(
                gate="Gate 2 (Argument Validation)",
                message="compare_room_categories requires 'base_input' and 'policy'.",
                details={"received_keys": list(arguments.keys())}
            )
            
    return arguments

def check_workflow_order(tool_name: str, current_stage: str) -> None:
    """Security Gate 3 constraint: Enforces sequential workflow progression."""
    stage_indices = {step: idx for idx, step in enumerate(WORKFLOW_ORDER)}
    curr_idx = stage_indices.get(current_stage, 0)
    req_idx = stage_indices.get(tool_name, 0)
    
    if req_idx > curr_idx + 1:
        raise SecurityGateError(
            gate="Gate 3 (Workflow Order Lock)",
            message=f"Workflow violation: Cannot execute '{tool_name}' before completing prior step '{WORKFLOW_ORDER[curr_idx]}'.",
            details={"current_stage": current_stage, "attempted_step": tool_name}
        )
