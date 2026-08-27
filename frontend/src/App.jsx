import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Web pages
import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import ContactUs from './pages/ContactUs';

// Auth pages
import Login from './pages/Login';
import Forgot from './pages/Forgot';
import VerifyCode from './pages/VerifyCode';
import ResetPassword from './pages/ResetPassword';

// Dashboard pages
import DashboardRedirect from './pages/DashboardRedirect';
import DashboardAdmin from './pages/DashboardAdmin';
import DashboardManager from './pages/DashboardManager';
import DashboardClient from './pages/DashboardClient';
import ConsultationsAdmin from './pages/ConsultationsAdmin';
import ConsultationsManager from './pages/ConsultationsManager';
import UsersAdmin from './pages/UsersAdmin';
import UsersManager from './pages/UsersManager';
import Requests from './pages/Requests';
import Help from './pages/Help';

function App() {
  const { user, loading } = useAuth();

  if (loading) return null;

  return (
    <Routes>
      {/* Public web pages */}
      <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/services" element={<Services />} />
      <Route path="/contact-us" element={<ContactUs />} />

      {/* Auth pages */}
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/forgot" element={<Forgot />} />
      <Route path="/verify-code" element={<VerifyCode />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Dashboard - redirects based on role */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardRedirect />
          </ProtectedRoute>
        }
      />
      <Route
        path="/client"
        element={
          <ProtectedRoute roles={['client']}>
            <DashboardClient />
          </ProtectedRoute>
        }
      />
      <Route
        path="/requests"
        element={
          <ProtectedRoute roles={['admin', 'manager']}>
            <Requests />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute roles={['admin', 'manager']}>
            <UsersAdmin />
          </ProtectedRoute>
        }
      />
      <Route
        path="/consultations"
        element={
          <ProtectedRoute roles={['admin', 'manager']}>
            <ConsultationsAdmin />
          </ProtectedRoute>
        }
      />
      <Route
        path="/help"
        element={
          <ProtectedRoute>
            <Help />
          </ProtectedRoute>
        }
      />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
