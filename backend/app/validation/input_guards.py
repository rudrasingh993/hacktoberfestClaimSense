from app.exceptions import ValidationError

def require_strict_int(name: str, value: object, min_val: int = 0, max_val: int = 1_000_000_000_000) -> int:
    """Strict type and range guard that explicitly rejects bools, floats, and strings."""
    if type(value) is bool:
        raise ValidationError(f"Type guard failure: {name} cannot be a boolean value.", details={"field": name, "value": value})
    if type(value) is not int:
        raise ValidationError(f"Type guard failure: {name} must be a strict integer.", details={"field": name, "value": value})
    if value < min_val or value > max_val:
        raise ValidationError(
            f"Range guard failure: {name} must be between {min_val} and {max_val}.",
            details={"field": name, "value": value, "min": min_val, "max": max_val}
        )
    return value

def validate_cross_field_reconciliation(
    room_rate_per_day_paise: int,
    room_days: int,
    other_charges_paise: int,
    excluded_charges_paise: int,
    reported_total_paise: int | None = None
) -> None:
    expected_room_subtotal = room_rate_per_day_paise * room_days
    computed_total = expected_room_subtotal + other_charges_paise + excluded_charges_paise
    
    if reported_total_paise is not None and reported_total_paise > 0:
        if reported_total_paise != computed_total:
            raise ValidationError(
                f"Financial reconciliation discrepancy: Reported bill of ₹{reported_total_paise/100:,.2f} "
                f"does not match sum of components (Room ₹{expected_room_subtotal/100:,.2f} + Other ₹{other_charges_paise/100:,.2f} "
                f"+ Excluded ₹{excluded_charges_paise/100:,.2f} = ₹{computed_total/100:,.2f}).",
                details={
                    "reported_total": reported_total_paise,
                    "computed_total": computed_total,
                    "difference": reported_total_paise - computed_total
                }
            )
