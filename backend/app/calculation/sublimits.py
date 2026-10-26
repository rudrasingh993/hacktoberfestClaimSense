from app.schemas import PolicyProfile

class SublimitResult:
    def __init__(
        self,
        amount_before_sublimit_paise: int,
        capped_amount_paise: int,
        sublimit_deduction_paise: int,
        is_capped: bool,
        explanation: str
    ):
        self.amount_before_sublimit_paise = amount_before_sublimit_paise
        self.capped_amount_paise = capped_amount_paise
        self.sublimit_deduction_paise = sublimit_deduction_paise
        self.is_capped = is_capped
        self.explanation = explanation

def apply_treatment_sublimit(
    amount_paise: int,
    policy: PolicyProfile
) -> SublimitResult:
    sublimit = policy.treatment_sub_limit_paise
    if sublimit is None or sublimit <= 0:
        return SublimitResult(
            amount_before_sublimit_paise=amount_paise,
            capped_amount_paise=amount_paise,
            sublimit_deduction_paise=0,
            is_capped=False,
            explanation="No treatment-specific sub-limit configured for this procedure."
        )
        
    if amount_paise > sublimit:
        excess = amount_paise - sublimit
        return SublimitResult(
            amount_before_sublimit_paise=amount_paise,
            capped_amount_paise=sublimit,
            sublimit_deduction_paise=excess,
            is_capped=True,
            explanation=f"Treatment sub-limit of ₹{sublimit/100:,.2f} applied. Eligible amount capped from ₹{amount_paise/100:,.2f} to ₹{sublimit/100:,.2f} (reduction of ₹{excess/100:,.2f})."
        )
    else:
        return SublimitResult(
            amount_before_sublimit_paise=amount_paise,
            capped_amount_paise=amount_paise,
            sublimit_deduction_paise=0,
            is_capped=False,
            explanation=f"Eligible amount ₹{amount_paise/100:,.2f} is within treatment sub-limit of ₹{sublimit/100:,.2f}."
        )
