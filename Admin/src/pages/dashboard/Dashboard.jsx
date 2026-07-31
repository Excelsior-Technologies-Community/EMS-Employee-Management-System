import { Box, Card, Typography, Grid, Chip } from '@mui/material';
import GroupRoundedIcon from '@mui/icons-material/GroupRounded';
import ApartmentRoundedIcon from '@mui/icons-material/ApartmentRounded';
import AdminPanelSettingsRoundedIcon from '@mui/icons-material/AdminPanelSettingsRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import { useAuth } from '../../context/AuthContext';
import { useFetch } from '../../hooks/useFetch';
import { employeeService } from '../../services/employeeService';
import { departmentService } from '../../services/departmentService';
import { roleService } from '../../services/roleService';
import Loader from '../../components/common/Loader';
import { colors, roleTone } from '../../theme/colors';

const StatCard = ({ icon, label, value, tone }) => (
  <Card sx={{ p: 2.75, height: '100%' }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <Box
        sx={{
          width: 46, height: 46, borderRadius: 2.5, display: 'flex', alignItems: 'center',
          justifyContent: 'center', bgcolor: tone.bg, color: tone.fg, flexShrink: 0,
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography variant="h4" sx={{ lineHeight: 1.1 }}>{value}</Typography>
        <Typography variant="body2" color="text.secondary">{label}</Typography>
      </Box>
    </Box>
  </Card>
);

const Dashboard = () => {
  const { user, hasRole } = useAuth();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const { data: empRes, loading: empLoading } = useFetch(() => employeeService.getAll({ limit: 1000 }), []);
  const { data: deptRes, loading: deptLoading } = useFetch(() => departmentService.getAll(), []);
  const { data: roleRes, loading: roleLoading } = useFetch(() => roleService.getAll(), []);

  const employees = empRes?.data || [];
  const departments = deptRes?.data || [];
  const roles = roleRes?.data || [];
  const activeCount = employees.filter((e) => e.status === 1).length;
  const inactiveCount = employees.length - activeCount;

  if (empLoading || deptLoading || roleLoading) return <Loader label="Loading dashboard..." minHeight="60vh" />;

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="overline" color="secondary.dark">{greeting.toUpperCase()}</Typography>
        <Typography variant="h4" sx={{ mt: 0.5 }}>{user?.name} 👋</Typography>
        <Chip
          label={user?.role}
          size="small"
          sx={{ mt: 1, color: roleTone[user?.role?.toLowerCase()]?.fg, bgcolor: roleTone[user?.role?.toLowerCase()]?.bg, fontWeight: 700 }}
        />
      </Box>

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <StatCard icon={<GroupRoundedIcon />} label="Total Employees" value={employees.length} tone={{ fg: colors.navy, bg: colors.navySoft }} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <StatCard icon={<CheckCircleRoundedIcon />} label="Active Employees" value={activeCount} tone={{ fg: colors.success, bg: colors.successSoft }} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2}}>
          <StatCard icon={<CancelRoundedIcon />} label="Inactive Employees" value={inactiveCount} tone={{ fg: colors.neutral, bg: colors.neutralSoft }} />
        </Grid>
        {hasRole('Admin') && (
          <>
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <StatCard icon={<ApartmentRoundedIcon />} label="Departments" value={departments.length} tone={{ fg: colors.info, bg: colors.infoSoft }} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <StatCard icon={<AdminPanelSettingsRoundedIcon />} label="Roles" value={roles.length} tone={{ fg: colors.amberDeep, bg: colors.amberSoft }} />
            </Grid>
          </>
        )}
      </Grid>
    </Box>
  );
};

export default Dashboard;
