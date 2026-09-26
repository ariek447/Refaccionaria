import { Navigate, useLocation } from 'react-router';
import { useAuth } from '../auth/AuthContext.jsx';

/** Si no hay sesión, redirige a /login recordando la página solicitada. */
export default function RequireAuth({ children }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return children;
}
