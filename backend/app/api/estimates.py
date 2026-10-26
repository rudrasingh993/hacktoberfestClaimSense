from fastapi import APIRouter, Header
from app.services.estimate_service import estimate_service
from app.schemas import (
    EstimateInput, EstimateResult, ValidationResponse,
    ConfirmationRequest, ConfirmationResponse, RoomComparisonResponse
)

router = APIRouter(prefix="/estimates", tags=["Estimates"])

@router.post("/validate", response_model=ValidationResponse)
def validate_estimate(inputs: EstimateInput):
    return estimate_service.validate_estimate(inputs)

@router.post("/confirm", response_model=ConfirmationResponse)
def confirm_estimate(request: ConfirmationRequest):
    return estimate_service.confirm_estimate(request.inputs, request.policy_version)

@router.post("/calculate", response_model=EstimateResult)
def calculate_estimate(inputs: EstimateInput, x_confirmation_token: str | None = Header(default=None)):
    return estimate_service.calculate(inputs, confirmation_token=x_confirmation_token)

@router.post("/compare-rooms", response_model=RoomComparisonResponse)
def compare_rooms(inputs: EstimateInput):
    return estimate_service.compare(inputs)
