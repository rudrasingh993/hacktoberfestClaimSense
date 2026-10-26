from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_api_health():
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert "configured_model" in data

def test_api_list_policies():
    res = client.get("/api/policies")
    assert res.status_code == 200
    policies = res.json()
    assert len(policies) >= 1
    assert any(p["policy_id"] == "demo-fixed-room-limit" for p in policies)

def test_api_calculate_core_scenario():
    payload = {
        "policy_id": "demo-fixed-room-limit",
        "hospital_name": "Test Hospital",
        "room_category": "Single Private",
        "room_rate_per_day_paise": 800000,
        "room_days": 3,
        "other_charges_paise": 12000000,
        "excluded_charges_paise": 0,
        "inputs_confirmed": True
    }
    res = client.post("/api/estimates/calculate", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["total_bill_paise"] == 14400000
    assert data["insurer_payment_paise"] == 8100000
    assert data["family_payment_paise"] == 6300000
    assert data["room_limit_ratio"] == 0.625

def test_api_security_demo():
    res = client.post("/api/security/demo", json={"demo_id": "unknown_tool"})
    assert res.status_code == 200
    data = res.json()
    assert data["verdict"] == "blocked"
    assert "Gate 1" in data["gate_responsible"]

def test_api_explain():
    # Test explanation generation in English, Hindi, and Marathi
    calc_res = client.post("/api/estimates/calculate", json={
        "policy_id": "demo-fixed-room-limit",
        "room_category": "Single Private",
        "room_rate_per_day_paise": 800000,
        "room_days": 3,
        "other_charges_paise": 12000000,
        "inputs_confirmed": True
    }).json()

    for lang in ["en", "hi", "mr"]:
        exp = client.post("/api/assistant/explain", json={"estimate_result": calc_res, "language": lang})
        assert exp.status_code == 200
        assert len(exp.json()["summary"]) > 10

def test_api_extended_ai_endpoints():
    calc_res = client.post("/api/estimates/calculate", json={
        "policy_id": "demo-fixed-room-limit",
        "room_category": "Single Private",
        "room_rate_per_day_paise": 800000,
        "room_days": 3,
        "other_charges_paise": 12000000,
        "inputs_confirmed": True
    }).json()

    # 1. AI Copilot Chat (test with fast mock or domain knowledge fallback)
    from unittest.mock import patch
    from app.schemas import AIChatResponse
    with patch("app.agent.ollama_client.OllamaClient.chat_with_copilot") as mock_chat:
        mock_chat.return_value = AIChatResponse(
            reply="Proportionate deductions occur when chosen room rent exceeds policy limit.",
            suggested_prompts=["How to unbundle surgeon charges?"]
        )
        chat_res = client.post("/api/assistant/chat", json={
            "message": "Why do proportionate deductions apply to doctor fees?",
            "context_estimate": calc_res,
            "language": "en"
        })
        assert chat_res.status_code == 200
        assert len(chat_res.json()["reply"]) > 20
        assert len(chat_res.json()["suggested_prompts"]) >= 1

    # 2. AI Negotiation Script Generator
    neg_res = client.post("/api/assistant/negotiation-script", json={
        "estimate_result": calc_res,
        "hospital_name": "Sanjeevani Hospital",
        "policy_name": "Star Health"
    })
    assert neg_res.status_code == 200
    assert "Unbundling" in neg_res.json()["letter_subject"]
    assert len(neg_res.json()["verbal_talking_points"]) >= 2

    # 3. AI Policy Risk Radar
    policy_prof = client.get("/api/policies/demo-fixed-room-limit").json()
    risk_res = client.post("/api/assistant/policy-risk", json={
        "policy": policy_prof,
        "estimated_bill_paise": 14400000
    })
    assert risk_res.status_code == 200
    assert risk_res.json()["risk_level"] in ["CRITICAL", "HIGH", "MODERATE", "LOW"]
    assert risk_res.json()["safe_room_threshold_rupees"] == 5000
