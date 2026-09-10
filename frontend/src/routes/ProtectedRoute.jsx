import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ roles = [] }) => {
  const { user } = useAuth();
  const location = useLocation();
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  if (roles.length > 0 && !roles.includes(user.rol)) return <Navigate to="/" replace />;
  return <Outlet />;
};