import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { UserProvider } from './context/UserContext';
import { ThemeProvider } from './context/ThemeContext';
import { Toaster } from 'react-hot-toast';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import ScrollToTop from './components/shared/ScrollToTop';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import PricingPage from './pages/PricingPage';
import PropTracker from './pages/PropTracker';
import AuthPage from './pages/AuthPage';
import { PrivacyPolicy, TermsOfService, RiskDisclosure, CookiePolicy } from './pages/legal/LegalPages';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <UserProvider>
          <Router>
            <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-300">
              <ScrollToTop />
              <Navbar />
              <Toaster position="top-right" />
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
                <Route path="/prop-tracker" element={<PropTracker />} />
                <Route path="/login" element={<AuthPage type="login" />} />
                <Route path="/signup" element={<AuthPage type="signup" />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/terms" element={<TermsOfService />} />
                <Route path="/risk" element={<RiskDisclosure />} />
                <Route path="/cookies" element={<CookiePolicy />} />
                <Route path="/home" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </Router>
        </UserProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
