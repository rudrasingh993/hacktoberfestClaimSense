import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck, Calculator, UploadCloud, Layers,
  CheckCircle2, ArrowRight, Sparkles, HelpCircle,
  AlertTriangle, Lock, Cpu, Eye, FileText, TrendingDown
} from 'lucide-react';
import { useEstimate } from '../context/EstimateContext';
import { formatRupees } from '../utils/formatters';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { aiStatus, loadDemoEstimate } = useEstimate();

  const handleStartDemo = () => {
    loadDemoEstimate();
    navigate('/estimate/review');
  };

  return (
    <div className="space-y-10 pb-12">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 p-8 sm:p-12 text-white shadow-xl">
        <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-80 h-80 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            Hacktoberfest 2026 • Pune × NIAT-ADYPU
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            Know your hospital bill <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-indigo-200">
              before hospital admission.
            </span>
          </h1>

          <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
            Indian health insurance policies contain hidden room-rent sub-limits. Choosing a room just ₹3,000 above your limit
            can penalize your entire bill by 37.5%. ClaimSense uses offline local AI and exact Python arithmetic to calculate
            your real out-of-pocket costs before you check in.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              to="/estimate"
              className="px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2 group"
            >
              <span>Start New Estimate</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <button
              onClick={handleStartDemo}
              className="px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm border border-white/20 backdrop-blur-md transition-all flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-cyan-300" />
              <span>Try ₹63,000 Demo Scenario</span>
            </button>
          </div>

          {/* Privacy & Engine Badges */}
          <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-white/10 text-xs text-slate-300">
            <div className="flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-emerald-400" />
              <span>Zero Cloud Leaks: Runs on local Ollama</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-blue-400" />
              <span>Gemma 4 Multimodal + Python Engine</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>Deterministic Financial Truth</span>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Illustrative Scenario Showcase */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">The Problem Solved</span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-0.5">
              How a ₹3,000 Room Upgrade Costs You ₹63,000
            </h2>
          </div>
          <button
            onClick={handleStartDemo}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
          >
            Review Full Calculation Trace →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
          {/* Box 1: Hospital Bill */}
          <div className="p-5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Hospital Estimate</span>
            <div className="text-2xl font-extrabold text-slate-900">₹1,44,000</div>
            <ul className="text-xs text-slate-600 space-y-1.5 pt-1">
              <li className="flex justify-between">
                <span>Room (3 days @ ₹8,000/day):</span>
                <span className="font-semibold text-slate-800">₹24,000</span>
              </li>
              <li className="flex justify-between">
                <span>OT, Surgeon & Nursing Fees:</span>
                <span className="font-semibold text-slate-800">₹1,20,000</span>
              </li>
              <li className="flex justify-between border-t border-slate-200 pt-1">
                <span>Policy Room Rent Limit:</span>
                <span className="font-semibold text-rose-600">₹5,000 / day</span>
              </li>
            </ul>
          </div>

          {/* Box 2: Proportionate Penalty */}
          <div className="p-5 rounded-xl bg-amber-50/60 border border-amber-200/80 space-y-3">
            <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">The Hidden Penalty</span>
            <div className="text-2xl font-extrabold text-amber-900">37.5% Deducted</div>
            <p className="text-xs text-amber-800 leading-relaxed">
              Because room exceeded limit, eligibility ratio is <strong>₹5,000 / ₹8,000 = 0.625</strong>. Insurer cuts associated charges:
            </p>
            <div className="p-2.5 rounded-lg bg-white/80 border border-amber-200 text-xs font-mono text-amber-950">
              ₹1,20,000 × 0.625 = ₹75,000 eligible (₹45,000 lost!)
            </div>
          </div>

          {/* Box 3: Final Split */}
          <div className="p-5 rounded-xl bg-blue-50/60 border border-blue-200/80 space-y-3">
            <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider">Estimated Financial Split</span>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-600">Insurer Reimbursement (after 10% co-pay):</span>
                <span className="font-bold text-emerald-600 text-base">₹81,000</span>
              </div>
              <div className="flex items-center justify-between border-t border-blue-200 pt-2">
                <span className="text-xs font-bold text-slate-900">Family Out-of-Pocket:</span>
                <span className="font-extrabold text-rose-600 text-xl">₹63,000</span>
              </div>
            </div>
            <div className="text-[11px] text-slate-500 italic">
              Choosing a ₹4,500 semi-private room saves ₹49,650 in out-of-pocket costs!
            </div>
          </div>
        </div>
      </div>

      {/* Feature Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/compare"
          className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all group"
        >
          <div className="w-11 h-11 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Layers className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-1.5 flex items-center gap-2">
            <span>Room Category Comparison</span>
            <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-blue-600" />
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Instantly compare General Ward, Twin Sharing, Single Room, and Deluxe Suite. Find the exact sweet-spot room category that minimizes your family's expense.
          </p>
        </Link>

        <Link
          to="/estimate/upload"
          className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all group"
        >
          <div className="w-11 h-11 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <UploadCloud className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-1.5 flex items-center gap-2">
            <span>AI Document & Image Extraction</span>
            <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-cyan-600" />
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Upload hospital pre-admission estimates, quotes, or policy pages. Local multimodal Gemma 4 extracts candidate fields without transmitting data to the cloud.
          </p>
        </Link>

        <Link
          to="/security"
          className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all group"
        >
          <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-1.5 flex items-center gap-2">
            <span>Security & Verification Lab</span>
            <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-emerald-600" />
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Three mandatory gates ensure the AI cannot execute arbitrary code, fabricate tools, or alter math. Run the live verification suite with 9/9 real passing checks.
          </p>
        </Link>
      </div>
    </div>
  );
};
