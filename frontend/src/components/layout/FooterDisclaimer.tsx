import React from 'react';
import { ShieldAlert, Cpu, Lock } from 'lucide-react';

export const FooterDisclaimer: React.FC = () => {
  return (
    <footer className="border-t border-slate-200 bg-white py-6 px-4 sm:px-8 text-xs text-slate-500 no-print">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-start gap-2.5 max-w-3xl">
          <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <p>
            <strong>Pre-Admission Claim Estimator:</strong> ClaimSense is an informational transparency tool designed to
            simulate room-rent limits, proportionate deductions, and co-payment clauses. It does not provide medical or legal
            advice and does not guarantee claim approval or settlement amounts. Final claim adjudication is determined exclusively
            by your insurance provider and network hospital TPA.
          </p>
        </div>
        <div className="flex items-center gap-4 text-slate-400 shrink-0">
          <span className="flex items-center gap-1.5 font-medium text-slate-600">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            100% Local AI & Private
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5 font-medium text-slate-600">
            <Cpu className="w-3.5 h-3.5 text-blue-600" />
            Deterministic Math
          </span>
        </div>
      </div>
    </footer>
  );
};
