import {
  ShieldCheck, Cpu, Lock, CheckCircle2,
  AlertTriangle, HeartHandshake, Award
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold uppercase tracking-wider mb-2">
          Hacktoberfest 2026 Hack Day
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          About ClaimSense
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          The Offline AI Health Insurance Claim Estimator for Indian Families.
        </p>
      </div>

      {/* The Problem & The Solution */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900 mb-2">The Problem: Hidden Room-Rent Traps</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            In India, most health insurance policies contain room-rent sub-limits (e.g. 1% of Sum Insured or ₹5,000/day).
            When a patient is admitted to an ₹8,000/day room, insurers do not just ask the family to pay the ₹3,000 room difference.
            Instead, through <strong>proportionate deductions</strong>, the insurer cuts surgeon fees, operation theatre costs,
            anaesthetist fees, and nursing charges by the room ratio (₹5,000 / ₹8,000 = 0.625).
            A ₹1,44,000 hospital bill quickly leads to an unexpected ₹63,000 out-of-pocket shock.
          </p>
        </div>

        <div className="pt-4 border-t border-slate-100">
          <h2 className="text-lg font-bold text-slate-900 mb-2">The Solution: ClaimSense</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            ClaimSense gives families full pre-admission financial clarity. By combining local multimodal language models
            (Gemma 4 via Ollama) with an authoritative deterministic Python calculation engine, ClaimSense allows families to:
          </p>
          <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-5 mt-2">
            <li>Extract charges directly from hospital pre-admission cost sheets without cloud uploads.</li>
            <li>Enforce exact mathematical deduction rules without AI hallucinations.</li>
            <li>Simulate multiple room categories to choose the room that saves the family money.</li>
            <li>Generate printable transparent audit reports for hospital billing desks.</li>
          </ul>
        </div>
      </div>

      {/* Architecture Highlights */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-slate-900">Why Local AI & Python Arithmetic?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-blue-600" />
              <span>Language Models are for Language</span>
            </div>
            <p className="text-slate-500 leading-relaxed">
              Ollama + Gemma 4 handles document understanding, extracting candidate policy rules, and generating plain-language explanations in English, Hindi, and Marathi.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Python is for Financial Truth</span>
            </div>
            <p className="text-slate-500 leading-relaxed">
              Every rupee is calculated deterministically with integer paise and Decimal rounding. The model is strictly prohibited from performing financial arithmetic.
            </p>
          </div>
        </div>
      </div>

      {/* Event Details */}
      <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-2xl shadow-xl space-y-3">
        <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-wider">
          <Award className="w-4 h-4" />
          <span>Hacktoberfest 2026 Hack Day Submission</span>
        </div>
        <h3 className="text-xl font-bold">Pune × NIAT-ADYPU Hack Day (October 26, 2026)</h3>
        <p className="text-xs text-slate-300 leading-relaxed">
          Built under the project categories of <strong>Local AI</strong>, <strong>Open Source</strong>,{' '}
          <strong>Healthcare Technology</strong>, and <strong>Financial Transparency</strong>.
        </p>
        <div className="pt-2 flex items-center gap-4 text-xs text-slate-400">
          <span>License: MIT</span>
          <span>•</span>
          <span>Open Source Readiness</span>
        </div>
      </div>
    </div>
  );
};
