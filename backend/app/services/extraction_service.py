from app.validation.image_validation import validate_image_file, optimize_image_for_vision
from app.agent.ollama_client import ollama_client
from app.schemas import DocumentExtractResponse, PolicyExtractResponse

class ExtractionService:
    def extract_from_hospital_image(
        self,
        file_bytes: bytes,
        filename: str = "estimate.png",
        content_type: str | None = None
    ) -> DocumentExtractResponse:
        # Validate format, magic bytes, dimensions, integrity
        validate_image_file(file_bytes, filename=filename, content_type=content_type)
        # Downscale/optimize for LLM vision to prevent CPU timeout
        optimized_bytes = optimize_image_for_vision(file_bytes, max_dimension=1280)
        return ollama_client.extract_from_hospital_image(image_bytes=optimized_bytes, filename=filename)

    def extract_from_policy_text(self, policy_text: str) -> PolicyExtractResponse:
        return ollama_client.extract_from_policy_text(policy_text)

extraction_service = ExtractionService()
