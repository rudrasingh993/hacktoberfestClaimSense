import json
from pathlib import Path
from app.schemas import (
    EstimateInput, PolicyProfile, EstimateResult,
    ValidationResponse, RoomComparisonResponse, RoomScenarioResult
)
from app.calculation.engine import calculate_claim_estimate as py_calculate_claim_estimate
from app.config import settings

def validate_estimate_inputs(input_data: EstimateInput, policy: PolicyProfile) -> ValidationResponse:
    """Validates completeness and sanity of inputs before calculation."""
    missing: list[str] = []
    conflicts: list[str] = []
    unsupported: list[str] = []
    questions: list[str] = []
    
    if not input_data.policy_id:
        missing.append("policy_id")
        questions.append("Which health insurance policy or insurer profile applies to this claim?")
    if input_data.room_rate_per_day_paise <= 0:
        missing.append("room_rate_per_day_paise")
        questions.append("What is the daily room rent charge?")
    if input_data.room_days <= 0:
        missing.append("room_days")
        questions.append("How many days of hospital stay are anticipated?")
        
    if policy.room_limit_type == "unknown":
        unsupported.append("room_limit_type is unknown")
        questions.append("Please specify your policy's room rent limit type (e.g. Fixed per day or % of Sum Insured).")
        
    if policy.proportionate_deduction_applicable is None:
        unsupported.append("proportionate_deduction_applicable is unconfirmed")
        questions.append("Your policy shows a room rent limit, but proportionate deduction applicability to associated charges is unconfirmed. Does your policy state that other charges will be adjusted proportionately?")

    is_ready = len(missing) == 0 and len(conflicts) == 0 and len(unsupported) == 0 and input_data.inputs_confirmed
    
    return ValidationResponse(
        is_ready_for_calculation=is_ready,
        missing_fields=missing,
        conflicting_fields=conflicts,
        unsupported_rules=unsupported,
        questions=questions,
        requires_user_confirmation=not input_data.inputs_confirmed
    )

def calculate_claim_estimate(input_data: EstimateInput, policy: PolicyProfile) -> EstimateResult:
    """Invokes the authoritative deterministic Python calculation engine."""
    return py_calculate_claim_estimate(input_data, policy)

def compare_room_categories(
    base_input: EstimateInput,
    policy: PolicyProfile,
    custom_categories: list[dict] | None = None
) -> RoomComparisonResponse:
    """Compares the base hospital estimate across multiple room categories deterministically."""
    categories_to_test = custom_categories
    if not categories_to_test:
        room_cfg_path = settings.room_config_path
        if room_cfg_path.exists():
            with open(room_cfg_path, "r", encoding="utf-8") as f:
                categories_to_test = json.load(f).get("categories", [])
        else:
            categories_to_test = [
                {"id": "general_ward", "name": "General Ward", "default_daily_rate_paise": 250000},
                {"id": "semi_private", "name": "Twin Sharing (Semi-Private)", "default_daily_rate_paise": 450000},
                {"id": "private_single", "name": "Single Private Room", "default_daily_rate_paise": 800000},
                {"id": "deluxe_suite", "name": "Deluxe Suite", "default_daily_rate_paise": 1500000},
            ]

    # Calculate baseline selected room
    baseline_result = py_calculate_claim_estimate(base_input, policy)
    baseline_family_payment = baseline_result.family_payment_paise or 0

    scenarios: list[RoomScenarioResult] = []
    lowest_family_payment = float("inf")
    recommended_category = ""

    for cat in categories_to_test:
        cat_name = cat.get("name", "Unknown Room")
        rate = cat.get("default_daily_rate_paise", base_input.room_rate_per_day_paise)
        
        # Clone input with new room rate and category
        scenario_input = base_input.model_copy(update={
            "room_category": cat_name,
            "room_rate_per_day_paise": rate,
            "inputs_confirmed": True
        })
        
        scenario_calc = py_calculate_claim_estimate(scenario_input, policy)
        fam_pay = scenario_calc.family_payment_paise or 0
        diff = fam_pay - baseline_family_payment
        
        if fam_pay < lowest_family_payment:
            lowest_family_payment = fam_pay
            recommended_category = cat_name

        scenarios.append(RoomScenarioResult(
            room_category=cat_name,
            room_rate_per_day_paise=rate,
            room_days=scenario_input.room_days,
            room_subtotal_paise=scenario_calc.room_subtotal_paise,
            total_bill_paise=scenario_calc.total_bill_paise,
            room_ratio=scenario_calc.room_limit_ratio or 1.0,
            eligible_room_charges_paise=scenario_calc.eligible_room_charges_paise,
            adjusted_other_charges_paise=scenario_calc.adjusted_other_charges_paise,
            insurer_payment_paise=scenario_calc.insurer_payment_paise or 0,
            family_payment_paise=fam_pay,
            difference_from_selected_paise=diff,
            is_lowest_out_of_pocket=False,  # Updated after loop
            notes=cat.get("description", "")
        ))

    for s in scenarios:
        if s.room_category == recommended_category:
            s.is_lowest_out_of_pocket = True

    savings = max(0, baseline_family_payment - int(lowest_family_payment))

    return RoomComparisonResponse(
        scenarios=scenarios,
        recommended_category=recommended_category,
        savings_vs_selected_paise=savings,
        disclaimer="Estimates are calculated using identical medical charges and configured policy assumptions. Hospital room rates may vary by institution."
    )

TOOLS = {
    "validate_estimate_inputs": validate_estimate_inputs,
    "calculate_claim_estimate": calculate_claim_estimate,
    "compare_room_categories": compare_room_categories,
}
