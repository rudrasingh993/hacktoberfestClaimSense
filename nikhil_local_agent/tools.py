"""ClaimSense tools. Every number comes from here, never from the model."""
import math


class ToolError(ValueError):
    pass


def _num(value, name, lo=0.0, hi=1e9, allow_zero=True):
    if type(value) not in (int, float):          # also rejects booleans
        raise ToolError(f"{name} must be a number")
    if not math.isfinite(value):
        raise ToolError(f"{name} must be finite")
    if value < lo or value > hi:
        raise ToolError(f"{name} must be between {lo} and {hi}")
    if value == 0 and not allow_zero:
        raise ToolError(f"{name} must be greater than 0")
    return float(value)


def _days(value):
    if type(value) not in (int, float) or not float(value).is_integer():
        raise ToolError("days must be a whole number")
    if not 1 <= value <= 365:
        raise ToolError("days must be between 1 and 365")
    return int(value)


def inr(x):
    """Format with Indian digit grouping, e.g. 144000 -> Rs 1,44,000."""
    n = int(round(x))
    s = str(abs(n))
    if len(s) > 3:
        head, tail, parts = s[:-3], s[-3:], []
        while len(head) > 2:
            parts.insert(0, head[-2:])
            head = head[:-2]
        if head:
            parts.insert(0, head)
        s = ",".join(parts + [tail])
    return ("-" if n < 0 else "") + "Rs " + s


# ---------------- the four tools (fixed order) ----------------

def calculate_room_ratio(room_rent_per_day, room_limit_per_day, days):
    """Room-rent ratio = limit / rent, capped at 1. Also returns the payable room charge.

    Args:
        room_rent_per_day: actual room rent per day (number)
        room_limit_per_day: policy room limit per day (number)
        days: number of days (whole number)
    """
    rent = _num(room_rent_per_day, "room_rent_per_day", allow_zero=False)
    limit = _num(room_limit_per_day, "room_limit_per_day", allow_zero=False)
    d = _days(days)
    return {"ratio": round(min(1.0, limit / rent), 6),
            "room_payable": round(min(rent, limit) * d, 2)}


def apply_proportionate_deduction(eligible_charges, ratio, room_payable):
    """Scale other eligible charges by the ratio, then add the payable room charge.

    Args:
        eligible_charges: other charges besides room (number)
        ratio: room-rent ratio between 0 and 1
        room_payable: payable room charge from the previous tool
    """
    e = _num(eligible_charges, "eligible_charges")
    r = _num(ratio, "ratio", 0.0, 1.0, allow_zero=False)
    rp = _num(room_payable, "room_payable")
    return {"payable": round(rp + e * r, 2), "other_after_ratio": round(e * r, 2)}


def apply_copay_and_sublimits(amount, copay_percent, sublimit=None):
    """Apply an optional sub-limit cap, then the co-pay percentage.

    Args:
        amount: amount payable before co-pay (number)
        copay_percent: co-pay percentage, 0 to 100
        sublimit: optional cap in rupees, or null
    """
    a = _num(amount, "amount")
    c = _num(copay_percent, "copay_percent", 0.0, 100.0)
    capped = a
    if sublimit is not None:
        capped = min(a, _num(sublimit, "sublimit", allow_zero=False))
    return {"payable": round(capped * (1 - c / 100), 2), "capped_amount": round(capped, 2)}


def estimate_out_of_pocket(total_bill, insurer_payable):
    """Family share = total bill minus what the insurer pays.

    Args:
        total_bill: total hospital bill (number)
        insurer_payable: insurer payable from the previous tool (number)
    """
    t = _num(total_bill, "total_bill")
    p = _num(insurer_payable, "insurer_payable")
    if p > t + 0.005:
        raise ToolError("insurer_payable cannot exceed total_bill")
    return {"out_of_pocket": round(t - p, 2)}


