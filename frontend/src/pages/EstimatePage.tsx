import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield, Building2, BedDouble, Receipt,
  ArrowRight, ArrowLeft, CheckCircle2, AlertCircle, Sparkles
} from 'lucide-react';
import { useEstimate } from '../context/EstimateContext';
import { formatRupees, rupeesToPaise, paiseToRupees } from '../utils/formatters';

export const EstimatePage: React.FC = () => {
  const navigate = useNavigate();
  const { input, setInput, policy, setPolicy, policies } = useEstimate();

  const [step, setStep] = useState<number>(1);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Local form state in Rupees for easy input
  const [roomRateRupees, setRoomRateRupees] = useState<number>(paiseToRupees(input.room_rate_per_day_paise));
  const [days, setDays] = useState<number>(input.room_days);
  const [otherChargesRupees, setOtherChargesRupees] = useState<number>(paiseToRupees(input.other_charges_paise));
  const [excludedChargesRupees, setExcludedChargesRupees] = useState<number>(paiseToRupees(input.excluded_charges_paise));
  const [hospitalName, setHospitalName] = useState<string>(input.hospital_name || '');
  const [roomCategory, setRoomCategory] = useState<string>(input.room_category || 'Single Private Room');

  const computedRoomSubtotal = roomRateRupees * days;
  const computedTotalBill = computedRoomSubtotal + otherChargesRupees + excludedChargesRupees;

  const handleNextStep = () => {
    const errors: Record<string, string> = {};
    if (step === 1) {
      if (!policy) errors.policy = 'Please select a policy profile.';
    } else if (step === 2) {
      if (roomRateRupees <= 0) errors.roomRate = 'Daily room rate must be positive.';
      if (days <= 0 || days > 365) errors.days = 'Stay duration must be between 1 and 365 days.';
    } else if (step === 3) {
      if (otherChargesRupees < 0) errors.other = 'Charges cannot be negative.';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});
    if (step < 3) {
      setStep(step + 1);
    } else {
      // Sync to EstimateContext
      setInput({
        hospital_name: hospitalName,
        room_category: roomCategory,
        room_rate_per_day_paise: rupeesToPaise(roomRateRupees),
        room_days: days,
        other_charges_paise: rupeesToPaise(otherChargesRupees),
        excluded_charges_paise: rupeesToPaise(excludedChargesRupees),
        inputs_confirmed: false, // Must be confirmed in review
      });
      navigate('/estimate/review');
    }
  };

  const handlePrevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          New Pre-Admission Estimate
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Enter hospital and policy details to calculate your estimated claim coverage and out-of-pocket costs.
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        {[
          { num: 1, label: 'Policy Profile', icon: Shield },
          { num: 2, label: 'Hospital & Room', icon: BedDouble },
          { num: 3, label: 'Estimated Charges', icon: Receipt },
        ].map((s) => {
          const Icon = s.icon;
          const isDone = step > s.num;
          const isCurrent = step === s.num;
          return (
            <div key={s.num} className="flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs transition-colors ${
                  isDone
                    ? 'bg-emerald-600 text-white'
                    : isCurrent
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                {isDone ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-4 h-4" />}
              </div>
              <span
                className={`text-xs font-semibold hidden sm:inline ${
                  isCurrent ? 'text-blue-700' : isDone ? 'text-slate-800' : 'text-slate-400'
                }`}
              >
                {s.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Step 1: Policy Selection */}
      {step === 1 && (
        <div className="space-y-6 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-600" />
              <span>Step 1: Select Insurance Policy Profile</span>
            </h2>
            <button
              onClick={() => navigate('/estimate/upload')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <span>Or Upload Policy Image</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
              Active Policy Profile
            </label>
            <div className="grid grid-cols-1 gap-3">
              {policies.map((p) => {
                const isSelected = policy?.policy_id === p.policy_id;
                return (
                  <div
                    key={p.policy_id}
                    onClick={() => setPolicy(p)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/50 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">{p.policy_name}</span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                            {p.insurer_name}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">{p.source_note}</p>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                          isSelected ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300'
                        }`}
                      >
                        {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-200/60 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase">Room Rent Limit</span>
                        <span className="font-bold text-slate-800">
                          {p.room_limit_type === 'none'
                            ? 'No Capping'
                            : p.room_limit_type === 'fixed_daily'
                            ? formatRupees(p.room_limit_value) + '/day'
                            : `${p.room_limit_value}% of SI`}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase">Proportionate Ded.</span>
                        <span className="font-bold text-slate-800">
                          {p.proportionate_deduction_applicable ? 'Applicable' : 'Waived'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase">Co-payment</span>
                        <span className="font-bold text-slate-800">{p.copay_percentage || 0}%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            {formErrors.policy && <p className="text-xs text-rose-600 font-medium">{formErrors.policy}</p>}
          </div>
        </div>
      )}

      {/* Step 2: Hospital & Room Details */}
      {step === 2 && (
        <div className="space-y-6 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <BedDouble className="w-5 h-5 text-blue-600" />
            <span>Step 2: Hospital & Room Selection</span>
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Hospital Name
              </label>
              <input
                type="text"
                value={hospitalName}
                onChange={(e) => setHospitalName(e.target.value)}
                placeholder="e.g. Sanjeevani Multispeciality Hospital"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Selected Room Category
                </label>
                <select
                  value={roomCategory}
                  onChange={(e) => setRoomCategory(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 bg-white"
                >
                  <option value="General Ward">General Ward (₹2,500/day)</option>
                  <option value="Twin Sharing (Semi-Private)">Twin Sharing / Semi-Private (₹4,500/day)</option>
                  <option value="Single Private Room">Single Private Room (₹8,000/day)</option>
                  <option value="Deluxe Suite">Deluxe Suite (₹15,000/day)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Daily Room Rate (INR ₹)
                </label>
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={roomRateRupees}
                  onChange={(e) => setRoomRateRupees(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
                {formErrors.roomRate && <p className="text-xs text-rose-600 mt-1">{formErrors.roomRate}</p>}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Expected Stay Duration (Days)
              </label>
              <input
                type="number"
                min="1"
                max="365"
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              />
              {formErrors.days && <p className="text-xs text-rose-600 mt-1">{formErrors.days}</p>}
            </div>

            {/* Room Subtotal Summary */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
              <span className="text-slate-600">
                Calculated Room Subtotal ({days} days × {formatRupees(rupeesToPaise(roomRateRupees))}/day):
              </span>
              <span className="font-extrabold text-slate-900 text-sm">
                {formatRupees(rupeesToPaise(computedRoomSubtotal))}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Estimated Charges */}
      {step === 3 && (
        <div className="space-y-6 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Receipt className="w-5 h-5 text-blue-600" />
            <span>Step 3: Medical & Associated Hospital Charges</span>
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Other Hospital Charges (OT, Surgeon, Nursing, Diagnostics in ₹)
              </label>
              <input
                type="number"
                min="0"
                step="1000"
                value={otherChargesRupees}
                onChange={(e) => setOtherChargesRupees(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Note: These charges are subject to proportionate deductions if your room rate exceeds policy sub-limits.
              </p>
              {formErrors.other && <p className="text-xs text-rose-600 mt-1">{formErrors.other}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Non-Medical / Excluded Charges (Gloves, Registration, Surcharges in ₹)
              </label>
              <input
                type="number"
                min="0"
                step="500"
                value={excludedChargesRupees}
                onChange={(e) => setExcludedChargesRupees(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              />
            </div>

            {/* Total Estimated Bill Card */}
            <div className="p-5 rounded-xl bg-blue-50/60 border border-blue-200 text-xs space-y-2">
              <div className="flex items-center justify-between text-slate-600">
                <span>Room Charges ({days} days):</span>
                <span className="font-semibold text-slate-800">{formatRupees(rupeesToPaise(computedRoomSubtotal))}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Other Associated Medical Charges:</span>
                <span className="font-semibold text-slate-800">{formatRupees(rupeesToPaise(otherChargesRupees))}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Non-Medical Exclusions:</span>
                <span className="font-semibold text-slate-800">{formatRupees(rupeesToPaise(excludedChargesRupees))}</span>
              </div>
              <div className="flex items-center justify-between border-t border-blue-200 pt-2 text-sm">
                <span className="font-extrabold text-blue-900">Total Pre-Admission Hospital Bill:</span>
                <span className="font-extrabold text-blue-700 text-base">
                  {formatRupees(rupeesToPaise(computedTotalBill))}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Nav Actions */}
      <div className="flex items-center justify-between pt-4">
        {step > 1 ? (
          <button
            onClick={handlePrevStep}
            className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition-colors flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous Step</span>
          </button>
        ) : (
          <div />
        )}

        <button
          onClick={handleNextStep}
          className="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-500 shadow-md shadow-blue-500/20 transition-all flex items-center gap-2"
        >
          <span>{step === 3 ? 'Review & Confirm Inputs' : 'Continue'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
