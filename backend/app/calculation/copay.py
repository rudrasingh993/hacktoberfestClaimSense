from decimal import Decimal
from app.calculation.rounding import round_paise
from app.schemas import PolicyProfile

class CopayResult:
    def __init__(
        self,
        amount_before_copay_paise: int,
        copay_percentage: int,
        copay_deduction_paise: int,
        insurer_amount_paise: int,
        explanation: str
    ):
        self.amount_before_copay_paise = amount_before_copay_paise
        self.copay_percentage = copay_percentage
        self.copay_deduction_paise = copay_deduction_paise
        self.insurer_amount_paise = insurer_amount_paise
        self.explanation = explanation

def apply_copay(
    amount_paise: int,
    policy: PolicyProfile
) -> CopayResult:
    copay_pct = policy.copay_percentage or 0
    if copay_pct <= 0:
        return CopayResult(
            amount_before_copay_paise=amount_paise,
            copay_percentage=0,
            copay_deduction_paise=0,
            insurer_amount_paise=amount_paise,
            explanation="0% co-payment applicable under this policy profile."
        )
        
    copay_deduction = round_paise(Decimal(amount_paise) * Decimal(copay_pct) / Decimal("100"))
    insurer_amount = amount_paise - copay_deduction
    
    return CopayResult(
        amount_before_copay_paise=amount_paise,
        copay_percentage=copay_pct,
        copay_deduction_paise=copay_deduction,
        insurer_amount_paise=insurer_amount,
        explanation=f"Co-payment of {copay_pct}% applied on ₹{amount_paise/100:,.2f} -> deduction of ₹{copay_deduction/100:,.2f}; insurer portion ₹{insurer_amount/100:,.2f}."
    )
