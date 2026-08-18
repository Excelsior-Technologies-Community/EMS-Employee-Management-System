import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import MainLayout from '../layouts/MainLayout';
import Login from '../pages/auth/Login';
import ForgotPassword from '../pages/auth/ForgotPassword';
import Dashboard from '../pages/dashboard/Dashboard';
import MyProfile from '../pages/profile/MyProfile';
import EditProfile from '../pages/profile/EditProfile';
import ChangePassword from '../pages/profile/ChangePassword';
import Attendance from '../pages/attendance/Attendance';
import AttendanceHistory from '../pages/attendance/AttendanceHistory';
import Leaves from '../pages/leaves/Leaves';

const withLayout = (page) => (
  <ProtectedRoute>
    <MainLayout>{page}</MainLayout>
  </ProtectedRoute>
);

const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={<Login />} />
    <Route path="/forgot-password" element={<ForgotPassword />} />

    <Route path="/dashboard" element={withLayout(<Dashboard />)} />
    <Route path="/attendance" element={withLayout(<Attendance />)} />
    <Route path="/attendance/history" element={withLayout(<AttendanceHistory />)} />
    <Route path="/leaves" element={withLayout(<Leaves />)} />
    <Route path="/profile" element={withLayout(<MyProfile />)} />
    <Route path="/profile/edit" element={withLayout(<EditProfile />)} />
    <Route path="/change-password" element={withLayout(<ChangePassword />)} />

    <Route path="/" element={<Navigate to="/dashboard" replace />} />
    <Route path="*" element={<Navigate to="/dashboard" replace />} />
  </Routes>
);

export default AppRoutes;
