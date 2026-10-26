import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield, Building2, BedDouble, Receipt,
  ArrowRight, ArrowLeft, CheckCircle2, AlertCircle, Sparkles,
  Search, Filter, ChevronDown, Check, Globe
} from 'lucide-react';
import { useEstimate } from '../context/EstimateContext';
import { formatRupees, rupeesToPaise, paiseToRupees } from '../utils/formatters';
import { PolicyProfile } from '../types';

export const EstimatePage: React.FC = () => {
  const navigate = useNavigate();
  const { input, setInput, policy, setPolicy, policies } = useEstimate();

  const [step, setStep] = useState<number>(1);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Policy Search & Filter
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterType, setFilterType] = useState<'all' | 'real_world' | 'no_limit' | 'percentage' | 'fixed'>('all');
  const [showPolicySwitcher, setShowPolicySwitcher] = useState<boolean>(false);

  // Local form state in Rupees for easy input
  const [roomRateRupees, setRoomRateRupees] = useState<number>(paiseToRupees(input.room_rate_per_day_paise));
  const [days, setDays] = useState<number>(input.room_days);
  const [otherChargesRupees, setOtherChargesRupees] = useState<number>(paiseToRupees(input.other_charges_paise));
  const [excludedChargesRupees, setExcludedChargesRupees] = useState<number>(paiseToRupees(input.excluded_charges_paise));
  const [hospitalName, setHospitalName] = useState<string>(input.hospital_name || '');
  const [roomCategory, setRoomCategory] = useState<string>(input.room_category || 'Single Private Room');

  const computedRoomSubtotal = roomRateRupees * days;
  const computedTotalBill = computedRoomSubtotal + otherChargesRupees + excludedChargesRupees;

  // Filter policies based on search and selected filter type
  const filteredPolicies = useMemo(() => {
    return policies.filter((p) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        p.policy_name.toLowerCase().includes(q) ||
        p.insurer_name.toLowerCase().includes(q) ||
        p.policy_id.toLowerCase().includes(q) ||
        (p.source_note && p.source_note.toLowerCase().includes(q));

      if (!matchesSearch) return false;

      if (filterType === 'real_world') {
        return !p.policy_id.startsWith('demo-');
      }
      if (filterType === 'no_limit') {
        return p.room_limit_type === 'none';
      }
      if (filterType === 'percentage') {
        return p.room_limit_type === 'percentage_of_sum_insured';
      }
      if (filterType === 'fixed') {
        return p.room_limit_type === 'fixed_daily';
      }
      return true;
    });
  }, [policies, searchQuery, filterType]);

  const handleNextStep = () => {
    const errors: Record<string, string> = {};
    if (step === 1) {
      if (!policy) errors.policy = 'Please select an insurance policy profile to proceed.';
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
          Select your health insurance policy and enter estimated hospital expenses to detect room-rent proportionate deductions before admission.
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        {[
          { num: 1, label: 'Choose Policy', icon: Shield },
          { num: 2, label: 'Hospital & Room', icon: BedDouble },
          { num: 3, label: 'Estimated Charges', icon: Receipt },
        ].map((s) => {
          const Icon = s.icon;
          const isDone = step > s.num;
          const isCurrent = step === s.num;
          return (
            <div
              key={s.num}
              onClick={() => {
                if (isDone) setStep(s.num);
              }}
              className={`flex items-center gap-3 ${isDone ? 'cursor-pointer hover:opacity-80' : ''}`}
            >
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" />
                <span>Step 1: Choose Your Health Insurance Policy</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Select from real-world Indian policies (HDFC ERGO, Star Health, Niva Bupa, Care, PSU) or test profiles.
              </p>
            </div>
            <button
              onClick={() => navigate('/estimate/upload')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 self-start sm:self-auto"
            >
              <span>Or Upload Policy Schedule Image</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Search & Filter Controls */}
          <div className="space-y-3 pt-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search real-world policy by name (e.g., Optima Secure, ReAssure, Star, Care, New India)..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 placeholder-slate-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Quick Filter Chips */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-slate-400 text-[11px] font-semibold uppercase tracking-wider flex items-center gap-1">
                <Filter className="w-3 h-3" /> Filter:
              </span>
              {[
                { id: 'all', label: `All (${policies.length})` },
                { id: 'real_world', label: `Real-World Plans (${policies.filter((p) => !p.policy_id.startsWith('demo-')).length})` },
                { id: 'no_limit', label: 'Zero Room Cap (No Deductions)' },
                { id: 'percentage', label: '1% SI Sub-Limit (PSU Standard)' },
                { id: 'fixed', label: 'Single Private Room Cap' },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFilterType(f.id as any)}
                  className={`px-3 py-1 rounded-lg font-medium transition ${
                    filterType === f.id
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Policy Cards Grid */}
          <div className="space-y-3 pt-1 max-h-[520px] overflow-y-auto pr-1">
            {filteredPolicies.length === 0 ? (
              <div className="text-center py-10 border border-dashed border-slate-200 rounded-xl text-slate-400 text-xs">
                No insurance policies matched your search "{searchQuery}".
              </div>
            ) : (
              filteredPolicies.map((p) => {
                const isSelected = policy?.policy_id === p.policy_id;
                const isRealWorld = !p.policy_id.startsWith('demo-');
                return (
                  <div
                    key={p.policy_id}
                    onClick={() => {
                      setPolicy(p);
                      setFormErrors({});
                    }}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/50 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">{p.policy_name}</span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                            {p.insurer_name}
                          </span>
                          {isRealWorld && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Real-World Plan
                            </span>
                          )}
                          {p.room_limit_type === 'none' && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-50 text-cyan-700 border border-cyan-200">
                              No Sub-Limit
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">{p.source_note}</p>
                      </div>

                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                          isSelected ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300'
                        }`}
                      >
                        {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 pt-3 border-t border-slate-200/60 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-semibold">Room Rent Limit</span>
                        <span className="font-bold text-slate-800">
                          {p.room_limit_type === 'none'
                            ? 'No Capping'
                            : p.room_limit_type === 'fixed_daily'
                            ? formatRupees(p.room_limit_value) + '/day'
                            : `${p.room_limit_value}% of SI`}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-semibold">Proportionate Ded.</span>
                        <span className={`font-bold ${p.proportionate_deduction_applicable ? 'text-rose-600' : 'text-emerald-600'}`}>
                          {p.proportionate_deduction_applicable ? 'Applicable' : 'Waived (0%)'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-semibold">Co-payment</span>
                        <span className="font-bold text-slate-800">{p.copay_percentage || 0}%</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-semibold">Base Sum Insured</span>
                        <span className="font-bold text-slate-800">
                          {p.sum_insured_paise ? formatRupees(p.sum_insured_paise) : 'Flexible'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            {formErrors.policy && <p className="text-xs text-rose-600 font-medium">{formErrors.policy}</p>}
          </div>
        </div>
      )}

      {/* Step 2: Hospital & Room Details */}
      {step === 2 && (
        <div className="space-y-6 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs">
          {/* Active Policy Header Card with Quick Switcher */}
          <div className="p-3.5 bg-blue-50/80 border border-blue-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-blue-600 text-white">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">{policy?.policy_name || 'No Policy Selected'}</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-white text-blue-700 border border-blue-200">
                    {policy?.insurer_name}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Room Limit: <strong>{policy?.room_limit_type === 'none' ? 'No Sub-limit (Any Room)' : policy?.room_limit_type === 'fixed_daily' ? `${formatRupees(policy.room_limit_value)}/day` : `${policy?.room_limit_value}% of SI`}</strong> | Proportionate Deductions: <strong>{policy?.proportionate_deduction_applicable ? 'Active' : 'Waived'}</strong>
                </p>
              </div>
            </div>
            <button
              onClick={() => setStep(1)}
              className="px-3 py-1.5 rounded-lg bg-white border border-blue-300 text-blue-700 hover:bg-blue-100 font-bold text-xs transition shrink-0 self-start sm:self-auto cursor-pointer"
            >
              Change Policy
            </button>
          </div>

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
                placeholder="e.g. Sanjeevani Multispeciality Hospital, Manipal, Apollo"
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
                  onChange={(e) => {
                    const cat = e.target.value;
                    setRoomCategory(cat);
                    // auto-adjust suggested benchmark rates
                    if (cat === 'General Ward') setRoomRateRupees(2500);
                    else if (cat === 'Twin Sharing (Semi-Private)') setRoomRateRupees(4500);
                    else if (cat === 'Single Private Room') setRoomRateRupees(8000);
                    else if (cat === 'Deluxe Suite') setRoomRateRupees(15000);
                  }}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 bg-white"
                >
                  <option value="General Ward">General Ward (Benchmark ₹2,500/day)</option>
                  <option value="Twin Sharing (Semi-Private)">Twin Sharing / Semi-Private (Benchmark ₹4,500/day)</option>
                  <option value="Single Private Room">Single Private Room (Benchmark ₹8,000/day)</option>
                  <option value="Deluxe Suite">Deluxe Suite (Benchmark ₹15,000/day)</option>
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
          {/* Active Policy Header Card with Quick Switcher */}
          <div className="p-3.5 bg-blue-50/80 border border-blue-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-blue-600 text-white">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">{policy?.policy_name}</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-white text-blue-700 border border-blue-200">
                    {policy?.insurer_name}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Limit: <strong>{policy?.room_limit_type === 'none' ? 'No Sub-limit' : policy?.room_limit_type === 'fixed_daily' ? `${formatRupees(policy.room_limit_value)}/day` : `${policy?.room_limit_value}% of SI`}</strong> | Co-pay: <strong>{policy?.copay_percentage || 0}%</strong>
                </p>
              </div>
            </div>
            <button
              onClick={() => setStep(1)}
              className="px-3 py-1.5 rounded-lg bg-white border border-blue-300 text-blue-700 hover:bg-blue-100 font-bold text-xs transition shrink-0 self-start sm:self-auto cursor-pointer"
            >
              Change Policy
            </button>
          </div>

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
                Note: Under policies with proportionate deductions, these medical charges are scaled down if your room rate exceeds policy sub-limits.
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
            className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition-colors flex items-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous Step</span>
          </button>
        ) : (
          <div />
        )}

        <button
          onClick={handleNextStep}
          className="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-500 shadow-md shadow-blue-500/20 transition-all flex items-center gap-2 cursor-pointer"
        >
          <span>{step === 3 ? 'Review & Confirm Inputs' : 'Continue'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
