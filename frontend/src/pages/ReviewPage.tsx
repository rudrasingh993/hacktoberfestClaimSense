import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ClipboardCheck, ShieldAlert, ArrowRight, ArrowLeft,
  CheckCircle2, AlertTriangle, Sparkles, RefreshCw, FileText
} from 'lucide-react';
import { useEstimate } from '../context/EstimateContext';
import { api } from '../services/api';
import { formatRupees } from '../utils/formatters';

export const ReviewPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    input, setInput, policy, setPolicy, policies, setResult,
    setConfirmationToken, confirmationToken
  } = useEstimate();

  const [confirmedByUser, setConfirmedByUser] = useState<boolean>(input.inputs_confirmed);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showPolicyModal, setShowPolicyModal] = useState<boolean>(false);

  const roomSubtotal = input.room_rate_per_day_paise * input.room_days;
  const totalBill = roomSubtotal + input.other_charges_paise + input.excluded_charges_paise;

  const handleConfirmAndCalculate = async () => {
    if (!confirmedByUser) {
      setError('Please tick the confirmation checkbox to verify your inputs before calculating.');
      return;
    }

    if (!policy) {
      setError('No insurance policy profile is selected. Please select a policy.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Mark inputs as confirmed
      const confirmedInput = { ...input, inputs_confirmed: true };
      setInput(confirmedInput);

      // 2. Request cryptographic confirmation token from backend
      const confirmRes = await api.confirmEstimate(confirmedInput, policy.version);
      setConfirmationToken(confirmRes.confirmation_token);

      // 3. Trigger deterministic calculation with confirmation token
      const calcResult = await api.calculateEstimate(confirmedInput, confirmRes.confirmation_token);
      setResult(calcResult);

      // 4. Navigate to Results page
      navigate(`/results/${calcResult.estimate_id}`);
    } catch (err: any) {
      setError(err.message || 'Calculation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Review & Confirmation Gate
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Review all confirmed inputs before running the deterministic calculation engine. AI cannot calculate financial results without human confirmation.
        </p>
      </div>

      {/* Review Summary Grid */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
        {/* Policy Section */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 block">
              Insurance Policy Configuration
            </span>
            <button
              type="button"
              onClick={() => setShowPolicyModal(true)}
              className="text-xs text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 cursor-pointer"
            >
              <span>Change Policy</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
            <div className="flex justify-between font-bold text-slate-900 text-sm">
              <span>{policy?.policy_name || 'No Policy Selected'}</span>
              <span className="text-blue-700">{policy?.insurer_name}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-200 text-slate-600">
              <div>
                <span className="text-slate-400 block text-[10px]">Room Rent Limit:</span>
                <span className="font-semibold text-slate-800">
                  {policy?.room_limit_type === 'none'
                    ? 'None (Unlimited)'
                    : policy?.room_limit_type === 'fixed_daily'
                    ? formatRupees(policy.room_limit_value) + '/day'
                    : `${policy?.room_limit_value}% of Sum Insured`}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Proportionate Deductions:</span>
                <span className={`font-semibold ${policy?.proportionate_deduction_applicable ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {policy?.proportionate_deduction_applicable ? 'Enforced' : 'Exempt'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Co-payment:</span>
                <span className="font-semibold text-slate-800">{policy?.copay_percentage || 0}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Change Policy Modal */}
        {showPolicyModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Select Different Policy</h3>
                  <p className="text-xs text-slate-500">Pick any real-world policy to recalculate your estimate</p>
                </div>
                <button
                  onClick={() => setShowPolicyModal(false)}
                  className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1"
                >
                  ✕
                </button>
              </div>

              <div className="overflow-y-auto space-y-2.5 flex-1 pr-1">
                {policies.map((p) => {
                  const isCur = policy?.policy_id === p.policy_id;
                  const isReal = !p.policy_id.startsWith('demo-');
                  return (
                    <div
                      key={p.policy_id}
                      onClick={() => {
                        setPolicy(p);
                        setShowPolicyModal(false);
                      }}
                      className={`p-3.5 rounded-xl border text-xs cursor-pointer transition ${
                        isCur
                          ? 'border-blue-600 bg-blue-50/60 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900">{p.policy_name}</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                              {p.insurer_name}
                            </span>
                            {isReal && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
                                Real
                              </span>
                            )}
                          </div>
                          <p className="text-slate-500 text-[11px] mt-1 line-clamp-2">{p.source_note}</p>
                        </div>
                        {isCur && <span className="text-blue-600 font-bold text-xs shrink-0 ml-2">✓ Selected</span>}
                      </div>

                      <div className="flex gap-4 mt-2 pt-2 border-t border-slate-200/60 text-[11px]">
                        <span>Room: <strong>{p.room_limit_type === 'none' ? 'No Cap' : p.room_limit_type === 'fixed_daily' ? `${formatRupees(p.room_limit_value)}/d` : `${p.room_limit_value}% SI`}</strong></span>
                        <span>Prop. Ded: <strong className={p.proportionate_deduction_applicable ? 'text-rose-600' : 'text-emerald-600'}>{p.proportionate_deduction_applicable ? 'Yes' : 'No'}</strong></span>
                        <span>Co-pay: <strong>{p.copay_percentage || 0}%</strong></span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-2 border-t border-slate-200 flex justify-end">
                <button
                  onClick={() => setShowPolicyModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Hospital & Room Charges */}
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 block mb-2">
            Hospital Stay & Admission Charges
          </span>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
            <div className="flex justify-between font-bold text-slate-900 text-sm">
              <span>{input.hospital_name || 'Hospital Admission'}</span>
              <span className="text-slate-700">{input.room_category}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-200 text-slate-600">
              <div>
                <span className="text-slate-400 block text-[10px]">Daily Room Rate:</span>
                <span className="font-semibold text-slate-800">
                  {formatRupees(input.room_rate_per_day_paise)} / day
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Expected Duration:</span>
                <span className="font-semibold text-slate-800">{input.room_days} Days</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Derived Room Total:</span>
                <span className="font-bold text-blue-900">{formatRupees(roomSubtotal)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Financial Breakdown Table */}
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 block mb-2">
            Total Pre-Admission Hospital Bill Reconciliation
          </span>
          <div className="rounded-xl border border-slate-200 overflow-hidden text-xs">
            <div className="flex justify-between p-3 bg-slate-50 border-b border-slate-200 text-slate-700">
              <span>Room Rent Subtotal ({input.room_days} days):</span>
              <span className="font-semibold text-slate-900">{formatRupees(roomSubtotal)}</span>
            </div>
            <div className="flex justify-between p-3 border-b border-slate-100 text-slate-700">
              <span>Other Associated Medical Charges (OT, Surgeon, Nursing):</span>
              <span className="font-semibold text-slate-900">{formatRupees(input.other_charges_paise)}</span>
            </div>
            <div className="flex justify-between p-3 border-b border-slate-100 text-slate-700">
              <span>Non-Medical / Excluded Charges:</span>
              <span className="font-semibold text-slate-900">{formatRupees(input.excluded_charges_paise)}</span>
            </div>
            <div className="flex justify-between p-4 bg-blue-50/70 text-sm font-extrabold text-blue-950">
              <span>Total Estimated Hospital Bill:</span>
              <span className="text-blue-700 text-base">{formatRupees(totalBill)}</span>
            </div>
          </div>
        </div>

        {/* Explicit Confirmation Checkbox (Gate 2 Human-in-the-Loop) */}
        <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 space-y-3">
          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={confirmedByUser}
              onChange={(e) => setConfirmedByUser(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-xs font-semibold text-amber-950 leading-relaxed">
              I confirm that these figures match my hospital pre-admission estimate and policy terms.
              I understand that ClaimSense will execute deterministic Python arithmetic based strictly on these confirmed figures.
            </span>
          </label>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Nav Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/estimate')}
          className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition-colors flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Edit Inputs</span>
        </button>

        <button
          onClick={handleConfirmAndCalculate}
          disabled={loading || !confirmedByUser}
          className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Executing Deterministic Python Engine...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Confirm & Calculate Claim Estimate</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
