import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { authApi, userApi } from '@/lib/api';
import type { User } from '../lib/types';

type AppRole = 'buyer' | 'seller' | 'admin';
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  activeRole: AppRole | null;
  availableRoles: AppRole[];
  setActiveRole: (role: AppRole) => void;
  login: (email: string) => Promise<{ token: string }>;
  verifyOtp: (token: string, otp: string) => Promise<void>;
  resendOtp: (token: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);
const ACTIVE_ROLE_KEY = 'activeRole';

function getAvailableRoles(user: User | null): AppRole[] {
  if (!user) return [];
  if (user.role === 'seller') return ['buyer', 'seller'];
  return [user.role];
}

function getDefaultRole(user: User | null): AppRole | null {
  if (!user) return null;
  return user.role === 'seller' ? 'seller' : user.role;
}
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeRole, setActiveRoleState] = useState<AppRole | null>(null);

  const syncActiveRole = useCallback((nextUser: User | null) => {
    const roles = getAvailableRoles(nextUser);
    const storedRole = localStorage.getItem(ACTIVE_ROLE_KEY) as AppRole | null;
    const nextRole = storedRole && roles.includes(storedRole) ? storedRole : getDefaultRole(nextUser);

    setActiveRoleState(nextRole);

    if (nextRole) {
      localStorage.setItem(ACTIVE_ROLE_KEY, nextRole);
    } else {
      localStorage.removeItem(ACTIVE_ROLE_KEY);
    }
  }, [])
  const fetchProfile = useCallback(async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setUser(null);
        syncActiveRole(null);
        return;
      }
      const data = await userApi.getProfile();
       const nextUser = data.user || data.data || null;
      setUser(nextUser);
      syncActiveRole(nextUser);
    } catch {
      setUser(null);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  }, [syncActiveRole]);

  useEffect(() => {
    fetchProfile().finally(() => setIsLoading(false));
  }, [fetchProfile]);
  const setActiveRole = (role: AppRole) => {
    if (!user) return;
    const roles = getAvailableRoles(user);
    if (!roles.includes(role)) return;
    setActiveRoleState(role);
    localStorage.setItem(ACTIVE_ROLE_KEY, role);
  };
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
  const availableRoles = getAvailableRoles(user);
  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        activeRole,
        availableRoles,
        setActiveRole,
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
