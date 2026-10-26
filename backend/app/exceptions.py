class ClaimSenseException(Exception):
    def __init__(self, message: str, code: str = "INTERNAL_ERROR", details: dict | None = None):
        super().__init__(message)
        self.message = message
        self.code = code
        self.details = details or {}

class ValidationError(ClaimSenseException):
    def __init__(self, message: str, details: dict | None = None):
        super().__init__(message, code="VALIDATION_ERROR", details=details)

class SecurityGateError(ClaimSenseException):
    def __init__(self, gate: str, message: str, details: dict | None = None):
        merged = {"gate": gate}
        if details:
            merged.update(details)
        super().__init__(message, code="SECURITY_GATE_VIOLATION", details=merged)

class UnconfirmedInputError(ClaimSenseException):
    def __init__(self, message: str = "Calculation requires explicit user confirmation of inputs."):
        super().__init__(message, code="UNCONFIRMED_INPUTS")

class PolicyNotFoundError(ClaimSenseException):
    def __init__(self, policy_id: str):
        super().__init__(f"Policy profile '{policy_id}' not found.", code="POLICY_NOT_FOUND", details={"policy_id": policy_id})

class OllamaServiceError(ClaimSenseException):
    def __init__(self, message: str, details: dict | None = None):
        super().__init__(message, code="OLLAMA_SERVICE_ERROR", details=details)
