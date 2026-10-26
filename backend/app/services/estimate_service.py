import hashlib
import time
from app.schemas import (
    EstimateInput, EstimateResult, ValidationResponse,
    ConfirmationResponse, RoomComparisonResponse
)
from app.services.policy_service import policy_service
from app.agent.tools import (
    validate_estimate_inputs,
    calculate_claim_estimate,
    compare_room_categories
)
from app.exceptions import UnconfirmedInputError, ValidationError

# In-memory token registry for confirmed calculations
CONFIRMATION_CACHE: dict[str, dict] = {}

class EstimateService:
    def compute_canonical_hash(self, inputs: EstimateInput, policy_version: str) -> str:
        data_str = (
            f"{inputs.policy_id}:{inputs.room_category}:{inputs.room_rate_per_day_paise}:"
            f"{inputs.room_days}:{inputs.other_charges_paise}:{inputs.excluded_charges_paise}:"
            f"{policy_version}"
        )
        return hashlib.sha256(data_str.encode("utf-8")).hexdigest()

    def validate_estimate(self, inputs: EstimateInput) -> ValidationResponse:
        policy = policy_service.get_profile(inputs.policy_id)
        return validate_estimate_inputs(inputs, policy)

    def confirm_estimate(self, inputs: EstimateInput, policy_version: str) -> ConfirmationResponse:
        canonical_hash = self.compute_canonical_hash(inputs, policy_version)
        token = f"cnf_{canonical_hash[:16]}_{int(time.time())}"
        
        CONFIRMATION_CACHE[token] = {
            "canonical_hash": canonical_hash,
            "inputs": inputs.model_dump(),
            "policy_version": policy_version,
            "created_at": time.time(),
        }
        
        return ConfirmationResponse(
            confirmation_token=token,
            canonical_hash=canonical_hash,
            confirmed_at=time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            expires_in_seconds=3600
        )

    def calculate(self, inputs: EstimateInput, confirmation_token: str | None = None) -> EstimateResult:
        if not inputs.inputs_confirmed:
            raise UnconfirmedInputError("Please review and explicitly confirm estimate inputs before calculating.")
            
        policy = policy_service.get_profile(inputs.policy_id)
        
        # Verify confirmation token if provided
        if confirmation_token:
            cached = CONFIRMATION_CACHE.get(confirmation_token)
            if not cached:
                raise ValidationError("Confirmation token is invalid or expired. Please confirm inputs again.")
            current_hash = self.compute_canonical_hash(inputs, policy.version)
            if cached["canonical_hash"] != current_hash:
                raise ValidationError("Inputs or policy changed after confirmation. Confirmation invalidated.")
                
        return calculate_claim_estimate(inputs, policy)

    def compare(self, inputs: EstimateInput) -> RoomComparisonResponse:
        policy = policy_service.get_profile(inputs.policy_id)
        return compare_room_categories(inputs, policy)

estimate_service = EstimateService()
