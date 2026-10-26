from app.schemas import EstimateInput
from app.services.policy_service import policy_service
from app.agent.tools import compare_room_categories

def test_room_comparison_identifies_lowest_out_of_pocket():
    policy = policy_service.get_profile("demo-fixed-room-limit") # ₹5,000 limit
    
    inp = EstimateInput(
        policy_id="demo-fixed-room-limit",
        room_category="Single Private Room",
        room_rate_per_day_paise=800000,
        room_days=3,
        other_charges_paise=12000000,
        excluded_charges_paise=0,
        inputs_confirmed=True
    )
    
    res = compare_room_categories(inp, policy)
    assert len(res.scenarios) >= 3
    assert res.recommended_category != ""
    assert res.savings_vs_selected_paise > 0
    
    # Verify lowest is correctly marked
    lowest_scenario = next((s for s in res.scenarios if s.is_lowest_out_of_pocket), None)
    assert lowest_scenario is not None
    assert lowest_scenario.room_category == res.recommended_category
    assert lowest_scenario.family_payment_paise < 6300000
