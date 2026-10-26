export interface PolicyProfile {
  policy_id: string;
  insurer_name: string;
  policy_name: string;
  version: string;
  currency: 'INR';
  room_limit_type: 'fixed_daily' | 'percentage_of_sum_insured' | 'none' | 'unknown';
  room_limit_value: number | null;
  proportionate_deduction_applicable: boolean | null;
  copay_percentage: number | null;
  deductible_type?: 'fixed' | 'percentage' | 'none' | 'unknown';
  deductible_value?: number | null;
  sum_insured_paise?: number | null;
  treatment_sub_limit_paise?: number | null;
  known_exclusions?: string[];
  rules_confirmed: boolean;
  source_note?: string | null;
}

export interface EstimateInput {
  policy_id: string;
  hospital_name?: string | null;
  room_category: string;
  room_rate_per_day_paise: number;
  room_days: number;
  other_charges_paise: number;
  excluded_charges_paise: number;
  available_coverage_paise?: number | null;
  treatment_category?: string | null;
  inputs_confirmed: boolean;
}

export interface CalculationStep {
  step_number: number;
  title: string;
  formula: string;
  result_text: string;
  rule_reference: string;
  impact_paise?: number | null;
}

export interface EstimateResult {
  estimate_id: string;
  currency: 'INR';
  total_bill_paise: number;
  room_subtotal_paise: number;
  other_charges_paise: number;
  excluded_charges_paise: number;
  room_limit_ratio?: number | null;
  eligible_room_charges_paise: number;
  adjusted_other_charges_paise: number;
  amount_before_copay_paise: number;
  copay_deduction_paise: number;
  deductible_deduction_paise: number;
  sublimit_deduction_paise: number;
  insurer_payment_paise: number | null;
  family_payment_paise: number | null;
  calculation_complete: boolean;
  warnings: string[];
  assumptions: string[];
  applied_rules: string[];
  calculation_steps: CalculationStep[];
}

export interface RoomScenarioResult {
  room_category: string;
  room_rate_per_day_paise: number;
  room_days: number;
  room_subtotal_paise: number;
  total_bill_paise: number;
  room_ratio: number;
  eligible_room_charges_paise: number;
  adjusted_other_charges_paise: number;
  insurer_payment_paise: number;
  family_payment_paise: number;
  difference_from_selected_paise: number;
  is_lowest_out_of_pocket: boolean;
  notes: string;
}

export interface RoomComparisonResponse {
  scenarios: RoomScenarioResult[];
  recommended_category: string;
  savings_vs_selected_paise: number;
  disclaimer: string;
}

export interface DocumentExtractResponse {
  document_type: string;
  hospital_name: string | null;
  room_category: string | null;
  room_rate_per_day_paise: number | null;
  room_days: number | null;
  room_total_paise: number | null;
  other_charges_paise: number | null;
  excluded_charges_paise: number | null;
  deposit_paise: number | null;
  discount_paise: number | null;
  estimated_total_paise: number | null;
  currency: 'INR';
  source_evidence: string[];
  uncertainties: string[];
  confidence: 'high' | 'medium' | 'low';
  requires_user_confirmation: boolean;
}

export interface PolicyExtractResponse {
  policy_name: string | null;
  insurer_name: string | null;
  policy_version: string | null;
  room_limit_type: 'fixed_daily' | 'percentage_of_sum_insured' | 'none' | 'unknown';
  room_limit_value: number | null;
  proportionate_deduction_applicable: boolean | null;
  copay_percentage: number | null;
  deductible_type: 'fixed' | 'percentage' | 'none' | 'unknown';
  deductible_value: number | null;
  treatment_sub_limit_paise: number | null;
  candidate_rules: string[];
  supporting_excerpts: string[];
  ambiguities: string[];
  requires_user_confirmation: boolean;
}

export interface ValidationResponse {
  is_ready_for_calculation: boolean;
  missing_fields: string[];
  conflicting_fields: string[];
  unsupported_rules: string[];
  questions: string[];
  requires_user_confirmation: boolean;
}

export interface ConfirmationResponse {
  confirmation_token: string;
  canonical_hash: string;
  confirmed_at: string;
  expires_in_seconds: number;
}

export interface ExplanationResponse {
  summary: string;
  main_deductions: string[];
  important_uncertainties: string[];
  questions_for_insurer: string[];
  disclaimer: string;
}

export interface SecurityDemoResponse {
  demo_id: string;
  action_attempted: string;
  gate_responsible: string;
  verdict: 'accepted' | 'blocked' | 'rejected';
  explanation: string;
  structured_backend_result: Record<string, any>;
}

export interface AIStatus {
  ollama_available: boolean;
  model_name: string;
  model_available: boolean;
  installed_models: string[];
  image_input_supported: boolean;
  tool_calling_supported: boolean;
  status: string;
  instructions?: string;
  error?: string;
}

export interface HealthStatus {
  status: string;
  app_name: string;
  app_env: string;
  backend_version: string;
  config_valid: boolean;
  ollama_available: boolean;
  configured_model: string;
  model_available: boolean;
}

export interface AIChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AIChatRequest {
  message: string;
  history?: AIChatMessage[];
  current_estimate?: EstimateResult | null;
  policy?: PolicyProfile | null;
}

export interface AIChatResponse {
  reply: string;
  suggested_actions?: string[];
  disclaimer: string;
}

export interface NegotiationScriptRequest {
  estimate: EstimateResult;
  hospital_name?: string | null;
  patient_name?: string | null;
}

export interface NegotiationScriptResponse {
  unbundling_letter: string;
  verbal_talking_points: string[];
  target_savings_rupees: number;
  irdai_circular_reference: string;
}

export interface PolicyRiskAnalysisRequest {
  policy: PolicyProfile;
  estimated_bill_paise?: number;
}

export interface PolicyRiskAnalysisResponse {
  risk_level: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';
  score: number;
  safe_room_threshold_rupees: number | null;
  risk_factors: string[];
  recommendations: string[];
  vulnerability_breakdown: Record<string, string>;
}
