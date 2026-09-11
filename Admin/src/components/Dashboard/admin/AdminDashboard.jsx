import {
  Box,
  Typography,
  Grid,
  Chip,
  Alert
} from '@mui/material';

import GroupRoundedIcon from '@mui/icons-material/GroupRounded';
import ApartmentRoundedIcon from '@mui/icons-material/ApartmentRounded';
import AdminPanelSettingsRoundedIcon from '@mui/icons-material/AdminPanelSettingsRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import HourglassEmptyRoundedIcon from '@mui/icons-material/HourglassEmptyRounded';

import { useAuth } from '../../../context/AuthContext';
import { useFetch } from '../../../hooks/useFetch';
import { dashboardService } from '../../../services/dashboardService';

import Loader from '../../common/Loader';

import StatCard from '../StatCard';
import AnalyticsSection from '../AnalyticsSection';

import {
  colors,
  roleTone
} from '../../../theme/colors';

const AdminDashboard = () => {
  const { user } = useAuth();

  const hour =
    new Date().getHours();

  const greeting =
    hour < 12
      ? 'Good morning'
      : hour < 17
        ? 'Good afternoon'
        : 'Good evening';

  const {
    data: adminRes,
    loading: adminLoading,
    error: adminError
  } = useFetch(
    () =>
      dashboardService.getAdminData(),
    [user]
  );

  if (adminLoading) {
    return (
      <Loader
        label="Loading Admin Dashboard..."
        minHeight="60vh"
      />
    );
  }

  if (adminError) {
    return (
      <Alert severity="error">
        {adminError}
      </Alert>
    );
  }

  const stats =
    adminRes?.data || {};

  return (
    <Box>
      <Box
        sx={{
          mb: 4,
          display: 'flex',
          justifyContent:
            'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2
        }}
      >
        <Box>
          <Typography
            variant="overline"
            color="secondary.dark"
            sx={{
              letterSpacing: 1.5,
              fontWeight: 700
            }}
          >
            {greeting.toUpperCase()}
          </Typography>

          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              mt: 0.5,
              color: colors.ink
            }}
          >
            {user?.name} 👋
          </Typography>

          <Chip
            label={user?.role}
            size="small"
            sx={{
              mt: 1,
              color:
                roleTone.admin.fg,
              bgcolor:
                roleTone.admin.bg,
              fontWeight: 700
            }}
          />
        </Box>
      </Box>

      <Grid
        container
        spacing={2.5}
        sx={{ mb: 6 }}
      >
        <Grid
          size={{
            xs: 12,
            sm: 6,
            md: 3
          }}
        >
          <StatCard
            icon={
              <GroupRoundedIcon />
            }
            label="Total Employees"
            value={
              stats.totalEmployees
            }
            tone={{
              fg: colors.navy,
              bg: colors.navySoft
            }}
          />
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 6,
            md: 3
          }}
        >
          <StatCard
            icon={
              <CheckCircleRoundedIcon />
            }
            label="Active Employees"
            value={
              stats.activeEmployees
            }
            tone={{
              fg: colors.success,
              bg: colors.successSoft
            }}
          />
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 6,
            md: 3
          }}
        >
          <StatCard
            icon={
              <CancelRoundedIcon />
            }
            label="Inactive Employees"
            value={
              stats.inactiveEmployees
            }
            tone={{
              fg: colors.neutral,
              bg: colors.neutralSoft
            }}
          />
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 6,
            md: 3
          }}
        >
          <StatCard
            icon={
              <ApartmentRoundedIcon />
            }
            label="Total Departments"
            value={
              stats.totalDepartments
            }
            tone={{
              fg: colors.info,
              bg: colors.infoSoft
            }}
          />
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 6,
            md: 3
          }}
        >
          <StatCard
            icon={
              <AdminPanelSettingsRoundedIcon />
            }
            label="Total Roles"
            value={
              stats.totalRoles
            }
            tone={{
              fg: colors.amberDeep,
              bg: colors.amberSoft
            }}
          />
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 6,
            md: 3
          }}
        >
          <StatCard
            icon={
              <CheckCircleRoundedIcon />
            }
            label="Today Present"
            value={
              stats.todayPresent
            }
            tone={{
              fg: colors.success,
              bg: colors.successSoft
            }}
          />
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 6,
            md: 3
          }}
        >
          <StatCard
            icon={
              <CancelRoundedIcon />
            }
            label="Today Absent"
            value={
              stats.todayAbsent
            }
            tone={{
              fg: colors.danger,
              bg: colors.dangerSoft
            }}
          />
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 6,
            md: 3
          }}
        >
          <StatCard
            icon={
              <HourglassEmptyRoundedIcon />
            }
            label="Pending Leaves"
            value={
              stats.pendingLeaves
            }
            tone={{
              fg: colors.amberDeep,
              bg: colors.amberSoft
            }}
          />
        </Grid>
      </Grid>

      <AnalyticsSection />
    </Box>
  );
};

export default AdminDashboard;