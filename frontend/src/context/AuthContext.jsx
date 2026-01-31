import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import { setTokens, removeTokens, isAuthenticated } from '../utils/auth';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    if (!isAuthenticated()) {
      setLoading(false);
      return;
    }

    try {
      const response = await authAPI.profile();
      setUser(response.data.data);
    } catch (_) {
      removeTokens();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setError(null);
      const response = await authAPI.login({ email, password });
      const { access, refresh, user: userData } = response.data;
      setTokens(access, refresh);
      setUser(userData);
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.error?.message || 'Login failed';
      setError(message);
      return { success: false, error: message };
    }
  };

  const register = async (userData) => {
    try {
      setError(null);
      const response = await authAPI.register(userData);
      return { success: true, data: response.data };
    } catch (err) {
      const message = err.response?.data?.error?.message || 'Registration failed';
      setError(message);
      return { success: false, error: message };
    }
  };

  const logout = async () => {
    try {
      const refresh = localStorage.getItem('refreshToken');
      if (refresh) {
        await authAPI.logout({ refresh });
      }
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      removeTokens();
      setUser(null);
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
