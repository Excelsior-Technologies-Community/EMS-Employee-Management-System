import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { AuthProvider, useAuth } from './context/AuthContext';

import Login from './Pages/Login';
import Dashboard from './Pages/Dashboard';
import Employees from './Pages/Employees';
import Departments from './Pages/Departments';
import Roles from './Pages/Roles';
import Profile from './Pages/Profile';
import Unauthorized from './Pages/Unauthorized';
import Layout from './Components/Layout';
import ProtectedRoute from './Components/ProtectedRoute';

const theme = createTheme({
  palette: {
    primary: { main: '#1976d2' },
    secondary: { main: '#9c27b0' },
    background: { default: '#f5f5f5' },
  },
  shape: { borderRadius: 8 },
  typography: { fontFamily: 'Inter, Roboto, sans-serif' },
});

// HomeRedirect AuthProvider ke andar define hona chahiye
const HomeRedirect = () => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role?.toLowerCase() === 'employee') return <Navigate to={`/profile/${user.id}`} replace />;
  return <Navigate to="/dashboard" replace />;
};

// Saare routes yahan hain — AuthProvider ke andar
const AppRoutes = () => {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<Login />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Root redirect */}
      <Route path="/" element={<HomeRedirect />} />

      {/* Protected - Admin, HR, Manager */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute roles={['Admin', 'HR', 'Manager']}>
            <Layout><Dashboard /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/employees"
        element={
          <ProtectedRoute roles={['Admin', 'HR', 'Manager']}>
            <Layout><Employees /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/departments"
        element={
          <ProtectedRoute roles={['Admin', 'HR', 'Manager']}>
            <Layout><Departments /></Layout>
          </ProtectedRoute>
        }
      />

      {/* Admin only */}
      <Route
        path="/roles"
        element={
          <ProtectedRoute roles={['Admin']}>
            <Layout><Roles /></Layout>
          </ProtectedRoute>
        }
      />

      {/* Profile - all logged in users */}
      <Route
        path="/profile/:id"
        element={
          <ProtectedRoute>
            <Layout><Profile /></Layout>
          </ProtectedRoute>
        }
      />

      {/* 404 fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
