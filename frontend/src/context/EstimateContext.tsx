import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  EstimateInput, PolicyProfile, EstimateResult,
  RoomComparisonResponse, DocumentExtractResponse, AIStatus
} from '../types';
import { api } from '../services/api';

interface EstimateContextType {
  input: EstimateInput;
  setInput: (updater: Partial<EstimateInput> | ((prev: EstimateInput) => EstimateInput)) => void;
  policy: PolicyProfile | null;
  setPolicy: (p: PolicyProfile) => void;
  policies: PolicyProfile[];
  aiStatus: AIStatus | null;
  confirmationToken: string | null;
  setConfirmationToken: (token: string | null) => void;
  result: EstimateResult | null;
  setResult: (res: EstimateResult | null) => void;
  roomComparison: RoomComparisonResponse | null;
  setRoomComparison: (comp: RoomComparisonResponse | null) => void;
  extractedDoc: DocumentExtractResponse | null;
  setExtractedDoc: (doc: DocumentExtractResponse | null) => void;
  language: 'en' | 'hi' | 'mr';
  setLanguage: (lang: 'en' | 'hi' | 'mr') => void;
  loadDemoEstimate: () => void;
  resetEstimate: () => void;
  refreshStatus: () => Promise<void>;
}

const defaultInput: EstimateInput = {
  policy_id: 'demo-fixed-room-limit',
  hospital_name: 'Sanjeevani Multispeciality Hospital',
  room_category: 'Single Private Room',
  room_rate_per_day_paise: 800000, // ₹8,000
  room_days: 3,
  other_charges_paise: 12000000, // ₹1,20,000
  excluded_charges_paise: 0,
  available_coverage_paise: 50000000, // ₹5,00,000
  treatment_category: 'Laparoscopic Surgery',
  inputs_confirmed: false,
};

const EstimateContext = createContext<EstimateContextType | undefined>(undefined);

export const EstimateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [input, setInputState] = useState<EstimateInput>(defaultInput);
  const [policy, setPolicyState] = useState<PolicyProfile | null>(null);
  const [policies, setPolicies] = useState<PolicyProfile[]>([]);
  const [aiStatus, setAiStatus] = useState<AIStatus | null>(null);
  const [confirmationToken, setConfirmationToken] = useState<string | null>(null);
  const [result, setResult] = useState<EstimateResult | null>(null);
  const [roomComparison, setRoomComparison] = useState<RoomComparisonResponse | null>(null);
  const [extractedDoc, setExtractedDoc] = useState<DocumentExtractResponse | null>(null);
  const [language, setLanguage] = useState<'en' | 'hi' | 'mr'>('en');

  const setInput = (updater: Partial<EstimateInput> | ((prev: EstimateInput) => EstimateInput)) => {
    setInputState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater };
      // Invalidate confirmation token if inputs change
      if (next !== prev) {
        setConfirmationToken(null);
      }
      return next;
    });
  };

  const setPolicy = (p: PolicyProfile) => {
    setPolicyState(p);
    setInput((prev) => ({ ...prev, policy_id: p.policy_id }));
    setConfirmationToken(null);
  };

  const refreshStatus = async () => {
    try {
      const [statusRes, polsRes] = await Promise.all([
        api.getAIStatus().catch(() => null),
        api.getPolicies().catch(() => []),
      ]);
      if (statusRes) setAiStatus(statusRes);
      if (polsRes && polsRes.length > 0) {
        setPolicies(polsRes);
        if (!policy) {
          const defaultPol = polsRes.find((p) => p.policy_id === 'demo-fixed-room-limit') || polsRes[0];
          setPolicyState(defaultPol);
        }
      }
    } catch {
      // offline/graceful
    }
  };

  useEffect(() => {
    refreshStatus();
  }, []);

  const loadDemoEstimate = () => {
    setInputState({
      policy_id: 'demo-fixed-room-limit',
      hospital_name: 'Sanjeevani Multispeciality Hospital',
      room_category: 'Single Private Room',
      room_rate_per_day_paise: 800000,
      room_days: 3,
      other_charges_paise: 12000000,
      excluded_charges_paise: 0,
      available_coverage_paise: 50000000,
      treatment_category: 'Laparoscopic Surgery',
      inputs_confirmed: true,
    });
    setConfirmationToken(null);
    setResult(null);
    setRoomComparison(null);
    const demoPolicy = policies.find((p) => p.policy_id === 'demo-fixed-room-limit');
    if (demoPolicy) setPolicyState(demoPolicy);
  };

  const resetEstimate = () => {
    setInputState(defaultInput);
    setConfirmationToken(null);
    setResult(null);
    setRoomComparison(null);
    setExtractedDoc(null);
  };

  return (
    <EstimateContext.Provider
      value={{
        input,
        setInput,
        policy,
        setPolicy,
        policies,
        aiStatus,
        confirmationToken,
        setConfirmationToken,
        result,
        setResult,
        roomComparison,
        setRoomComparison,
        extractedDoc,
        setExtractedDoc,
        language,
        setLanguage,
        loadDemoEstimate,
        resetEstimate,
        refreshStatus,
      }}
    >
      {children}
    </EstimateContext.Provider>
  );
};

export const useEstimate = () => {
  const context = useContext(EstimateContext);
  if (!context) {
    throw new Error('useEstimate must be used within an EstimateProvider');
  }
  return context;
};
