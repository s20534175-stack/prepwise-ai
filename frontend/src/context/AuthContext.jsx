import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user on app start
  useEffect(() => {
    const token = localStorage.getItem('prepwise_token');
    const savedUser = localStorage.getItem('prepwise_user');
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
      // Validate token in background
      authAPI.getMe()
        .then(res => setUser(res.data.user))
        .catch(() => logout())
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    const { token, user: userData, message } = res.data;
    localStorage.setItem('prepwise_token', token);
    localStorage.setItem('prepwise_user', JSON.stringify(userData));
    setUser(userData);
    toast.success(message);
    return userData;
  };

  const register = async (name, email, password, targetRole) => {
    const res = await authAPI.register({ name, email, password, targetRole });
    const { token, user: userData, message } = res.data;
    localStorage.setItem('prepwise_token', token);
    localStorage.setItem('prepwise_user', JSON.stringify(userData));
    setUser(userData);
    toast.success(message);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('prepwise_token');
    localStorage.removeItem('prepwise_user');
    setUser(null);
  };

  const updateUser = (updates) => {
    const updated = { ...user, ...updates };
    setUser(updated);
    localStorage.setItem('prepwise_user', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
