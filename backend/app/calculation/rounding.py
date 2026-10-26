from decimal import Decimal, ROUND_HALF_UP

def round_paise(amount: Decimal | float | int) -> int:
    """Rounds an amount to the nearest integer paise using ROUND_HALF_UP."""
    d = Decimal(str(amount)) if not isinstance(amount, Decimal) else amount
    return int(d.quantize(Decimal("1"), rounding=ROUND_HALF_UP))

def compute_ratio(numerator_paise: int, denominator_paise: int) -> Decimal:
    """Computes exact eligibility ratio to 6 decimal places."""
    if denominator_paise <= 0:
        return Decimal("1.0")
    if numerator_paise >= denominator_paise:
        return Decimal("1.0")
    num = Decimal(str(numerator_paise))
    den = Decimal(str(denominator_paise))
    return (num / den).quantize(Decimal("0.000001"), rounding=ROUND_HALF_UP)
