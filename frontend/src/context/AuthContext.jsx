import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function initAuth() {
      try {
        const res = await api.getMe();
        if (res.data?.user) {
          setUser(res.data.user);
        }
      } catch {
        api.setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    initAuth();
  }, []);

  const login = async (username, password) => {
    const res = await api.login(username, password);
    if (res.data?.accessToken && res.data?.user) {
      api.setToken(res.data.accessToken);
      setUser(res.data.user);
    }
    return res;
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch {}
    api.setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const res = await api.getMe();
      if (res.data?.user) {
        setUser(res.data.user);
      }
    } catch {}
  };

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN',
    isSuperAdmin: user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN',
    isDeveloper: user?.role === 'DEVELOPER',
    hasFullAccess: user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN' || user?.role === 'DEVELOPER',
    canManage: user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN' || user?.role === 'DEVELOPER',
    isEmployee: user?.role === 'EMPLOYEE',
    login,
    logout,
    refreshUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
