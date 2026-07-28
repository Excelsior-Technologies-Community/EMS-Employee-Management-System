import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import MainLayout from '../layouts/MainLayout';
import Login from '../pages/auth/Login';
import Dashboard from '../pages/dashboard/Dashboard';
import MyProfile from '../pages/profile/MyProfile';
import EditProfile from '../pages/profile/EditProfile';
import ChangePassword from '../pages/profile/ChangePassword';

const withLayout = (page) => (
  <ProtectedRoute>
    <MainLayout>{page}</MainLayout>
  </ProtectedRoute>
);

const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={<Login />} />

    <Route path="/dashboard" element={withLayout(<Dashboard />)} />
    <Route path="/profile" element={withLayout(<MyProfile />)} />
    <Route path="/profile/edit" element={withLayout(<EditProfile />)} />
    <Route path="/change-password" element={withLayout(<ChangePassword />)} />

    <Route path="/" element={<Navigate to="/dashboard" replace />} />
    <Route path="*" element={<Navigate to="/dashboard" replace />} />
  </Routes>
);

export default AppRoutes;
