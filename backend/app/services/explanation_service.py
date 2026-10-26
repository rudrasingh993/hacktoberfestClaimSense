from app.agent.ollama_client import ollama_client
from app.schemas import EstimateResult, ExplanationResponse

class ExplanationService:
    def explain(self, result: EstimateResult, language: str = "en") -> ExplanationResponse:
        return ollama_client.generate_explanation(result, language=language)

explanation_service = ExplanationService()
