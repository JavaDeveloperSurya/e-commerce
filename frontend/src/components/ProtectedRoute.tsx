import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { PageLoader } from '@/components/Spinner';
import type { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  roles?: string[];
}

export function ProtectedRoute({ children, roles }: ProtectedRouteProps) {
  const { user, activeRole, isLoading, isAuthenticated } = useAuth();

  if (isLoading) return <PageLoader />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  
  const effectiveRole = activeRole || user?.role;
  if (roles && effectiveRole && !roles.includes(effectiveRole)) return <Navigate to="/" replace />

  return <>{children}</>;
}
