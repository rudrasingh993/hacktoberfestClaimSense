from fastapi import APIRouter
from app.services.explanation_service import explanation_service
from app.agent.ollama_client import ollama_client
from app.schemas import (
    ExplanationRequest, ExplanationResponse,
    AIChatRequest, AIChatResponse,
    NegotiationScriptRequest, NegotiationScriptResponse,
    PolicyRiskAnalysisRequest, PolicyRiskAnalysisResponse,
    PolicyRecommendationRequest, PolicyRecommendationResponse
)

router = APIRouter(prefix="/assistant", tags=["Assistant & AI Copilot"])

@router.post("/explain", response_model=ExplanationResponse)
def explain_estimate(request: ExplanationRequest):
    return explanation_service.explain(request.estimate_result, language=request.language)

@router.post("/chat", response_model=AIChatResponse)
def chat_with_copilot(request: AIChatRequest):
    return ollama_client.chat_with_copilot(
        message=request.message,
        context_estimate=request.context_estimate,
        language=request.language
    )

@router.post("/negotiation-script", response_model=NegotiationScriptResponse)
def generate_negotiation_script(request: NegotiationScriptRequest):
    return ollama_client.generate_negotiation_script(
        result=request.estimate_result,
        hospital_name=request.hospital_name,
        policy_name=request.policy_name
    )

@router.post("/policy-risk", response_model=PolicyRiskAnalysisResponse)
def analyze_policy_risk(request: PolicyRiskAnalysisRequest):
    return ollama_client.analyze_policy_risk(
        policy=request.policy,
        estimated_bill_paise=request.estimated_bill_paise
    )

@router.post("/recommend-policies", response_model=PolicyRecommendationResponse)
def recommend_policies(request: PolicyRecommendationRequest):
    return ollama_client.recommend_policies(
        total_bill_paise=request.total_bill_paise,
        room_rate_per_day_paise=request.room_rate_per_day_paise,
        room_days=request.room_days,
        other_charges_paise=request.other_charges_paise,
        family_payment_paise=request.family_payment_paise,
        current_policy_id=request.current_policy_id,
    )

