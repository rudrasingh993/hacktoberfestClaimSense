import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  ShieldCheck, Cpu, Globe, AlertCircle,
  CheckCircle2, Sparkles, RefreshCw
} from 'lucide-react';
import { useEstimate } from '../../context/EstimateContext';

export const TopNavigation: React.FC = () => {
  const { aiStatus, language, setLanguage, refreshStatus } = useEstimate();
  const [refreshing, setRefreshing] = React.useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshStatus();
    setTimeout(() => setRefreshing(false), 600);
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-8 py-3.5 no-print">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
                ClaimSense
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                Offline AI
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              Health Insurance Pre-Admission Estimator
            </p>
          </div>
        </Link>

        {/* Right side controls */}
        <div className="flex items-center gap-3">
          {/* Local AI status badge */}
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border ${
              aiStatus?.ollama_available && aiStatus?.model_available
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : aiStatus?.ollama_available
                ? 'bg-amber-50 text-amber-800 border-amber-200'
                : 'bg-slate-100 text-slate-700 border-slate-200'
            }`}
          >
            <span className="relative flex h-2 w-2">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  aiStatus?.ollama_available ? 'bg-emerald-400' : 'bg-slate-400'
                }`}
              />
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  aiStatus?.ollama_available ? 'bg-emerald-500' : 'bg-slate-500'
                }`}
              />
            </span>
            <div className="hidden md:flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5" />
              <span>
                {aiStatus?.ollama_available
                  ? `Ollama: ${aiStatus.model_name}`
                  : 'Deterministic Offline Mode'}
              </span>
            </div>
            <button
              onClick={handleRefresh}
              title="Refresh AI & Ollama Status"
              className="hover:opacity-75 transition-opacity ml-1"
            >
              <RefreshCw className={`w-3 h-3 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Language Selector */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
            <Globe className="w-3.5 h-3.5 text-slate-500 ml-1.5 hidden sm:block" />
            <button
              onClick={() => setLanguage('en')}
              className={`px-2 py-1 rounded font-medium transition-colors ${
                language === 'en'
                  ? 'bg-white text-blue-700 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage('hi')}
              className={`px-2 py-1 rounded font-medium transition-colors ${
                language === 'hi'
                  ? 'bg-white text-blue-700 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              हिंदी
            </button>
            <button
              onClick={() => setLanguage('mr')}
              className={`px-2 py-1 rounded font-medium transition-colors ${
                language === 'mr'
                  ? 'bg-white text-blue-700 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              मराठी
            </button>
          </div>

          {/* Quick Demo Button */}
          <Link
            to="/estimate"
            className="hidden lg:flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 text-white font-semibold text-xs hover:bg-blue-700 shadow-xs transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-200" />
            <span>New Estimate</span>
          </Link>
        </div>
      </div>
    </header>
  );
};
