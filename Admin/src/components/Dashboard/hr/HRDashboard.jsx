import {
  Box,
  Typography,
  Grid,
  Chip,
  Alert
} from '@mui/material';

import GroupRoundedIcon from '@mui/icons-material/GroupRounded';
import PersonAddRoundedIcon from '@mui/icons-material/PersonAddRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import HourglassEmptyRoundedIcon from '@mui/icons-material/HourglassEmptyRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import TimerOffRoundedIcon from '@mui/icons-material/TimerOffRounded';

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

const HRDashboard = () => {
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
    data: hrRes,
    loading: hrLoading,
    error: hrError
  } = useFetch(
    () =>
      dashboardService.getHRData(),
    [user]
  );

  if (hrLoading) {
    return (
      <Loader
        label="Loading HR Dashboard..."
        minHeight="60vh"
      />
    );
  }

  if (hrError) {
    return (
      <Alert severity="error">
        {hrError}
      </Alert>
    );
  }

  const stats =
    hrRes?.data || {};

  const attendance =
    stats.attendanceSummary || {};

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
                roleTone.hr.fg,
              bgcolor:
                roleTone.hr.bg,
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
              stats.totalEmployees ?? 0
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
              <PersonAddRoundedIcon />
            }
            label="New Joiners This Month"
            value={
              stats.newEmployeesThisMonth ?? 0
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
              <HourglassEmptyRoundedIcon />
            }
            label="Pending Leaves"
            value={
              stats.pendingLeaves ?? 0
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
              attendance.present ?? 0
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
              <AccessTimeRoundedIcon />
            }
            label="Today Late"
            value={
              attendance.late ?? 0
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
              <TimerOffRoundedIcon />
            }
            label="Today Half Day"
            value={
              attendance.halfDay ?? 0
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
              <CancelRoundedIcon />
            }
            label="Today Absent"
            value={
              attendance.absent ?? 0
            }
            tone={{
              fg: colors.danger,
              bg: colors.dangerSoft
            }}
          />
        </Grid>
      </Grid>

      <AnalyticsSection />
    </Box>
  );
};

export default HRDashboard;