import pytest
from app.schemas import PolicyProfile, EstimateInput
from app.calculation.engine import calculate_claim_estimate
from app.exceptions import UnconfirmedInputError

def test_hacktoberfest_core_calculation():
    """Validates the exact Hacktoberfest 2026 primary illustrative use case:
    Room limit: ₹5,000/day
    Room rate: ₹8,000/day
    Duration: 3 days
    Other charges: ₹1,20,000
    Total bill: ₹1,44,000
    Ratio: 0.625
    Eligible room: ₹15,000
    Adjusted other: ₹75,000
    Base eligible: ₹90,000
    10% copay: ₹9,000
    Insurer payment: ₹81,000
    Family out-of-pocket: ₹63,000
    """
    policy = PolicyProfile(
        policy_id="demo-fixed-room-limit",
        insurer_name="Demo Insurer",
        policy_name="Fixed Room Limit 5k",
        version="v1",
        room_limit_type="fixed_daily",
        room_limit_value=500000, # ₹5,000
        proportionate_deduction_applicable=True,
        copay_percentage=10,
        rules_confirmed=True
    )
    
    inp = EstimateInput(
        policy_id="demo-fixed-room-limit",
        room_category="Single Private Room",
        room_rate_per_day_paise=800000, # ₹8,000
        room_days=3,
        other_charges_paise=12000000, # ₹1,20,000
        excluded_charges_paise=0,
        inputs_confirmed=True
    )
    
    result = calculate_claim_estimate(inp, policy)
    
    assert result.total_bill_paise == 14400000, "Total bill must be ₹1,44,000"
    assert result.room_limit_ratio == 0.625, "Room eligibility ratio must be 0.625"
    assert result.eligible_room_charges_paise == 1500000, "Eligible room must be ₹15,000"
    assert result.adjusted_other_charges_paise == 7500000, "Adjusted other charges must be ₹75,000"
    assert result.amount_before_copay_paise == 9000000, "Amount before copay must be ₹90,000"
    assert result.copay_deduction_paise == 900000, "10% copay deduction must be ₹9,000"
    assert result.insurer_payment_paise == 8100000, "Insurer payment must be ₹81,000"
    assert result.family_payment_paise == 6300000, "Family out-of-pocket must be ₹63,000"
    assert result.calculation_complete is True
    assert len(result.calculation_steps) >= 5

def test_room_within_limit_no_penalty():
    policy = PolicyProfile(
        policy_id="demo-fixed-room-limit",
        insurer_name="Demo Insurer",
        policy_name="Fixed Room Limit 5k",
        version="v1",
        room_limit_type="fixed_daily",
        room_limit_value=500000,
        proportionate_deduction_applicable=True,
        copay_percentage=10,
        rules_confirmed=True
    )
    
    # Selected room rate ₹4,500 <= ₹5,000 limit
    inp = EstimateInput(
        policy_id="demo-fixed-room-limit",
        room_category="Semi-Private",
        room_rate_per_day_paise=450000,
        room_days=3,
        other_charges_paise=12000000,
        excluded_charges_paise=0,
        inputs_confirmed=True
    )
    
    result = calculate_claim_estimate(inp, policy)
    assert result.room_limit_ratio == 1.0
    assert result.eligible_room_charges_paise == 1350000 # 3 * 4500
    assert result.adjusted_other_charges_paise == 12000000 # 100% eligible
    assert result.total_bill_paise == 13350000
    assert result.amount_before_copay_paise == 13350000
    assert result.copay_deduction_paise == 1335000
    assert result.insurer_payment_paise == 12015000
    assert result.family_payment_paise == 1335000

def test_unconfirmed_inputs_blocked():
    policy = PolicyProfile(
        policy_id="demo-fixed-room-limit",
        insurer_name="Demo Insurer",
        policy_name="Fixed Room Limit 5k",
        version="v1",
        room_limit_type="fixed_daily",
        room_limit_value=500000,
        proportionate_deduction_applicable=True,
        copay_percentage=10,
        rules_confirmed=True
    )
    
    inp = EstimateInput(
        policy_id="demo-fixed-room-limit",
        room_category="Single Private Room",
        room_rate_per_day_paise=800000,
        room_days=3,
        other_charges_paise=12000000,
        inputs_confirmed=False # Not confirmed!
    )
    
    with pytest.raises(UnconfirmedInputError):
        calculate_claim_estimate(inp, policy)
