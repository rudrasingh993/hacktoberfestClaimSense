import React from 'react';
import {
  Settings, Cpu, Lock, ShieldCheck, Globe,
  RotateCcw, CheckCircle2, AlertCircle, RefreshCw
} from 'lucide-react';
import { useEstimate } from '../context/EstimateContext';

export const SettingsPage: React.FC = () => {
  const { aiStatus, language, setLanguage, resetEstimate, refreshStatus } = useEstimate();

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Local AI & Privacy Settings
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Inspect your offline AI runtime configuration, verify privacy guarantees, and manage application state.
        </p>
      </div>

      {/* Ollama Status Card */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Ollama Local Inference Runtime</h2>
              <p className="text-xs text-slate-500">Self-hosted on loopback 127.0.0.1:11434</p>
            </div>
          </div>
          <button
            onClick={() => refreshStatus()}
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
            title="Refresh status"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Service Status</span>
            <span
              className={`font-bold ${
                aiStatus?.ollama_available ? 'text-emerald-700' : 'text-rose-600'
              }`}
            >
              {aiStatus?.ollama_available ? 'Connected (Online)' : 'Offline / Unreachable'}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Configured Model</span>
            <span className="font-bold text-slate-900">{aiStatus?.model_name || 'gemma4:e4b'}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Model Installed</span>
            <span
              className={`font-bold ${
                aiStatus?.model_available ? 'text-emerald-700' : 'text-amber-600'
              }`}
            >
              {aiStatus?.model_available ? 'Ready (6.6 GB Loaded)' : 'Pending Download'}
            </span>
          </div>
        </div>

        {aiStatus?.instructions && (
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
            {aiStatus.instructions}
          </div>
        )}
      </div>

      {/* Privacy Guarantee Card */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Privacy & Data Boundary Safeguards</h2>
            <p className="text-xs text-slate-500">Your health and financial documents never leave your device</p>
          </div>
        </div>

        <div className="space-y-2 text-xs text-slate-600 leading-relaxed">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>No external cloud AI APIs (zero requests to OpenAI, Google Cloud Gemini, or Anthropic).</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Uploaded estimate images are decoded in-memory and cleaned up immediately after inference.</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>No user tracking, advertising trackers, or external analytics scripts.</span>
          </div>
        </div>
      </div>

      {/* Application State & Reset */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-slate-900">Application State Management</h2>
        <div className="flex items-center justify-between pt-2">
          <div>
            <h4 className="font-bold text-xs text-slate-900">Reset Local Session</h4>
            <p className="text-xs text-slate-400">Clears current estimate inputs, confirmation tokens, and cache.</p>
          </div>
          <button
            onClick={() => resetEstimate()}
            className="px-4 py-2 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 font-semibold text-xs transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Session</span>
          </button>
        </div>
      </div>
    </div>
  );
};
