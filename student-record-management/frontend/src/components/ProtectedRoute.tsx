import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { Role } from '../types';
import Spinner from './Spinner';

interface Props {
  allowedRoles?: Role[];
}

// Guards a route subtree: redirects to /login if unauthenticated, or to /unauthorized
// if the user's role isn't in allowedRoles.
const ProtectedRoute = ({ allowedRoles }: Props) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
