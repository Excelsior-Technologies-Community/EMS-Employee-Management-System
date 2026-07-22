import { useEffect, useState } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, CircularProgress, Avatar
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import BusinessIcon from '@mui/icons-material/Business';
import WorkIcon from '@mui/icons-material/Work';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

const StatCard = ({ title, value, icon, color }) => (
  <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
    <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <Avatar sx={{ bgcolor: color, width: 52, height: 52 }}>
        {icon}
      </Avatar>
      <Box>
        <Typography variant="h4" fontWeight="bold">{value}</Typography>
        <Typography variant="body2" color="text.secondary">{title}</Typography>
      </Box>
    </CardContent>
  </Card>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ employees: 0, departments: 0, roles: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [empRes, deptRes] = await Promise.all([
          API.get('/employees'),
          API.get('/departments'),
        ]);
        let roleCount = 0;
        if (user?.role === 'Admin') {
          const roleRes = await API.get('/roles');
          roleCount = roleRes.data.data?.length || 0;
        }
        setStats({
          employees: empRes.data.data?.length || 0,
          departments: deptRes.data.data?.length || 0,
          roles: roleCount,
        });
      } catch {
        // Silently fail
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [user]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" fontWeight="bold" mb={1}>
        Welcome back, {user?.name}! 👋
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Role: <strong>{user?.role}</strong>
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard title="Total Employees" value={stats.employees} icon={<PeopleIcon />} color="primary.main" />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard title="Departments" value={stats.departments} icon={<BusinessIcon />} color="success.main" />
        </Grid>
        {user?.role === 'Admin' && (
          <Grid item xs={12} sm={6} md={4}>
            <StatCard title="Roles" value={stats.roles} icon={<WorkIcon />} color="warning.main" />
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default Dashboard;
