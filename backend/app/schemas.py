from typing import Literal, Any
from pydantic import BaseModel, ConfigDict, Field, field_validator

class PolicyProfile(BaseModel):
    model_config = ConfigDict(extra="forbid")
    
    policy_id: str
    insurer_name: str
    policy_name: str
    version: str
    currency: Literal["INR"] = "INR"
    room_limit_type: Literal[
        "fixed_daily",
        "percentage_of_sum_insured",
        "none",
        "unknown",
    ]
    room_limit_value: int | None = None
    proportionate_deduction_applicable: bool | None = None
    copay_percentage: int | None = Field(default=None, ge=0, le=100)
    deductible_type: Literal["fixed", "percentage", "none", "unknown"] = "none"
    deductible_value: int | None = None
    sum_insured_paise: int | None = None
    treatment_sub_limit_paise: int | None = None
    known_exclusions: list[str] = Field(default_factory=list)
    rules_confirmed: bool = False
    source_note: str | None = None

class PolicyConfigFile(BaseModel):
    model_config = ConfigDict(extra="forbid")
    schema_version: int = 1
    currency: Literal["INR"] = "INR"
    profiles: list[PolicyProfile]

class EstimateInput(BaseModel):
    model_config = ConfigDict(extra="forbid")
    
    policy_id: str
    hospital_name: str | None = None
    room_category: str
    room_rate_per_day_paise: int
    room_days: int
    other_charges_paise: int
    excluded_charges_paise: int = 0
    available_coverage_paise: int | None = None
    treatment_category: str | None = None
    inputs_confirmed: bool = False

    @field_validator("room_rate_per_day_paise", mode="before")
    @classmethod
    def validate_room_rate(cls, v: object) -> int:
        if type(v) is not int:
            raise ValueError("room_rate_per_day_paise must be a strict integer in paise (booleans/floats not allowed)")
        if v < 0 or v > 100_000_000:
            raise ValueError("room_rate_per_day_paise out of allowed range (0 to ₹10,00,000)")
        return v

    @field_validator("room_days", mode="before")
    @classmethod
    def validate_room_days(cls, v: object) -> int:
        if type(v) is not int:
            raise ValueError("room_days must be a strict positive integer")
        if v < 1 or v > 365:
            raise ValueError("room_days must be between 1 and 365")
        return v

    @field_validator("other_charges_paise", mode="before")
    @classmethod
    def validate_other_charges(cls, v: object) -> int:
        if type(v) is not int:
            raise ValueError("other_charges_paise must be a strict integer in paise")
        if v < 0 or v > 10_000_000_000:
            raise ValueError("other_charges_paise out of range")
        return v

    @field_validator("excluded_charges_paise", mode="before")
    @classmethod
    def validate_excluded_charges(cls, v: object) -> int:
        if type(v) is not int:
            raise ValueError("excluded_charges_paise must be a strict integer in paise")
        if v < 0 or v > 10_000_000_000:
            raise ValueError("excluded_charges_paise out of range")
        return v

class CalculationStep(BaseModel):
    step_number: int
    title: str
    formula: str
    result_text: str
    rule_reference: str
    impact_paise: int | None = None

class EstimateResult(BaseModel):
    model_config = ConfigDict(extra="forbid")
    
    estimate_id: str
    currency: Literal["INR"] = "INR"
    total_bill_paise: int
    room_subtotal_paise: int
    other_charges_paise: int
    excluded_charges_paise: int
    room_limit_ratio: float | None = None
    eligible_room_charges_paise: int
    adjusted_other_charges_paise: int
    amount_before_copay_paise: int
    copay_deduction_paise: int
    deductible_deduction_paise: int = 0
    sublimit_deduction_paise: int = 0
    insurer_payment_paise: int | None = None
    family_payment_paise: int | None = None
    calculation_complete: bool
    warnings: list[str] = Field(default_factory=list)
    assumptions: list[str] = Field(default_factory=list)
    applied_rules: list[str] = Field(default_factory=list)
    calculation_steps: list[CalculationStep] = Field(default_factory=list)

class RoomScenarioResult(BaseModel):
    model_config = ConfigDict(extra="forbid")
    
    room_category: str
    room_rate_per_day_paise: int
    room_days: int
    room_subtotal_paise: int
    total_bill_paise: int
    room_ratio: float
    eligible_room_charges_paise: int
    adjusted_other_charges_paise: int
    insurer_payment_paise: int
    family_payment_paise: int
    difference_from_selected_paise: int
    is_lowest_out_of_pocket: bool
    notes: str

class RoomComparisonResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")
    scenarios: list[RoomScenarioResult]
    recommended_category: str
    savings_vs_selected_paise: int
    disclaimer: str

class ValidationResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")
    is_ready_for_calculation: bool
    missing_fields: list[str] = Field(default_factory=list)
    conflicting_fields: list[str] = Field(default_factory=list)
    unsupported_rules: list[str] = Field(default_factory=list)
    questions: list[str] = Field(default_factory=list)
    requires_user_confirmation: bool = True

class ConfirmationRequest(BaseModel):
    inputs: EstimateInput
    policy_version: str

class ConfirmationResponse(BaseModel):
    confirmation_token: str
    canonical_hash: str
    confirmed_at: str
    expires_in_seconds: int = 3600

class DocumentExtractResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")
    document_type: str = "hospital_estimate"
    hospital_name: str | None = None
    room_category: str | None = None
    room_rate_per_day_paise: int | None = None
    room_days: int | None = None
    room_total_paise: int | None = None
    other_charges_paise: int | None = None
    excluded_charges_paise: int | None = None
    deposit_paise: int | None = None
    discount_paise: int | None = None
    estimated_total_paise: int | None = None
    currency: Literal["INR"] = "INR"
    source_evidence: list[str] = Field(default_factory=list)
    uncertainties: list[str] = Field(default_factory=list)
    confidence: Literal["high", "medium", "low"] = "medium"
    requires_user_confirmation: bool = True

class PolicyExtractResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")
    policy_name: str | None = None
    insurer_name: str | None = None
    policy_version: str | None = None
    room_limit_type: Literal["fixed_daily", "percentage_of_sum_insured", "none", "unknown"] = "unknown"
    room_limit_value: int | None = None
    proportionate_deduction_applicable: bool | None = None
    copay_percentage: int | None = None
    deductible_type: Literal["fixed", "percentage", "none", "unknown"] = "unknown"
    deductible_value: int | None = None
    treatment_sub_limit_paise: int | None = None
    candidate_rules: list[str] = Field(default_factory=list)
    supporting_excerpts: list[str] = Field(default_factory=list)
    ambiguities: list[str] = Field(default_factory=list)
    requires_user_confirmation: bool = True

class ExplanationRequest(BaseModel):
    estimate_result: EstimateResult
    language: Literal["en", "hi", "mr"] = "en"

class ExplanationResponse(BaseModel):
    summary: str
    main_deductions: list[str]
    important_uncertainties: list[str]
    questions_for_insurer: list[str]
    disclaimer: str

class SecurityDemoRequest(BaseModel):
    demo_id: Literal[
        "prompt_injection",
        "unknown_tool",
        "missing_input",
        "invalid_arguments",
        "successful_calculation",
    ]

class SecurityDemoResponse(BaseModel):
    demo_id: str
    action_attempted: str
    gate_responsible: str
    verdict: Literal["accepted", "blocked", "rejected"]
    explanation: str
    structured_backend_result: dict

# Extended AI Capabilities Schemas
class AIChatRequest(BaseModel):
    message: str
    context_estimate: EstimateResult | None = None
    language: Literal["en", "hi", "mr"] = "en"

class AIChatResponse(BaseModel):
    reply: str
    suggested_prompts: list[str] = Field(default_factory=list)

class NegotiationScriptRequest(BaseModel):
    model_config = ConfigDict(extra="ignore")
    estimate_result: Any
    hospital_name: str | None = None
    policy_name: str | None = None

class NegotiationScriptResponse(BaseModel):
    letter_subject: str
    formal_letter_body: str
    verbal_talking_points: list[str]
    unbundling_checklist: list[str]

class PolicyRiskAnalysisRequest(BaseModel):
    policy: PolicyProfile
    estimated_bill_paise: int | None = None

class PolicyRiskAnalysisResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    risk_level: Literal["LOW", "MODERATE", "HIGH", "CRITICAL"] = "LOW"
    room_limit_risk_summary: str = ""
    hidden_penalties: list[str] = Field(default_factory=list)
    safe_room_threshold_rupees: int = 5000
    recommended_action: str = ""
    # Frontend aliases for full cross-compatibility
    risk_factors: list[str] = Field(default_factory=list)
    recommendations: list[str] = Field(default_factory=list)
    score: int = 80

class PolicyRecommendationItem(BaseModel):
    type: str
    title: str
    description: str
    estimated_savings_paise: int = 0
    priority: Literal["HIGH", "MEDIUM", "LOW"] = "MEDIUM"
    features: list[str] = Field(default_factory=list)

class PolicyRecommendationRequest(BaseModel):
    model_config = ConfigDict(extra="ignore")
    total_bill_paise: int = 0
    room_rate_per_day_paise: int = 0
    room_days: int = 1
    other_charges_paise: int = 0
    family_payment_paise: int = 0
    current_policy_id: str | None = None

class PolicyRecommendationResponse(BaseModel):
    recommendations: list[PolicyRecommendationItem] = Field(default_factory=list)
    summary: str = ""
