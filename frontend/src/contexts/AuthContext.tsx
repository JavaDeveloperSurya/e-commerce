import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { authApi, userApi } from '@/lib/api';
import type { User } from '../lib/types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string) => Promise<{ token: string }>;
  verifyOtp: (token: string, otp: string) => Promise<void>;
  resendOtp: (token: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setUser(null);
        return;
      }
      const data = await userApi.getProfile();
       setUser(data.user || data.data || null);
    } catch {
      setUser(null);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  }, []);

  useEffect(() => {
    fetchProfile().finally(() => setIsLoading(false));
  }, [fetchProfile]);

  const login = async (email: string) => {
    const data = await authApi.login(email);
    return { token: data.Token || data.token || '' };
  };

  const verifyOtp = async (token: string, otp: string) => {
    const data = await authApi.verifyOtp(token, otp);
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    await fetchProfile();
  };

  const resendOtp = async (token: string) => {
    await authApi.resendOtp(token);
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore logout failure
    }
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        verifyOtp,
        resendOtp,
        logout,
        refreshProfile: fetchProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
