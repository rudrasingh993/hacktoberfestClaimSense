import React from 'react';
import { Outlet } from 'react-router-dom';
import { TopNavigation } from './TopNavigation';
import { Sidebar } from './Sidebar';
import { FooterDisclaimer } from './FooterDisclaimer';
import { AICopilotDrawer } from '../shared/AICopilotDrawer';

export const AppShell: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 print:min-h-0 print:block print:bg-white print:p-0">
      <TopNavigation />
      <div className="flex-1 flex max-w-7xl w-full mx-auto print:block print:w-full print:max-w-none print:m-0">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-8 max-w-5xl overflow-y-auto print:p-0 print:m-0 print:max-w-none print:overflow-visible print:block">
          <Outlet />
        </main>
      </div>
      <FooterDisclaimer />
      <AICopilotDrawer />
    </div>
  );
};
