import json
from pathlib import Path
from pydantic import ValidationError as PydanticValidationError
from app.schemas import PolicyConfigFile, PolicyProfile
from app.exceptions import ValidationError

def load_and_validate_policy_config(path: Path) -> PolicyConfigFile:
    if not path.exists():
        raise ValidationError(f"Policy configuration file not found at: {path}")
    
    try:
        with open(path, "r", encoding="utf-8") as f:
            raw_data = json.load(f)
    except json.JSONDecodeError as e:
        raise ValidationError(f"Policy configuration contains invalid JSON: {e}")
    except Exception as e:
        raise ValidationError(f"Failed to read policy configuration: {e}")

    try:
        config = PolicyConfigFile.model_validate(raw_data)
    except PydanticValidationError as e:
        error_details = []
        for err in e.errors():
            loc = " -> ".join(str(p) for p in err["loc"])
            error_details.append(f"{loc}: {err['msg']}")
        raise ValidationError(f"Policy configuration schema validation failed: {'; '.join(error_details)}")
        
    # Semantic validations
    profile_ids = set()
    for prof in config.profiles:
        if prof.policy_id in profile_ids:
            raise ValidationError(f"Duplicate policy_id found in configuration: '{prof.policy_id}'")
        profile_ids.add(prof.policy_id)
        
        if prof.room_limit_type == "fixed_daily" and (prof.room_limit_value is None or prof.room_limit_value <= 0):
            raise ValidationError(f"Policy '{prof.policy_id}': fixed_daily requires positive room_limit_value.")
        if prof.room_limit_type == "percentage_of_sum_insured":
            if prof.room_limit_value is None or prof.room_limit_value <= 0:
                raise ValidationError(f"Policy '{prof.policy_id}': percentage room limit requires positive percentage value.")
            if prof.sum_insured_paise is None or prof.sum_insured_paise <= 0:
                raise ValidationError(f"Policy '{prof.policy_id}': percentage limit requires positive sum_insured_paise.")
                
    return config
