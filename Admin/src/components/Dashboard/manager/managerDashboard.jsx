import {
  Box,
  Typography,
  Grid,
  Chip,
  Alert
} from '@mui/material';

import GroupRoundedIcon from '@mui/icons-material/GroupRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';

import { useAuth } from '../../../context/AuthContext';
import { useFetch } from '../../../hooks/useFetch';
import { dashboardService } from '../../../services/dashboardService';

import Loader from '../../common/Loader';
import DataTable from '../../common/DataTable';

import StatCard from '../StatCard';

import {
  colors,
  roleTone
} from '../../../theme/colors';

const ManagerDashboard = () => {
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
    data: managerRes,
    loading: managerLoading,
    error: managerError
  } = useFetch(
    () =>
      dashboardService.getManagerData(),
    [user]
  );

  if (managerLoading) {
    return (
      <Loader
        label="Loading Manager Dashboard..."
        minHeight="60vh"
      />
    );
  }

  if (managerError) {
    return (
      <Alert severity="error">
        {managerError}
      </Alert>
    );
  }

  const stats =
    managerRes?.data || {};

  const uniqueAttendance =
    (
      stats.todayTeamAttendance ||
      []
    ).filter(
      (v, i, a) =>
        a.findIndex(
          (t) =>
            t.employee_id ===
            v.employee_id
        ) === i
    );

  const uniqueLeaveRequests =
    (
      stats.teamLeaveRequests ||
      []
    ).filter(
      (v, i, a) =>
        a.findIndex(
          (t) =>
            t.id === v.id
        ) === i
    );

  const uniqueUpcomingLeaves =
    (
      stats.upcomingTeamLeaves ||
      []
    ).filter(
      (v, i, a) =>
        a.findIndex(
          (t) =>
            t.id === v.id
        ) === i
    );

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
                roleTone.manager.fg,
              bgcolor:
                roleTone.manager.bg,
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
            sm: 4
          }}
        >
          <StatCard
            icon={
              <GroupRoundedIcon />
            }
            label="Total Team Members"
            value={
              stats.totalTeamMembers
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
            sm: 4
          }}
        >
          <StatCard
            icon={
              <CheckCircleRoundedIcon />
            }
            label="Present Team Members"
            value={
              stats.presentTeamEmployees
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
            sm: 4
          }}
        >
          <StatCard
            icon={
              <CancelRoundedIcon />
            }
            label="Absent Team Members"
            value={
              stats.absentTeamEmployees
            }
            tone={{
              fg: colors.danger,
              bg: colors.dangerSoft
            }}
          />
        </Grid>

      </Grid>

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 5
        }}
      >

        <Box>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 800,
              mb: 2.5,
              color: colors.navy
            }}
          >
            Today's Team Attendance
          </Typography>

          <DataTable
            rows={
              uniqueAttendance
            }
            searchKeys={[
              'employee_name',
              'employee_email'
            ]}
            searchPlaceholder="Search team attendance..."
            columns={[
              {
                key:
                  'employee_name',
                label:
                  'Employee'
              },
              {
                key:
                  'employee_email',
                label:
                  'Email',
                sx: {
                  display: {
                    xs: 'none',
                    md: 'table-cell'
                  }
                }
              },
              {
                key:
                  'check_in',
                label:
                  'Check In',
                render:
                  (row) =>
                    row.check_in
                      ? new Date(
                          row.check_in
                        ).toLocaleTimeString(
                          [],
                          {
                            hour:
                              '2-digit',
                            minute:
                              '2-digit'
                          }
                        )
                      : '—'
              },
              {
                key:
                  'check_out',
                label:
                  'Check Out',
                render:
                  (row) =>
                    row.check_out
                      ? new Date(
                          row.check_out
                        ).toLocaleTimeString(
                          [],
                          {
                            hour:
                              '2-digit',
                            minute:
                              '2-digit'
                          }
                        )
                      : '—'
              },
              {
                key:
                  'status',
                label:
                  'Status',
                render:
                  (row) => {
                    let chipTone = {
                      fg:
                        colors.neutral,
                      bg:
                        colors.neutralSoft
                    };

                    if (
                      row.status ===
                      'Present'
                    ) {
                      chipTone = {
                        fg:
                          colors.success,
                        bg:
                          colors.successSoft
                      };
                    }

                    if (
                      row.status ===
                      'Late'
                    ) {
                      chipTone = {
                        fg:
                          colors.amberDeep,
                        bg:
                          colors.amberSoft
                      };
                    }

                    if (
                      row.status ===
                      'Half Day'
                    ) {
                      chipTone = {
                        fg:
                          colors.info,
                        bg:
                          colors.infoSoft
                      };
                    }

                    if (
                      row.status ===
                      'Absent'
                    ) {
                      chipTone = {
                        fg:
                          colors.danger,
                        bg:
                          colors.dangerSoft
                      };
                    }

                    return (
                      <Chip
                        label={
                          row.status
                        }
                        size="small"
                        sx={{
                          fontWeight: 700,
                          color:
                            chipTone.fg,
                          bgcolor:
                            chipTone.bg
                        }}
                      />
                    );
                  }
              },
              {
                key:
                  'work_hours',
                label:
                  'Work Hours',
                render:
                  (row) =>
                    row.work_hours != null && !isNaN(Number(row.work_hours))
                      ? `${Number(row.work_hours).toFixed(
                          1
                        )} hrs`
                      : '—'
              },
              {
                key:
                  'remarks',
                label:
                  'Remarks',
                sx: {
                  display: {
                    xs: 'none',
                    lg: 'table-cell'
                  }
                }
              }
            ]}
            emptyLabel="No team attendance records found for today."
          />
        </Box>

        <Box>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 800,
              mb: 2.5,
              color: colors.navy
            }}
          >
            Team Pending Leave Requests
          </Typography>

          <DataTable
            rows={
              uniqueLeaveRequests
            }
            searchKeys={[
              'employee_name',
              'leave_type'
            ]}
            searchPlaceholder="Search pending leaves..."
            columns={[
              {
                key:
                  'employee_name',
                label:
                  'Employee'
              },
              {
                key:
                  'leave_type',
                label:
                  'Leave Type'
              },
              {
                key:
                  'dates',
                label:
                  'Leave Dates',
                render:
                  (row) =>
                    `${new Date(
                      row.start_date
                    ).toLocaleDateString()} to ${new Date(
                      row.end_date
                    ).toLocaleDateString()}`
              },
              {
                key:
                  'duration_days',
                label:
                  'Days'
              },
              {
                key:
                  'reason',
                label:
                  'Reason',
                sx: {
                  display: {
                    xs: 'none',
                    md: 'table-cell'
                  }
                }
              },
              {
                key:
                  'status',
                label:
                  'Status',
                render:
                  (row) => (
                    <Chip
                      label={
                        row.status
                      }
                      size="small"
                      sx={{
                        fontWeight: 700,
                        color:
                          colors.amberDeep,
                        bgcolor:
                          colors.amberSoft
                      }}
                    />
                  )
              }
            ]}
            emptyLabel="No pending team leave requests found."
          />
        </Box>

        <Box>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 800,
              mb: 2.5,
              color: colors.navy
            }}
          >
            Upcoming Team Leaves
          </Typography>

          <DataTable
            rows={
              uniqueUpcomingLeaves
            }
            searchKeys={[
              'employee_name',
              'leave_type'
            ]}
            searchPlaceholder="Search upcoming leaves..."
            columns={[
              {
                key:
                  'employee_name',
                label:
                  'Employee'
              },
              {
                key:
                  'leave_type',
                label:
                  'Leave Type'
              },
              {
                key:
                  'dates',
                label:
                  'Leave Dates',
                render:
                  (row) =>
                    `${new Date(
                      row.start_date
                    ).toLocaleDateString()} to ${new Date(
                      row.end_date
                    ).toLocaleDateString()}`
              },
              {
                key:
                  'duration_days',
                label:
                  'Days'
              },
              {
                key:
                  'status',
                label:
                  'Status',
                render:
                  (row) => {
                    let chipTone = {
                      fg:
                        colors.success,
                      bg:
                        colors.successSoft
                    };

                    if (
                      row.status ===
                      'Pending'
                    ) {
                      chipTone = {
                        fg:
                          colors.amberDeep,
                        bg:
                          colors.amberSoft
                      };
                    }

                    return (
                      <Chip
                        label={
                          row.status
                        }
                        size="small"
                        sx={{
                          fontWeight: 700,
                          color:
                            chipTone.fg,
                          bgcolor:
                            chipTone.bg
                        }}
                      />
                    );
                  }
              }
            ]}
            emptyLabel="No upcoming team leaves found."
          />
        </Box>

      </Box>
    </Box>
  );
};

export default ManagerDashboard;