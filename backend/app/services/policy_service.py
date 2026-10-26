import json
import shutil
from pathlib import Path
from app.config import settings
from app.schemas import PolicyProfile, PolicyConfigFile
from app.validation.policy_schema import load_and_validate_policy_config
from app.exceptions import PolicyNotFoundError, ValidationError

class PolicyService:
    def __init__(self):
        self.config_path = settings.policy_config_path
        self._in_memory_config: PolicyConfigFile | None = None

    def get_all_profiles(self) -> list[PolicyProfile]:
        if self._in_memory_config:
            return self._in_memory_config.profiles
        config = load_and_validate_policy_config(self.config_path)
        return config.profiles

    def get_profile(self, policy_id: str) -> PolicyProfile:
        profiles = self.get_all_profiles()
        for p in profiles:
            if p.policy_id == policy_id:
                return p
        raise PolicyNotFoundError(policy_id)

    def update_profile(self, policy_id: str, updated_profile: PolicyProfile) -> PolicyProfile:
        if policy_id != updated_profile.policy_id:
            raise ValidationError("URL policy_id does not match payload policy_id.")
            
        profiles = self.get_all_profiles()
        found = False
        new_profiles = []
        for p in profiles:
            if p.policy_id == policy_id:
                new_profiles.append(updated_profile)
                found = True
            else:
                new_profiles.append(p)
                
        if not found:
            raise PolicyNotFoundError(policy_id)
            
        new_config = PolicyConfigFile(
            schema_version="1.0.0",
            currency="INR",
            profiles=new_profiles
        )
        self._in_memory_config = new_config
        
        # Try writing to disk (persisted locally; safely caught if running in read-only serverless like Vercel)
        try:
            backup_path = self.config_path.with_suffix(".json.bak")
            if self.config_path.exists():
                shutil.copy2(self.config_path, backup_path)
            
            temp_path = self.config_path.with_suffix(".json.tmp")
            with open(temp_path, "w", encoding="utf-8") as f:
                f.write(new_config.model_dump_json(indent=2))
                
            load_and_validate_policy_config(temp_path)
            temp_path.replace(self.config_path)
        except OSError:
            # Serverless read-only filesystem fallback (e.g. Vercel)
            pass
        
        return updated_profile

policy_service = PolicyService()
