from decimal import Decimal
from app.calculation.rounding import round_paise
from app.schemas import PolicyProfile

class ProportionateAdjustmentResult:
    def __init__(
        self,
        original_other_charges_paise: int,
        adjusted_other_charges_paise: int,
        deduction_paise: int,
        ratio_applied: Decimal,
        is_deducted: bool,
        explanation: str
    ):
        self.original_other_charges_paise = original_other_charges_paise
        self.adjusted_other_charges_paise = adjusted_other_charges_paise
        self.deduction_paise = deduction_paise
        self.ratio_applied = ratio_applied
        self.is_deducted = is_deducted
        self.explanation = explanation

def apply_proportionate_deduction(
    other_charges_paise: int,
    eligibility_ratio: Decimal,
    policy: PolicyProfile
) -> ProportionateAdjustmentResult:
    if not policy.proportionate_deduction_applicable:
        return ProportionateAdjustmentResult(
            original_other_charges_paise=other_charges_paise,
            adjusted_other_charges_paise=other_charges_paise,
            deduction_paise=0,
            ratio_applied=Decimal("1.0"),
            is_deducted=False,
            explanation="Policy does not apply proportionate deductions to associated medical charges. 100% of eligible other charges considered."
        )
        
    if eligibility_ratio >= Decimal("1.0"):
        return ProportionateAdjustmentResult(
            original_other_charges_paise=other_charges_paise,
            adjusted_other_charges_paise=other_charges_paise,
            deduction_paise=0,
            ratio_applied=Decimal("1.0"),
            is_deducted=False,
            explanation="Room rate is within policy limit (ratio = 1.0), so no proportionate deduction is applied to associated charges."
        )
        
    # Proportionate adjustment
    adjusted = round_paise(Decimal(other_charges_paise) * eligibility_ratio)
    deduction = other_charges_paise - adjusted
    
    return ProportionateAdjustmentResult(
        original_other_charges_paise=other_charges_paise,
        adjusted_other_charges_paise=adjusted,
        deduction_paise=deduction,
        ratio_applied=eligibility_ratio,
        is_deducted=True,
        explanation=(
            f"Room rate exceeded limit; proportionate deduction ratio of {float(eligibility_ratio):.4f} applied to "
            f"associated charges ₹{other_charges_paise/100:,.2f} -> eligible ₹{adjusted/100:,.2f} "
            f"(deduction of ₹{deduction/100:,.2f})."
        )
    )
