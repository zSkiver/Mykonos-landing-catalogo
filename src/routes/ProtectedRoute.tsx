import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { PageLoader } from '@/components/common/Spinner';
import type { Permissions } from '@/types';

interface Props {
  children: ReactNode;
  /** Permissão exigida; sem ela basta estar autenticado. */
  require?: keyof Permissions;
}

export function ProtectedRoute({ children, require }: Props) {
  const { user, permissions, loading } = useAuth();
  const location = useLocation();

  if (loading) return <PageLoader label="Verificando acesso" />;

  if (!user) {
    return <Navigate to="/admin/login" state={{ from: location.pathname }} replace />;
  }

  if (require && !permissions[require]) {
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
}
