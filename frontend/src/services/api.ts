import {
  HealthStatus, AIStatus, PolicyProfile, EstimateInput,
  EstimateResult, RoomComparisonResponse, DocumentExtractResponse,
  PolicyExtractResponse, ValidationResponse, ConfirmationResponse,
  ExplanationResponse, SecurityDemoResponse
} from '../types';

const API_BASE = '/api';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!res.ok) {
    let errMessage = `HTTP ${res.status}: ${res.statusText}`;
    try {
      const errData = await res.json();
      if (errData.message) errMessage = errData.message;
    } catch {
      // ignore
    }
    throw new Error(errMessage);
  }

  return res.json();
}

export const api = {
  getHealth: () => fetchJson<HealthStatus>(`${API_BASE}/health`),
  getAIStatus: () => fetchJson<AIStatus>(`${API_BASE}/ai/status`),
  
  getPolicies: () => fetchJson<PolicyProfile[]>(`${API_BASE}/policies`),
  getPolicy: (id: string) => fetchJson<PolicyProfile>(`${API_BASE}/policies/${id}`),
  updatePolicy: (id: string, profile: PolicyProfile) =>
    fetchJson<PolicyProfile>(`${API_BASE}/policies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(profile),
    }),

  extractDocument: async (file: File): Promise<DocumentExtractResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE}/documents/extract`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Image extraction failed' }));
      throw new Error(err.message || 'Image extraction failed');
    }
    return res.json();
  },

  extractPolicyText: (text: string) =>
    fetchJson<PolicyExtractResponse>(`${API_BASE}/policies/extract`, {
      method: 'POST',
      body: JSON.stringify({ text }),
    }),

  validateEstimate: (inputs: EstimateInput) =>
    fetchJson<ValidationResponse>(`${API_BASE}/estimates/validate`, {
      method: 'POST',
      body: JSON.stringify(inputs),
    }),

  confirmEstimate: (inputs: EstimateInput, policyVersion: string) =>
    fetchJson<ConfirmationResponse>(`${API_BASE}/estimates/confirm`, {
      method: 'POST',
      body: JSON.stringify({ inputs, policy_version: policyVersion }),
    }),

  calculateEstimate: (inputs: EstimateInput, token?: string) =>
    fetchJson<EstimateResult>(`${API_BASE}/estimates/calculate`, {
      method: 'POST',
      headers: token ? { 'X-Confirmation-Token': token } : {},
      body: JSON.stringify(inputs),
    }),

  compareRooms: (inputs: EstimateInput) =>
    fetchJson<RoomComparisonResponse>(`${API_BASE}/estimates/compare-rooms`, {
      method: 'POST',
      body: JSON.stringify(inputs),
    }),

  explainEstimate: (estimateResult: EstimateResult, language: 'en' | 'hi' | 'mr') =>
    fetchJson<ExplanationResponse>(`${API_BASE}/assistant/explain`, {
      method: 'POST',
      body: JSON.stringify({ estimate_result: estimateResult, language }),
    }),

  chatWithCopilot: (data: { message: string; history?: any[]; current_estimate?: any; policy?: any }) =>
    fetchJson<{ reply: string; suggested_actions?: string[]; disclaimer: string }>(`${API_BASE}/assistant/chat`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  generateNegotiationScript: (data: { estimate_result: any; hospital_name?: string | null; policy_name?: string | null }) =>
    fetchJson<{ letter_subject: string; formal_letter_body: string; verbal_talking_points: string[]; unbundling_checklist: string[] }>(
      `${API_BASE}/assistant/negotiation-script`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    ),

  analyzePolicyRisk: (data: { policy: any; estimated_bill_paise?: number }) =>
    fetchJson<{
      risk_level: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';
      score: number;
      safe_room_threshold_rupees: number | null;
      risk_factors: string[];
      recommendations: string[];
      vulnerability_breakdown: Record<string, string>;
    }>(`${API_BASE}/assistant/policy-risk`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  runSecurityDemo: (demoId: string) =>
    fetchJson<SecurityDemoResponse>(`${API_BASE}/security/demo`, {
      method: 'POST',
      body: JSON.stringify({ demo_id: demoId }),
    }),

  runTests: () =>
    fetchJson<{ exit_code: number; stdout: string; stderr: string; duration_seconds: number; success: boolean }>(
      `${API_BASE}/tests/run`,
      { method: 'POST' }
    ),

  getRooms: () => fetchJson<{ categories: any[] }>(`${API_BASE}/rooms`),
  getDisclaimer: () => fetchJson<{ disclaimer: string }>(`${API_BASE}/disclaimer`),

  getRecommendedPolicies: (data: { total_bill_paise: number; room_rate_per_day_paise: number; room_days: number; other_charges_paise: number; family_payment_paise: number; current_policy_id?: string }) =>
    fetchJson<{ recommendations: any[] }>(`${API_BASE}/assistant/recommend-policies`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};
