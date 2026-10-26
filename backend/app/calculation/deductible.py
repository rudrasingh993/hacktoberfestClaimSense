from app.schemas import PolicyProfile

class DeductibleResult:
    def __init__(
        self,
        amount_before_deductible_paise: int,
        amount_after_deductible_paise: int,
        deduction_paise: int,
        is_applied: bool,
        explanation: str
    ):
        self.amount_before_deductible_paise = amount_before_deductible_paise
        self.amount_after_deductible_paise = amount_after_deductible_paise
        self.deduction_paise = deduction_paise
        self.is_applied = is_applied
        self.explanation = explanation

def apply_deductible(
    amount_paise: int,
    policy: PolicyProfile
) -> DeductibleResult:
    if policy.deductible_type == "none" or not policy.deductible_value or policy.deductible_value <= 0:
        return DeductibleResult(
            amount_before_deductible_paise=amount_paise,
            amount_after_deductible_paise=amount_paise,
            deduction_paise=0,
            is_applied=False,
            explanation="No policy deductible applicable."
        )
        
    deductible_val = policy.deductible_value
    applied_deduction = min(amount_paise, deductible_val)
    amount_after = amount_paise - applied_deduction
    
    return DeductibleResult(
        amount_before_deductible_paise=amount_paise,
        amount_after_deductible_paise=amount_after,
        deduction_paise=applied_deduction,
        is_applied=True,
        explanation=f"Fixed policy deductible of ₹{deductible_val/100:,.2f} applied: ₹{amount_paise/100:,.2f} - ₹{applied_deduction/100:,.2f} = ₹{amount_after/100:,.2f}."
    )
