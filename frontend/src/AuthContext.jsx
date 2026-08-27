import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from './api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const res = await authAPI.me();
      if (res.ok) {
        const data = await res.json();
        setUser(data.user || data);
      } else {
        localStorage.removeItem('token');
      }
    } catch (e) {
      localStorage.removeItem('token');
    }
    setLoading(false);
  };

  const login = async (credentials) => {
    const res = await authAPI.login(credentials);
    const data = await res.json();
    if (data.success && data.token) {
      localStorage.setItem('token', data.token);
      setUser(data.user);
    }
    return data;
  };

  const signup = async (userData) => {
    const res = await authAPI.signup(userData);
    return await res.json();
  };

  const logout = async () => {
    try { await authAPI.logout(); } catch (e) {}
    localStorage.removeItem('token');
    setUser(null);
  };

  const value = { user, loading, login, signup, logout, checkAuth };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
