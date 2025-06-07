import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardPage from '../pages/DashboardPage';
import RepositoriesPage from '../pages/RepositoriesPage';
import RepositoryPage from '../pages/RepositoryPage';
import IssuePage from '../pages/IssuePage';
import IssuesPage from '../pages/IssuesPage';
import ProfilePage from '../pages/ProfilePage';
import SettingsPage from '../pages/SettingsPage';
import PrivacyPolicyPage from '../pages/PrivacyPolicyPage';
import TermsOfServicePage from '../pages/TermsOfServicePage';
import CookiePolicyPage from '../pages/CookiePolicyPage';
import PaymentResultPage from '../pages/PaymentResultPage';
import { useNotification } from '../hooks/use-notification';
import { NotificationContext } from '../contexts/notificationContext';

export default function ProtectedRoutes() {
  const notification = useNotification();
  return (
    <NotificationContext.Provider value={notification}>
      <Routes>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/repositories" element={<RepositoriesPage />} />
        <Route path="/repository/:id" element={<RepositoryPage />} />
        <Route path="/repository/:id/issue/:issueId" element={<IssuePage />} />
        <Route path="/issues" element={<IssuesPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
        <Route path="/terms-of-service" element={<TermsOfServicePage />} />
        <Route path="/cookie-policy" element={<CookiePolicyPage />} />
        <Route path="/payment/success" element={<PaymentResultPage />} />
        <Route path="/payment/fail" element={<PaymentResultPage />} />
        <Route
          path="*"
          element={<Navigate to="/profile?tab=subscription" replace />}
        />
      </Routes>
    </NotificationContext.Provider>
  );
}
