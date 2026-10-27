"""Test the tools WITHOUT the LLM. Run: python demo_tools.py"""
import tools
from tools import *


def raises(fn, *a, **k):
    try:
        fn(*a, **k)
    except ToolError:
        return True
    return False


# worked example from the problem statement
r1 = calculate_room_ratio(8000, 5000, 3)
assert r1 == {"ratio": 0.625, "room_payable": 15000.0}
r2 = apply_proportionate_deduction(120000, 0.625, 15000)
assert r2["payable"] == 90000.0 and r2["other_after_ratio"] == 75000.0
r3 = apply_copay_and_sublimits(90000, 10)
assert r3["payable"] == 81000.0
assert estimate_out_of_pocket(144000, 81000)["out_of_pocket"] == 63000.0

# edge cases
assert calculate_room_ratio(5000, 5000, 1)["ratio"] == 1.0          # exactly at limit
assert calculate_room_ratio(3000, 5000, 2)["ratio"] == 1.0          # below limit, capped at 1
assert apply_copay_and_sublimits(90000, 0)["payable"] == 90000.0    # no co-pay
assert apply_copay_and_sublimits(90000, 10, 40000)["payable"] == 36000.0  # sub-limit
assert estimate_out_of_pocket(1000, 1000)["out_of_pocket"] == 0.0

# bad inputs must raise
assert raises(calculate_room_ratio, 0, 5000, 3)
assert raises(calculate_room_ratio, -8000, 5000, 3)
assert raises(calculate_room_ratio, "8000", 5000, 3)
assert raises(calculate_room_ratio, True, 5000, 3)
assert raises(calculate_room_ratio, 8000, 5000, 2.5)
assert raises(apply_proportionate_deduction, 1000, 1.5, 0)
assert raises(apply_copay_and_sublimits, 1000, 101)
assert raises(estimate_out_of_pocket, 1000, 2000)

# policy profiles
import json
P = json.load(open("policy.json"))["profiles"]
assert resolve_room_limit(P["sample_fixed_room_limit"]) == 5000
assert resolve_room_limit(P["sample_percent_limit"]) == 5000

# room comparison: Single private (5,000) has ratio 1
rows = compare_rooms(3, 120000, 5000, 10, None, True, json.load(open("policy.json"))["room_categories"])
single = [r for r in rows if r["category"] == "Single private"][0]
assert single["out_of_pocket"] == 13500.0
assert inr(144000) == "Rs 1,44,000" and inr(120000) == "Rs 1,20,000"
print("All tool tests passed.")
