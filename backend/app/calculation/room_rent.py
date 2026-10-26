from decimal import Decimal
from app.calculation.rounding import compute_ratio, round_paise
from app.schemas import PolicyProfile, EstimateInput
from app.exceptions import ValidationError

class RoomRentEligibilityResult:
    def __init__(
        self,
        room_limit_paise: int | None,
        ratio: Decimal,
        eligible_room_daily_paise: int,
        eligible_room_total_paise: int,
        room_subtotal_paise: int,
        is_capped: bool,
        explanation: str
    ):
        self.room_limit_paise = room_limit_paise
        self.ratio = ratio
        self.eligible_room_daily_paise = eligible_room_daily_paise
        self.eligible_room_total_paise = eligible_room_total_paise
        self.room_subtotal_paise = room_subtotal_paise
        self.is_capped = is_capped
        self.explanation = explanation

def evaluate_room_rent(input_data: EstimateInput, policy: PolicyProfile) -> RoomRentEligibilityResult:
    room_rate = input_data.room_rate_per_day_paise
    days = input_data.room_days
    room_subtotal = room_rate * days
    
    if policy.room_limit_type == "none":
        return RoomRentEligibilityResult(
            room_limit_paise=None,
            ratio=Decimal("1.0"),
            eligible_room_daily_paise=room_rate,
            eligible_room_total_paise=room_subtotal,
            room_subtotal_paise=room_subtotal,
            is_capped=False,
            explanation=f"Policy has no room rent restriction. Full room charge of ₹{room_rate/100:,.2f}/day is eligible."
        )
        
    elif policy.room_limit_type == "fixed_daily":
        if policy.room_limit_value is None:
            raise ValidationError("Fixed room limit specified but room_limit_value is missing.")
        limit = policy.room_limit_value
        is_capped = room_rate > limit
        ratio = compute_ratio(limit, room_rate) if is_capped else Decimal("1.0")
        eligible_daily = min(room_rate, limit)
        eligible_total = eligible_daily * days
        
        return RoomRentEligibilityResult(
            room_limit_paise=limit,
            ratio=ratio,
            eligible_room_daily_paise=eligible_daily,
            eligible_room_total_paise=eligible_total,
            room_subtotal_paise=room_subtotal,
            is_capped=is_capped,
            explanation=(
                f"Policy fixed limit is ₹{limit/100:,.2f}/day. "
                f"Selected room is ₹{room_rate/100:,.2f}/day. "
                + (f"Eligibility ratio = ₹{limit/100:,.0f} / ₹{room_rate/100:,.0f} = {float(ratio):.4f}."
                   if is_capped else "Selected room is within limit (ratio = 1.0).")
            )
        )
        
    elif policy.room_limit_type == "percentage_of_sum_insured":
        if policy.room_limit_value is None:
            raise ValidationError("Percentage room limit specified but percentage value is missing.")
        if policy.sum_insured_paise is None or policy.sum_insured_paise <= 0:
            raise ValidationError("Policy requires sum_insured_paise to compute percentage room limit.")
            
        pct = policy.room_limit_value
        limit = round_paise(Decimal(policy.sum_insured_paise) * Decimal(pct) / Decimal("100"))
        is_capped = room_rate > limit
        ratio = compute_ratio(limit, room_rate) if is_capped else Decimal("1.0")
        eligible_daily = min(room_rate, limit)
        eligible_total = eligible_daily * days
        
        return RoomRentEligibilityResult(
            room_limit_paise=limit,
            ratio=ratio,
            eligible_room_daily_paise=eligible_daily,
            eligible_room_total_paise=eligible_total,
            room_subtotal_paise=room_subtotal,
            is_capped=is_capped,
            explanation=(
                f"Policy room limit is {pct}% of Sum Insured (₹{policy.sum_insured_paise/100:,.2f}) = ₹{limit/100:,.2f}/day. "
                + (f"Selected room ₹{room_rate/100:,.2f}/day exceeds limit. Eligibility ratio = {float(ratio):.4f}."
                   if is_capped else "Selected room is within limit.")
            )
        )
        
    else:
        raise ValidationError(f"Unsupported or unknown room_limit_type: '{policy.room_limit_type}'")
