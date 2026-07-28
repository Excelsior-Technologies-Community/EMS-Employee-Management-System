import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import AdminLayout from '../layouts/AdminLayout';
import Login from '../pages/auth/Login';
import Unauthorized from '../pages/auth/Unauthorized';
import Dashboard from '../pages/dashboard/Dashboard';
import EmployeeList from '../pages/employees/EmployeeList';
import DepartmentList from '../pages/departments/DepartmentList';
import RoleList from '../pages/roles/RoleList';
import Profile from '../pages/profile/Profile';
import ChangePassword from '../pages/profile/ChangePassword';

const withLayout = (page, roles) => (
  <ProtectedRoute roles={roles}>
    <AdminLayout>{page}</AdminLayout>
  </ProtectedRoute>
);

const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={<Login />} />
    <Route path="/unauthorized" element={<Unauthorized />} />

    {/* Admin, HR, Manager */}
    <Route path="/dashboard" element={withLayout(<Dashboard />, ['Admin', 'HR', 'Manager'])} />
    <Route path="/employees" element={withLayout(<EmployeeList />, ['Admin', 'HR', 'Manager'])} />
    <Route path="/profile" element={withLayout(<Profile />, ['Admin', 'HR', 'Manager'])} />
    <Route path="/change-password" element={withLayout(<ChangePassword />, ['Admin', 'HR', 'Manager'])} />

    {/* Admin only */}
    <Route path="/departments" element={withLayout(<DepartmentList />, ['Admin'])} />
    <Route path="/roles" element={withLayout(<RoleList />, ['Admin'])} />

    <Route path="/" element={<Navigate to="/dashboard" replace />} />
    <Route path="*" element={<Navigate to="/dashboard" replace />} />
  </Routes>
);

export default AppRoutes;
