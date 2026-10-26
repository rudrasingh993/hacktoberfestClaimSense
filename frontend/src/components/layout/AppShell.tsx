import React from 'react';
import { Outlet } from 'react-router-dom';
import { TopNavigation } from './TopNavigation';
import { Sidebar } from './Sidebar';
import { FooterDisclaimer } from './FooterDisclaimer';
import { AICopilotDrawer } from '../shared/AICopilotDrawer';

export const AppShell: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <TopNavigation />
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-8 max-w-5xl overflow-y-auto">
          <Outlet />
        </main>
      </div>
      <FooterDisclaimer />
      <AICopilotDrawer />
    </div>
  );
};
