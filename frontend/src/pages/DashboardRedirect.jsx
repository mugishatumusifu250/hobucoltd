import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import DashboardAdmin from './DashboardAdmin';
import DashboardManager from './DashboardManager';

const DashboardRedirect = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && user.role === 'client') {
      navigate('/client', { replace: true });
    }
  }, [user, navigate]);

  if (!user) return null;

  if (user.role === 'client') return null;

  if (user.role === 'admin') return <DashboardAdmin />;

  if (user.role === 'manager') return <DashboardManager />;

  return null;
};

export default DashboardRedirect;
