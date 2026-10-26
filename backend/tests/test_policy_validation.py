import pytest
from pathlib import Path
from app.validation.policy_schema import load_and_validate_policy_config
from app.exceptions import ValidationError
from app.config import settings

def test_load_default_policy_config():
    config = load_and_validate_policy_config(settings.policy_config_path)
    assert config.schema_version == 1
    assert len(config.profiles) >= 3
    
    # Check fixed room limit profile
    fixed_prof = next((p for p in config.profiles if p.policy_id == "demo-fixed-room-limit"), None)
    assert fixed_prof is not None
    assert fixed_prof.room_limit_type == "fixed_daily"
    assert fixed_prof.room_limit_value == 500000
    assert fixed_prof.copay_percentage == 10

def test_reject_invalid_json(tmp_path: Path):
    bad_json = tmp_path / "bad_policy.json"
    bad_json.write_text("{ this is not valid json }", encoding="utf-8")
    
    with pytest.raises(ValidationError, match="invalid JSON"):
        load_and_validate_policy_config(bad_json)

def test_reject_missing_required_fields(tmp_path: Path):
    incomplete_json = tmp_path / "incomplete.json"
    incomplete_json.write_text('{"schema_version": 1, "currency": "INR", "profiles": [{"policy_id": "test"}]}', encoding="utf-8")
    
    with pytest.raises(ValidationError, match="schema validation failed"):
        load_and_validate_policy_config(incomplete_json)
