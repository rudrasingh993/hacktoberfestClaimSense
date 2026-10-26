import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Calculator, UploadCloud,
  ClipboardCheck, Layers, ShieldCheck, FileText,
  Settings, Info, Sparkles
} from 'lucide-react';
import { useEstimate } from '../../context/EstimateContext';

interface NavItem {
  name: string;
  to: string;
  icon: React.ElementType;
  badge?: string;
}

const navItems: NavItem[] = [
  { name: 'Dashboard', to: '/', icon: LayoutDashboard },
  { name: 'New Estimate', to: '/estimate', icon: Calculator },
  { name: 'Upload Estimate', to: '/estimate/upload', icon: UploadCloud },
  { name: 'Review & Confirm', to: '/estimate/review', icon: ClipboardCheck },
  { name: 'Room Comparison', to: '/compare', icon: Layers },
  { name: 'Security Lab', to: '/security', icon: ShieldCheck, badge: '9/9' },
  { name: 'Policy Rules', to: '/policy', icon: FileText },
  { name: 'Local AI & Settings', to: '/settings', icon: Settings },
  { name: 'About ClaimSense', to: '/about', icon: Info },
];

export const Sidebar: React.FC = () => {
  const { loadDemoEstimate } = useEstimate();

  return (
    <aside className="w-64 border-r border-slate-200 bg-white flex flex-col justify-between shrink-0 min-h-[calc(100vh-65px)] no-print">
      <div className="p-4 space-y-6">
        {/* Navigation list */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-semibold shadow-xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 shrink-0 text-slate-500 group-hover:text-slate-800" />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Demo Fast-Action Card */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50/50 border border-blue-100">
          <div className="flex items-center gap-2 text-blue-900 font-bold text-xs uppercase tracking-wider mb-1.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Hacktoberfest 2026</span>
          </div>
          <p className="text-xs text-slate-600 mb-3 leading-relaxed">
            Load the ₹8,000/day single room vs. ₹5,000 limit case (₹63,000 family out-of-pocket).
          </p>
          <button
            onClick={loadDemoEstimate}
            className="w-full py-2 px-3 rounded-lg bg-white border border-blue-200 text-blue-700 font-semibold text-xs hover:bg-blue-600 hover:text-white shadow-xs transition-colors flex items-center justify-center gap-1.5"
          >
            <span>Load Core Scenario</span>
          </button>
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-100 text-xs text-slate-400">
        <p className="font-semibold text-slate-700">ClaimSense v1.0.0</p>
        <p>Pune × NIAT-ADYPU Hack Day</p>
      </div>
    </aside>
  );
};
