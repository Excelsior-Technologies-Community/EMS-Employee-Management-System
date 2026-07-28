import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/common/Loader';

/**
 * Wrap a route element. Pass `roles` to additionally restrict by role
 * (e.g. roles={['Admin']} for Departments/Roles pages).
 */
const ProtectedRoute = ({ children, roles }) => {
  const { user, loading, hasRole } = useAuth();

  if (loading) return <Loader label="Checking session..." minHeight="100vh" />;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !hasRole(...roles)) return <Navigate to="/unauthorized" replace />;

  return children;
};

export default ProtectedRoute;
