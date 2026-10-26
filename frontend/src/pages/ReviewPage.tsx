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
    input, setInput, policy, setResult,
    setConfirmationToken, confirmationToken
  } = useEstimate();

  const [confirmedByUser, setConfirmedByUser] = useState<boolean>(input.inputs_confirmed);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

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
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 block mb-2">
            Insurance Policy Configuration
          </span>
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
                <span className="font-semibold text-slate-800">
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
