import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

interface AdminRouteProps {
  children: React.ReactNode;
}

export function AdminRoute({ children }: AdminRouteProps) {
  const { user } = useAuthStore();

  if (!user) {
    // Se l'utente non è loggato, reindirizza alla pagina di login
    return <Navigate to="/login" replace />;
  }

  if (user.ruolo !== 'admin' && user.ruolo !== 'manager') {
    // Se l'utente non è admin o manager, reindirizza a una pagina di accesso negato o home
    return <Navigate to="/home" replace />;
  }

  return <>{children}</>;
}