TOOLS = {f.__name__: f for f in (calculate_room_ratio, apply_proportionate_deduction,
                                 apply_copay_and_sublimits, estimate_out_of_pocket)}
ORDER = ("calculate_room_ratio", "apply_proportionate_deduction",
         "apply_copay_and_sublimits", "estimate_out_of_pocket")


# ---------------- host helpers (plain Python) ----------------

def resolve_room_limit(profile):
    kind, value = profile["room_limit_type"], profile["room_limit_value"]
    if kind == "fixed_per_day":
        return float(value)
    if kind == "percent_of_sum_insured":
        si = profile.get("sum_insured")
        if si is None:
            raise ToolError("sum_insured missing in policy.json")
        return round(si * value / 100, 2)
    raise ToolError(f"unknown room_limit_type: {kind}")


def run_pipeline(rent, days, other, limit, copay, sublimit=None, proportionate=True):
    """Run the four tools in order. Returns (inputs, [r1, r2, r3, r4])."""
    total = rent * days + other
    r1 = calculate_room_ratio(rent, limit, days)
    ratio = r1["ratio"] if proportionate else 1.0
    r2 = apply_proportionate_deduction(other, ratio, r1["room_payable"])
    r3 = apply_copay_and_sublimits(r2["payable"], copay, sublimit)
    r4 = estimate_out_of_pocket(total, r3["payable"])
    inputs = {"rent": rent, "days": days, "other": other, "limit": limit,
              "copay": copay, "sublimit": sublimit, "total_bill": total,
              "proportionate": proportionate}
    return inputs, [r1, r2, r3, r4]


def build_report(inp, results):
    """Show-your-work lines, built from tool results (never from the model)."""
    r1, r2, r3, r4 = results
    rent, d, other, limit = inp["rent"], inp["days"], inp["other"], inp["limit"]
    ratio = r1["ratio"] if inp["proportionate"] else 1.0
    lines = [
        f"1. Total bill = rent x days + other = {inr(rent)} x {d} + {inr(other)} = {inr(inp['total_bill'])}",
        f"2. Room-rent ratio = limit / rent = {inr(limit)} / {inr(rent)} = {r1['ratio']:g}"
        + ("" if inp["proportionate"] else "  (policy has no proportionate deduction, ratio used = 1)"),
        f"3. Room payable = min(rent, limit) x days = {inr(min(rent, limit))} x {d} = {inr(r1['room_payable'])}",
        f"4. Other charges after ratio = {inr(other)} x {ratio:g} = {inr(r2['other_after_ratio'])}",
        f"5. Payable before co-pay = {inr(r1['room_payable'])} + {inr(r2['other_after_ratio'])} = {inr(r2['payable'])}",
    ]
    if inp["sublimit"] is not None:
        lines.append(f"6. Sub-limit cap {inr(inp['sublimit'])}: amount considered = {inr(r3['capped_amount'])}")
    lines.append(f"{'7' if inp['sublimit'] is not None else '6'}. After {inp['copay']:g}% co-pay, insurer pays = "
                 f"{inr(r3['capped_amount'])} x (1 - {inp['copay']:g}%) = {inr(r3['payable'])}")
    lines.append(f"{'8' if inp['sublimit'] is not None else '7'}. Family pays = {inr(inp['total_bill'])} - "
                 f"{inr(r3['payable'])} = {inr(r4['out_of_pocket'])}")
    return lines


def compare_rooms(days, other, limit, copay, sublimit, proportionate, categories):
    """Same bill under every room category (a simple loop over the tools)."""
    rows = []
    for name, rent in categories.items():
        inp, res = run_pipeline(rent, days, other, limit, copay, sublimit, proportionate)
        rows.append({"category": name, "rent": rent, "ratio": res[0]["ratio"] if proportionate else 1.0,
                     "total_bill": inp["total_bill"], "insurer_payable": res[2]["payable"],
                     "out_of_pocket": res[3]["out_of_pocket"]})
    return sorted(rows, key=lambda r: r["rent"])
