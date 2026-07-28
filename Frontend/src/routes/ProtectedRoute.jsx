import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/common/Loader';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <Loader label="Checking session..." minHeight="100vh" />;
  if (!user) return <Navigate to="/login" replace />;

  return children;
};

export default ProtectedRoute;
