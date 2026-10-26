import React, { useState, useEffect } from 'react';
import {
  FileText, Shield, Save, RotateCcw, CheckCircle2,
  AlertTriangle, ArrowRight, Lock, Sparkles
} from 'lucide-react';
import { useEstimate } from '../context/EstimateContext';
import { api } from '../services/api';
import { PolicyProfile, PolicyRiskAnalysisResponse } from '../types';
import { formatRupees, rupeesToPaise, paiseToRupees } from '../utils/formatters';

export const PolicyPage: React.FC = () => {
  const { policies, policy, setPolicy, refreshStatus } = useEstimate();

  const [selectedPolicyId, setSelectedPolicyId] = useState<string>(
    policy?.policy_id || 'demo-fixed-room-limit'
  );
  const [currentEdit, setCurrentEdit] = useState<PolicyProfile | null>(null);

  const [roomLimitRupees, setRoomLimitRupees] = useState<number>(5000);
  const [copay, setCopay] = useState<number>(10);
  const [propDed, setPropDed] = useState<boolean>(true);
  const [sumInsuredRupees, setSumInsuredRupees] = useState<number>(500000);

  const [saving, setSaving] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [riskAnalysis, setRiskAnalysis] = useState<PolicyRiskAnalysisResponse | null>(null);
  const [loadingRisk, setLoadingRisk] = useState<boolean>(false);

  useEffect(() => {
    const p = policies.find((item) => item.policy_id === selectedPolicyId);
    if (p) {
      setCurrentEdit(p);
      setRoomLimitRupees(paiseToRupees(p.room_limit_value || 0));
      setCopay(p.copay_percentage || 0);
      setPropDed(Boolean(p.proportionate_deduction_applicable));
      setSumInsuredRupees(paiseToRupees(p.sum_insured_paise || 50000000));

      setLoadingRisk(true);
      api.analyzePolicyRisk({ policy: p })
        .then((res) => setRiskAnalysis(res))
        .catch(() => setRiskAnalysis(null))
        .finally(() => setLoadingRisk(false));
    }
  }, [selectedPolicyId, policies]);

  const handleSave = async () => {
    if (!currentEdit) return;
    setSaving(true);
    setError(null);
    setSavedSuccess(false);

    try {
      const updatedProfile: PolicyProfile = {
        ...currentEdit,
        room_limit_value: rupeesToPaise(roomLimitRupees),
        copay_percentage: copay,
        proportionate_deduction_applicable: propDed,
        sum_insured_paise: rupeesToPaise(sumInsuredRupees),
        rules_confirmed: true,
      };

      const res = await api.updatePolicy(currentEdit.policy_id, updatedProfile);
      setPolicy(res);
      await refreshStatus();
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update policy profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Policy Configuration & Rules Editor
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Inspect, configure, and validate health insurance policy clauses from <code>config/policy.json</code>.
          Changes are validated by strict Pydantic schemas and written atomically.
        </p>
      </div>

      {/* Profile Selector */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
          Select Policy Profile to Configure
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {policies.map((p) => (
            <button
              key={p.policy_id}
              onClick={() => setSelectedPolicyId(p.policy_id)}
              className={`p-3.5 rounded-xl border text-left transition-all ${
                selectedPolicyId === p.policy_id
                  ? 'border-blue-600 bg-blue-50/50 shadow-xs'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="font-bold text-xs text-slate-900">{p.policy_name}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">{p.insurer_name}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Editor Form */}
      {currentEdit && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">{currentEdit.policy_name}</h2>
              <p className="text-xs text-slate-400">ID: {currentEdit.policy_id} • v{currentEdit.version}</p>
            </div>
            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              Validated Schema
            </span>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Room Rent Limit Type
                </label>
                <select
                  value={currentEdit.room_limit_type}
                  onChange={(e) =>
                    setCurrentEdit({ ...currentEdit, room_limit_type: e.target.value as any })
                  }
                  className="w-full px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold bg-white"
                >
                  <option value="fixed_daily">Fixed Daily Limit (₹/day)</option>
                  <option value="percentage_of_sum_insured">% of Sum Insured</option>
                  <option value="none">No Capping (Unlimited)</option>
                </select>
              </div>

              {currentEdit.room_limit_type !== 'none' && (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    {currentEdit.room_limit_type === 'fixed_daily'
                      ? 'Daily Limit (in ₹)'
                      : 'Percentage (% of SI)'}
                  </label>
                  <input
                    type="number"
                    value={roomLimitRupees}
                    onChange={(e) => setRoomLimitRupees(Number(e.target.value))}
                    className="w-full px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-900"
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Patient Co-Payment (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={copay}
                  onChange={(e) => setCopay(Number(e.target.value))}
                  className="w-full px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Overall Sum Insured (in ₹)
                </label>
                <input
                  type="number"
                  step="50000"
                  value={sumInsuredRupees}
                  onChange={(e) => setSumInsuredRupees(Number(e.target.value))}
                  className="w-full px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-900"
                />
              </div>
            </div>

            {/* Proportionate Deduction Checkbox */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={propDed}
                  onChange={(e) => setPropDed(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600"
                />
                <span className="text-xs font-semibold text-slate-800">
                  Enforce Proportionate Deductions on Associated Medical Expenses
                </span>
              </label>
              <p className="text-[11px] text-slate-400 mt-1 pl-7">
                When enabled, exceeding room rent reduces surgeon fees, OT, and nursing charges proportionately.
              </p>
            </div>

            {savedSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Policy profile validated and updated atomically in config/policy.json!</span>
              </div>
            )}

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Validating & Saving...' : 'Save Policy Changes'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Policy Risk Radar */}
      {currentEdit && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-amber-50 text-amber-600 border border-amber-200 rounded-xl">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span>AI Policy Risk Radar</span>
                  {riskAnalysis && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        riskAnalysis.risk_level === 'CRITICAL'
                          ? 'bg-rose-100 text-rose-700 border border-rose-200'
                          : riskAnalysis.risk_level === 'HIGH'
                          ? 'bg-amber-100 text-amber-700 border border-amber-200'
                          : riskAnalysis.risk_level === 'MODERATE'
                          ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                          : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      {riskAnalysis.risk_level} RISK
                    </span>
                  )}
                </h3>
                <p className="text-xs text-slate-500">
                  AI automated vulnerability audit for room rent limits and proportionate penalty traps.
                </p>
              </div>
            </div>

            {riskAnalysis?.safe_room_threshold_rupees && (
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Safe Room Limit</span>
                <span className="text-sm font-black text-emerald-600">
                  ₹{riskAnalysis.safe_room_threshold_rupees.toLocaleString('en-IN')}/day
                </span>
              </div>
            )}
          </div>

          {riskAnalysis ? (
            <div className="space-y-3 pt-3 border-t border-slate-100 text-xs">
              {/* Risk Factors */}
              <div>
                <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px] block mb-1.5">
                  Detected Policy Traps & Vulnerabilities
                </span>
                <div className="space-y-1.5">
                  {(riskAnalysis.risk_factors || (riskAnalysis as any).hidden_penalties || []).map((rf: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-2 text-slate-700">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                      <span>{rf}</span>
                    </div>
                  ))}
                  {(!riskAnalysis.risk_factors?.length && !(riskAnalysis as any).hidden_penalties?.length) && (
                    <div className="text-slate-400 italic text-[11px]">No severe room-rent vulnerability traps detected.</div>
                  )}
                </div>
              </div>

              {/* Recommendations */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px] block mb-1">
                  AI Pre-Admission Recommendations
                </span>
                <ul className="list-disc pl-4 space-y-1 text-slate-600">
                  {(riskAnalysis.recommendations || ((riskAnalysis as any).recommended_action ? [(riskAnalysis as any).recommended_action] : [])).map((rec: string, idx: number) => (
                    <li key={idx}>{rec}</li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-400 italic py-2">
              {loadingRisk ? 'Auditing policy vulnerabilities with AI...' : 'Select a policy to evaluate risk.'}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
