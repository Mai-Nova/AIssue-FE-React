import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import OAuthCallback from './pages/OAuthCallback';
import TermsOfServicePage from './pages/TermsOfServicePage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import CookiePolicyPage from './pages/CookiePolicyPage';
import { SidebarProvider } from './contexts/SidebarContext';
import authUtils from './utils/auth';
import ProtectedRoutes from './routes/ProtectedRoutes';

function App() {
  const [loggedIn, setLoggedIn] = useState(authUtils.isLoggedIn());
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const checkLogin = () => setLoggedIn(authUtils.isLoggedIn());
    window.addEventListener('storage', checkLogin);
    window.addEventListener('loginStateChanged', checkLogin);
    setChecked(true);
    return () => {
      window.removeEventListener('storage', checkLogin);
      window.removeEventListener('loginStateChanged', checkLogin);
    };
  }, []);

  if (!checked) return null;

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-background text-foreground">
        <Routes>
          <Route
            path="/"
            element={
              loggedIn ? <Navigate to="/dashboard" replace /> : <HomePage />
            }
          />
          <Route
            path="/login"
            element={
              loggedIn ? <Navigate to="/dashboard" replace /> : <LoginPage />
            }
          />
          <Route path="/oauth/callback" element={<OAuthCallback />} />
          <Route path="/terms-of-service" element={<TermsOfServicePage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
          <Route path="/cookie-policy" element={<CookiePolicyPage />} />
          <Route
            path="*"
            element={
              loggedIn ? <ProtectedRoutes /> : <Navigate to="/login" replace />
            }
          />
        </Routes>
      </div>
    </SidebarProvider>
  );
}

export default App;
