import uuid
from decimal import Decimal
from app.schemas import PolicyProfile, EstimateInput, EstimateResult, CalculationStep
from app.exceptions import UnconfirmedInputError, ValidationError
from app.calculation.room_rent import evaluate_room_rent
from app.calculation.proportionate import apply_proportionate_deduction
from app.calculation.sublimits import apply_treatment_sublimit
from app.calculation.deductible import apply_deductible
from app.calculation.copay import apply_copay

def calculate_claim_estimate(
    input_data: EstimateInput,
    policy: PolicyProfile,
    estimate_id: str | None = None
) -> EstimateResult:
    """Authoritative deterministic claim estimation engine in Python."""
    if not input_data.inputs_confirmed:
        raise UnconfirmedInputError("Calculation engine strictly requires inputs_confirmed=True.")
        
    est_id = estimate_id or f"est_{uuid.uuid4().hex[:10]}"
    steps: list[CalculationStep] = []
    applied_rules: list[str] = []
    warnings: list[str] = []
    assumptions: list[str] = []
    
    # Step 1: Total bill computation
    room_subtotal = input_data.room_rate_per_day_paise * input_data.room_days
    total_bill = room_subtotal + input_data.other_charges_paise + input_data.excluded_charges_paise
    
    steps.append(CalculationStep(
        step_number=1,
        title="Hospital Bill Total & Decomposition",
        formula=f"Room ({input_data.room_days}d × ₹{input_data.room_rate_per_day_paise/100:,.0f} = ₹{room_subtotal/100:,.0f}) + Other (₹{input_data.other_charges_paise/100:,.0f}) + Excluded (₹{input_data.excluded_charges_paise/100:,.0f})",
        result_text=f"Total estimated hospital bill: ₹{total_bill/100:,.2f}",
        rule_reference="Hospital Pre-Admission Estimate Components",
        impact_paise=total_bill
    ))
    
    # Step 2: Room Rent Eligibility
    room_eval = evaluate_room_rent(input_data, policy)
    applied_rules.append(f"Room Limit Rule: {policy.room_limit_type}")
    
    steps.append(CalculationStep(
        step_number=2,
        title="Room Rent Eligibility & Ratio",
        formula=f"Policy Limit: ₹{(room_eval.room_limit_paise or 0)/100:,.0f}/day vs Selected: ₹{input_data.room_rate_per_day_paise/100:,.0f}/day",
        result_text=f"Eligibility Ratio: {float(room_eval.ratio):.4f} | Eligible room charges: ₹{room_eval.eligible_room_total_paise/100:,.2f}",
        rule_reference=f"Clause: Room Rent Restriction ({policy.room_limit_type})",
        impact_paise=room_eval.eligible_room_total_paise
    ))
    
    if room_eval.is_capped:
        warnings.append(f"Selected room (₹{input_data.room_rate_per_day_paise/100:,.0f}/day) exceeds policy limit of ₹{(room_eval.room_limit_paise or 0)/100:,.0f}/day.")
    
    # Step 3: Proportionate Deductions
    prop_eval = apply_proportionate_deduction(input_data.other_charges_paise, room_eval.ratio, policy)
    applied_rules.append(f"Proportionate Deduction: {'Applicable' if policy.proportionate_deduction_applicable else 'Not Applicable'}")
    
    steps.append(CalculationStep(
        step_number=3,
        title="Proportionate Deduction to Associated Charges",
        formula=f"₹{input_data.other_charges_paise/100:,.0f} × {float(prop_eval.ratio_applied):.4f}",
        result_text=f"Eligible associated charges: ₹{prop_eval.adjusted_other_charges_paise/100:,.2f} (Proportionate deduction: ₹{prop_eval.deduction_paise/100:,.2f})",
        rule_reference="Clause: Associated Medical Expenses Proportionate Adjustment",
        impact_paise=prop_eval.deduction_paise
    ))
    
    if prop_eval.is_deducted:
        assumptions.append("Proportionate deduction applied to associated doctor, nursing, and OT charges according to configured policy terms.")
    
    # Step 4: Eligible Amount before Caps
    eligible_base = room_eval.eligible_room_total_paise + prop_eval.adjusted_other_charges_paise
    
    steps.append(CalculationStep(
        step_number=4,
        title="Base Admissible Claim Amount",
        formula=f"Eligible Room (₹{room_eval.eligible_room_total_paise/100:,.0f}) + Adjusted Other (₹{prop_eval.adjusted_other_charges_paise/100:,.0f})",
        result_text=f"Total eligible amount before deductibles/copay: ₹{eligible_base/100:,.2f}",
        rule_reference="Aggregated Pre-Adjudication Base",
        impact_paise=eligible_base
    ))
    
    # Step 5: Treatment Sub-limit (if applicable)
    sublimit_eval = apply_treatment_sublimit(eligible_base, policy)
    current_eligible = sublimit_eval.capped_amount_paise
    if sublimit_eval.is_capped:
        applied_rules.append("Treatment Sub-limit Cap")
        steps.append(CalculationStep(
            step_number=5,
            title="Treatment Category Sub-limit Adjustment",
            formula=f"Base (₹{eligible_base/100:,.0f}) capped to sub-limit (₹{(policy.treatment_sub_limit_paise or 0)/100:,.0f})",
            result_text=f"Amount capped to ₹{current_eligible/100:,.2f} (Sub-limit deduction: ₹{sublimit_eval.sublimit_deduction_paise/100:,.2f})",
            rule_reference="Clause: Specific Illness / Procedure Sub-limit",
            impact_paise=sublimit_eval.sublimit_deduction_paise
        ))
        warnings.append(f"Treatment charges capped by procedural sub-limit of ₹{(policy.treatment_sub_limit_paise or 0)/100:,.0f}.")
    
    # Step 6: Deductible (if applicable)
    deductible_eval = apply_deductible(current_eligible, policy)
    current_eligible = deductible_eval.amount_after_deductible_paise
    if deductible_eval.is_applied:
        applied_rules.append("Policy Deductible")
        steps.append(CalculationStep(
            step_number=6,
            title="Deductible Application",
            formula=f"₹{deductible_eval.amount_before_deductible_paise/100:,.0f} - ₹{deductible_eval.deduction_paise/100:,.0f}",
            result_text=f"Eligible amount after deductible: ₹{current_eligible/100:,.2f}",
            rule_reference="Clause: Policy Threshold / Fixed Deductible",
            impact_paise=deductible_eval.deduction_paise
        ))
    
    # Step 7: Co-payment
    copay_eval = apply_copay(current_eligible, policy)
    applied_rules.append(f"Co-payment: {policy.copay_percentage or 0}%")
    insurer_est = copay_eval.insurer_amount_paise
    
    steps.append(CalculationStep(
        step_number=7,
        title="Co-payment Adjustment",
        formula=f"₹{current_eligible/100:,.0f} × (100% - {copay_eval.copay_percentage}%)",
        result_text=f"Co-pay share: ₹{copay_eval.copay_deduction_paise/100:,.2f} | Insurer initial share: ₹{insurer_est/100:,.2f}",
        rule_reference="Clause: Mandatory Patient Co-payment",
        impact_paise=copay_eval.copay_deduction_paise
    ))
    
    # Step 8: Coverage Cap (Remaining Sum Insured)
    coverage_limit = input_data.available_coverage_paise or policy.sum_insured_paise
    if coverage_limit and insurer_est > coverage_limit:
        coverage_deduction = insurer_est - coverage_limit
        insurer_est = coverage_limit
        applied_rules.append("Available Sum Insured Cap")
        warnings.append(f"Estimated insurer payment reached maximum available policy coverage of ₹{coverage_limit/100:,.2f}.")
        steps.append(CalculationStep(
            step_number=8,
            title="Available Coverage Cap",
            formula=f"Insurer share capped at available coverage limit: ₹{coverage_limit/100:,.0f}",
            result_text=f"Final insurer payment capped at: ₹{insurer_est/100:,.2f}",
            rule_reference="Policy Overall Sum Insured Exhaustion Cap",
            impact_paise=coverage_deduction
        ))
        
    family_payment = total_bill - insurer_est
    
    # Final step
    steps.append(CalculationStep(
        step_number=len(steps) + 1,
        title="Final Financial Allocation",
        formula=f"Total Bill (₹{total_bill/100:,.0f}) - Insurer Share (₹{insurer_est/100:,.0f})",
        result_text=f"Estimated Insurer Payment: ₹{insurer_est/100:,.2f} | Estimated Family Out-of-Pocket: ₹{family_payment/100:,.2f}",
        rule_reference="Summary Outcome",
        impact_paise=family_payment
    ))
    
    assumptions.append("All estimates are pre-admission projections based strictly on provided charges and selected policy rules.")
    assumptions.append("Consumables, pharmacy items, and specific non-payables are assumed to be covered unless listed under excluded charges.")
    
    return EstimateResult(
        estimate_id=est_id,
        currency="INR",
        total_bill_paise=total_bill,
        room_subtotal_paise=room_subtotal,
        other_charges_paise=input_data.other_charges_paise,
        excluded_charges_paise=input_data.excluded_charges_paise,
        room_limit_ratio=float(room_eval.ratio) if room_eval.is_capped else 1.0,
        eligible_room_charges_paise=room_eval.eligible_room_total_paise,
        adjusted_other_charges_paise=prop_eval.adjusted_other_charges_paise,
        amount_before_copay_paise=current_eligible,
        copay_deduction_paise=copay_eval.copay_deduction_paise,
        deductible_deduction_paise=deductible_eval.deduction_paise,
        sublimit_deduction_paise=sublimit_eval.sublimit_deduction_paise,
        insurer_payment_paise=insurer_est,
        family_payment_paise=family_payment,
        calculation_complete=True,
        warnings=warnings,
        assumptions=assumptions,
        applied_rules=applied_rules,
        calculation_steps=steps
    )
