import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('ems_admin_token');
    const savedUser = localStorage.getItem('ems_admin_user');
    if (savedToken && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('ems_admin_token');
        localStorage.removeItem('ems_admin_user');
      }
    }
    setLoading(false);
  }, []);

  const login = (token, userData) => {
    localStorage.setItem('ems_admin_token', token);
    localStorage.setItem('ems_admin_user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      localStorage.removeItem('ems_admin_token');
      localStorage.removeItem('ems_admin_user');
      setUser(null);
    }
  };

  // role helper — always normalized, avoids case-sensitivity bugs
  const hasRole = (...allowed) =>
    !!user?.role && allowed.map((r) => r.toLowerCase()).includes(user.role.toLowerCase());

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
