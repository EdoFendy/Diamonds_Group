import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

interface AdminRouteProps {
  children: React.ReactNode;
}

export function AdminRoute({ children }: AdminRouteProps) {
  const { user, isLoading } = useAuthStore();

  if (isLoading) {
    return <div>Caricamento...</div>;
  }

  if (!user || user.ruolo !== 'admin') {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
}