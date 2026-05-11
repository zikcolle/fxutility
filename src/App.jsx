import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { AuthProvider } from './context/AuthContext';
import { CreditProvider } from './context/CreditContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import ScrollToTop from './components/shared/ScrollToTop';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import PricingPage from './pages/PricingPage';
import AuthPage from './pages/AuthPage';
import { PrivacyPolicy, TermsOfService, RiskDisclosure, CookiePolicy } from './pages/legal/LegalPages';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CreditProvider>
          <Router>
            <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-300">
              <ScrollToTop />
              <Navbar />
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route 
                  path="/dashboard/*" 
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route path="/pricing" element={<PricingPage />} />
                <Route path="/login" element={<AuthPage type="login" />} />
                <Route path="/signup" element={<AuthPage type="signup" />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/terms" element={<TermsOfService />} />
                <Route path="/risk" element={<RiskDisclosure />} />
                <Route path="/cookies" element={<CookiePolicy />} />
                <Route path="/home" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
            <Analytics />
          </Router>
        </CreditProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
