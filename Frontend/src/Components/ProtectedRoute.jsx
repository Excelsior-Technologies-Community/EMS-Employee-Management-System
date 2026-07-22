import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// roles array pass karo jo is route ko access kar sakein
const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (!user) return <Navigate to="/login" replace />;

  if (roles && !roles.map(r => r.toLowerCase()).includes(user.role?.toLowerCase())) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;
