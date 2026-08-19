import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { AppLayout } from './components/AppLayout';
import { AutoLogoutModal } from './components/AutoLogoutModal';

import { DashboardPage } from './pages/DashboardPage';
import { IngestionPage } from './pages/IngestionPage';
import { RulesPage } from './pages/RulesPage';
import { FlagsPage } from './pages/FlagsPage';
import { EnumeratorPage } from './pages/EnumeratorPage';
import { ModelsPage } from './pages/ModelsPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';
import { SecurityPage } from './pages/SecurityPage';

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AutoLogoutModal />
          <Routes>
            {/* Public Landing Site */}
            <Route path="/" element={<LandingPage />} />

            {/* Authentication */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />

            {/* Authenticated Platform App Shell */}
            <Route path="/app" element={<AppLayout />}>
              <Route index element={<Navigate to="/app/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="ingestion" element={<IngestionPage />} />
              <Route path="rules" element={<RulesPage />} />
              <Route path="flags" element={<FlagsPage />} />
              <Route path="enumerators" element={<EnumeratorPage />} />
              <Route path="models" element={<ModelsPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="security" element={<SecurityPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

