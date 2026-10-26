import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { EstimateProvider } from './context/EstimateContext';
import { AppShell } from './components/layout/AppShell';

import { DashboardPage } from './pages/DashboardPage';
import { EstimatePage } from './pages/EstimatePage';
import { UploadPage } from './pages/UploadPage';
import { ReviewPage } from './pages/ReviewPage';
import { ResultsPage } from './pages/ResultsPage';
import { ComparePage } from './pages/ComparePage';
import { SecurityPage } from './pages/SecurityPage';
import { PolicyPage } from './pages/PolicyPage';
import { SettingsPage } from './pages/SettingsPage';
import { AboutPage } from './pages/AboutPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <EstimateProvider>
        <Routes>
          <Route element={<AppShell />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/estimate" element={<EstimatePage />} />
            <Route path="/estimate/upload" element={<UploadPage />} />
            <Route path="/estimate/review" element={<ReviewPage />} />
            <Route path="/results/:id" element={<ResultsPage />} />
            <Route path="/compare" element={<ComparePage />} />
            <Route path="/security" element={<SecurityPage />} />
            <Route path="/policy" element={<PolicyPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </EstimateProvider>
    </BrowserRouter>
  );
};

export default App;
