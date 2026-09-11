import { Alert } from '@mui/material';

import { useAuth } from '../../context/AuthContext';

import AdminDashboard from '../../components/Dashboard/admin/AdminDashboard';
import HRDashboard from '../../components/Dashboard/hr/HRDashboard';
import ManagerDashboard from '../../components/Dashboard/manager/ManagerDashboard';

const Dashboard = () => {
  const { hasRole } = useAuth();

  if (hasRole('Admin')) {
    return <AdminDashboard />;
  }

  if (hasRole('HR')) {
    return <HRDashboard />;
  }

  if (hasRole('Manager')) {
    return <ManagerDashboard />;
  }

  return (
    <Alert severity="warning">
      Unauthorized role access.
    </Alert>
  );
};

export default Dashboard;