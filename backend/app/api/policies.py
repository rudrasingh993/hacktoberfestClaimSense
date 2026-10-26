from fastapi import APIRouter, Body
from app.services.policy_service import policy_service
from app.services.extraction_service import extraction_service
from app.schemas import PolicyProfile, PolicyExtractResponse

router = APIRouter(prefix="/policies", tags=["Policies"])

@router.get("", response_model=list[PolicyProfile])
def list_policies():
    return policy_service.get_all_profiles()

@router.get("/{policy_id}", response_model=PolicyProfile)
def get_policy(policy_id: str):
    return policy_service.get_profile(policy_id)

@router.put("/{policy_id}", response_model=PolicyProfile)
def update_policy(policy_id: str, profile: PolicyProfile):
    return policy_service.update_profile(policy_id, profile)

@router.post("/extract", response_model=PolicyExtractResponse)
def extract_policy(payload: dict = Body(...)):
    policy_text = payload.get("text", "")
    return extraction_service.extract_from_policy_text(policy_text)
