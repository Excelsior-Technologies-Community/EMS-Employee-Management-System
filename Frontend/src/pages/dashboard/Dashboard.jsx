import { useEffect, useState } from 'react';
import {
  Box, Card, Typography, Grid, Chip, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Alert, CircularProgress, Divider
} from '@mui/material';
import FingerprintRoundedIcon from '@mui/icons-material/FingerprintRounded';
import BadgeRoundedIcon from '@mui/icons-material/BadgeRounded';
import BusinessRoundedIcon from '@mui/icons-material/BusinessRounded';
import LockResetRoundedIcon from '@mui/icons-material/LockResetRounded';
import CalendarTodayRoundedIcon from '@mui/icons-material/CalendarTodayRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import HourglassEmptyRoundedIcon from '@mui/icons-material/HourglassEmptyRounded';
import TimeToLeaveRoundedIcon from '@mui/icons-material/TimeToLeaveRounded';
import ScheduleRoundedIcon from '@mui/icons-material/ScheduleRounded';

import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { dashboardService } from '../../services/dashboardService';
import { colors } from '../../theme/colors';
import { getErrorMessage } from '../../services/api';

const QuickLink = ({ icon, title, subtitle, onClick }) => (
  <Card
    onClick={onClick}
    sx={{
      p: 2.5,
      cursor: 'pointer',
      height: '100%',
      transition: 'transform 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease',
      border: `1px solid ${colors.line}`,
      '&:hover': {
        transform: 'translateY(-2px)',
        borderColor: colors.amber,
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
      },
    }}
  >
    <Box
      sx={{
        width: 42,
        height: 42,
        borderRadius: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: colors.navySoft,
        color: colors.navy,
        mb: 1.5,
      }}
    >
      {icon}
    </Box>
    <Typography sx={{ fontWeight: 700, fontSize: 15, color: colors.ink }}>{title}</Typography>
    <Typography variant="body2" color="text.secondary">{subtitle}</Typography>
  </Card>
);

const StatCard = ({ icon, label, value, tone }) => (
  <Card
    sx={{
      p: 2.5,
      height: '100%',
      border: `1px solid ${colors.line}`,
      transition: 'transform 0.2s ease',
      '&:hover': { transform: 'translateY(-2px)' }
    }}
  >
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <Box
        sx={{
          width: 44,
          height: 44,
          borderRadius: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: tone.bg,
          color: tone.fg,
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 800, lineHeight: 1.1, color: colors.ink }}>
          {value}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
          {label}
        </Typography>
      </Box>
    </Box>
  </Card>
);

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await dashboardService.getEmployeeData();
        setData(res.data?.data);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 2 }}>
        <CircularProgress sx={{ color: colors.navy }} />
        <Typography color="text.secondary" sx={{ fontWeight: 500 }}>Loading employee dashboard...</Typography>
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error" sx={{ mt: 3 }}>{error}</Alert>;
  }

  const {
    ownAttendanceSummary = {},
    currentMonthAttendance = [],
    leaveBalance = [],
    pendingLeaveRequests = [],
    approvedLeaveHistory = [],
    rejectedLeaveHistory = []
  } = data || {};

  return (
    <Box>
      {/* Greet Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="overline" color="secondary.dark" sx={{ letterSpacing: 1.5, fontWeight: 700 }}>
          {greeting.toUpperCase()}
        </Typography>
        <Typography variant="h4" sx={{ mt: 0.5, fontWeight: 800, color: colors.ink }}>
          {user?.name || 'there'} 👋
        </Typography>
        <Chip
          label={user?.role}
          size="small"
          sx={{ mt: 1, bgcolor: colors.successSoft, color: colors.success, fontWeight: 700 }}
        />
      </Box>

      {/* Attendance Stats Row */}
      <Typography variant="h6" sx={{ fontWeight: 800, mb: 2, color: colors.navy }}>
        My Attendance Summary
      </Typography>
      <Grid container spacing={2} sx={{ mb: 5 }}>
        <Grid size={{ xs: 6, sm: 4, md: 2 }}>
          <StatCard icon={<CalendarTodayRoundedIcon />} label="Working Days" value={ownAttendanceSummary.workingDays || 0} tone={{ fg: colors.navy, bg: colors.navySoft }} />
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 2 }}>
          <StatCard icon={<CheckCircleRoundedIcon />} label="Present Days" value={ownAttendanceSummary.presentDays || 0} tone={{ fg: colors.success, bg: colors.successSoft }} />
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 2 }}>
          <StatCard icon={<CancelRoundedIcon />} label="Absent Days" value={ownAttendanceSummary.absentDays || 0} tone={{ fg: colors.danger, bg: colors.dangerSoft }} />
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 2 }}>
          <StatCard icon={<ScheduleRoundedIcon />} label="Late Days" value={ownAttendanceSummary.lateDays || 0} tone={{ fg: colors.amberDeep, bg: colors.amberSoft }} />
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 2 }}>
          <StatCard icon={<HourglassEmptyRoundedIcon />} label="Half Days" value={ownAttendanceSummary.halfDays || 0} tone={{ fg: colors.info, bg: colors.infoSoft }} />
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 2 }}>
          <StatCard icon={<FingerprintRoundedIcon />} label="Total Hours" value={ownAttendanceSummary.totalWorkHours ? `${Number(ownAttendanceSummary.totalWorkHours).toFixed(1)}h` : '0h'} tone={{ fg: colors.navy, bg: colors.navySoft }} />
        </Grid>
      </Grid>

      {/* Quick Links Grid */}
      <Typography variant="h6" sx={{ fontWeight: 800, mb: 2, color: colors.navy }}>
        Quick Actions
      </Typography>
      <Grid container spacing={2.5} sx={{ mb: 5 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <QuickLink
            icon={<FingerprintRoundedIcon />}
            title="Attendance Log"
            subtitle="Check in & Check out"
            onClick={() => navigate('/attendance')}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <QuickLink
            icon={<BadgeRoundedIcon />}
            title="My Profile"
            subtitle="View your details"
            onClick={() => navigate('/profile')}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <QuickLink
            icon={<BusinessRoundedIcon />}
            title="Edit Profile"
            subtitle="Update name & email"
            onClick={() => navigate('/profile/edit')}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <QuickLink
            icon={<LockResetRoundedIcon />}
            title="Change Password"
            subtitle="Keep your account secure"
            onClick={() => navigate('/change-password')}
          />
        </Grid>
      </Grid>

      {/* Leave Balance Section */}
      <Typography variant="h6" sx={{ fontWeight: 800, mb: 2, color: colors.navy }}>
        My Leave Balances
      </Typography>
      <Grid container spacing={2.5} sx={{ mb: 5 }}>
        {leaveBalance.length === 0 ? (
          <Grid size={{ xs: 12 }}>
            <Paper sx={{ p: 3, textAlign: 'center', border: `1px solid ${colors.line}`, borderRadius: 2 }}>
              <Typography color="text.secondary">No leave balance records available.</Typography>
            </Paper>
          </Grid>
        ) : (
          leaveBalance.map((item, idx) => (
            <Grid key={idx} size={{ xs: 12, sm: 6, md: 4 }}>
              <Card sx={{ p: 2.5, border: `1px solid ${colors.line}`, borderRadius: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                  <TimeToLeaveRoundedIcon sx={{ color: colors.amber }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: colors.navy }}>
                    {item.leave_type}
                  </Typography>
                </Box>
                <Grid container spacing={1} sx={{ textAlign: 'center' }}>
                  <Grid size={{ xs: 4 }}>
                    <Box sx={{ p: 1, bgcolor: colors.navySoft, borderRadius: 1.5 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: colors.navy }}>{item.allocated_days}</Typography>
                      <Typography variant="caption" color="text.secondary">Allocated</Typography>
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 4 }}>
                    <Box sx={{ p: 1, bgcolor: colors.dangerSoft, borderRadius: 1.5 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: colors.danger }}>{item.used_days}</Typography>
                      <Typography variant="caption" color="text.secondary">Used</Typography>
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 4 }}>
                    <Box sx={{ p: 1, bgcolor: colors.successSoft, borderRadius: 1.5 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: colors.success }}>{item.remaining_days}</Typography>
                      <Typography variant="caption" color="text.secondary">Remaining</Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Card>
            </Grid>
          ))
        )}
      </Grid>

      {/* Main Tables Grid */}
      <Grid container spacing={4}>
        {/* Attendance Table */}
        <Grid size={{ xs: 12 }}>
          <Paper sx={{ p: 3, border: `1px solid ${colors.line}`, borderRadius: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 2.5, color: colors.navy }}>
              Current Month Attendance Log
            </Typography>
            <TableContainer sx={{ maxHeight: 350, overflowX: 'auto' }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, py: 1.5, bgcolor: colors.navySoft }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 700, py: 1.5, bgcolor: colors.navySoft }}>Check In</TableCell>
                    <TableCell sx={{ fontWeight: 700, py: 1.5, bgcolor: colors.navySoft }}>Check Out</TableCell>
                    <TableCell sx={{ fontWeight: 700, py: 1.5, bgcolor: colors.navySoft }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 700, py: 1.5, bgcolor: colors.navySoft }}>Hours</TableCell>
                    <TableCell sx={{ fontWeight: 700, py: 1.5, bgcolor: colors.navySoft }}>Remarks</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {currentMonthAttendance.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                        No records found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    currentMonthAttendance.map((row, idx) => (
                      <TableRow key={idx} hover>
                        <TableCell sx={{ py: 1.5 }}>{new Date(row.attendance_date).toLocaleDateString()}</TableCell>
                        <TableCell sx={{ py: 1.5 }}>{row.check_in ? new Date(row.check_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}</TableCell>
                        <TableCell sx={{ py: 1.5 }}>{row.check_out ? new Date(row.check_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}</TableCell>
                        <TableCell sx={{ py: 1.5 }}>
                          {(() => {
                            let chipTone = { fg: colors.neutral, bg: colors.neutralSoft };
                            if (row.status === 'Present') chipTone = { fg: colors.success, bg: colors.successSoft };
                            if (row.status === 'Late') chipTone = { fg: colors.amberDeep, bg: colors.amberSoft };
                            if (row.status === 'Half Day') chipTone = { fg: colors.info, bg: colors.infoSoft };
                            if (row.status === 'Absent') chipTone = { fg: colors.danger, bg: colors.dangerSoft };
                            return <Chip label={row.status} size="small" sx={{ fontWeight: 700, color: chipTone.fg, bgcolor: chipTone.bg }} />;
                          })()}
                        </TableCell>
                        <TableCell sx={{ py: 1.5 }}>{row.work_hours ? `${Number(row.work_hours).toFixed(1)} hrs` : '—'}</TableCell>
                        <TableCell sx={{ py: 1.5 }}>{row.remarks || '—'}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Pending Leaves Table */}
        <Grid size={{ xs: 12 }}>
          <Paper sx={{ p: 3, border: `1px solid ${colors.line}`, borderRadius: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 2.5, color: colors.navy }}>
              Pending Leave Requests
            </Typography>
            <TableContainer sx={{ overflowX: 'auto' }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, py: 1.5, bgcolor: colors.navySoft }}>Leave Type</TableCell>
                    <TableCell sx={{ fontWeight: 700, py: 1.5, bgcolor: colors.navySoft }}>Dates</TableCell>
                    <TableCell sx={{ fontWeight: 700, py: 1.5, bgcolor: colors.navySoft }}>Days</TableCell>
                    <TableCell sx={{ fontWeight: 700, py: 1.5, bgcolor: colors.navySoft }}>Reason</TableCell>
                    <TableCell sx={{ fontWeight: 700, py: 1.5, bgcolor: colors.navySoft }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pendingLeaveRequests.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                        No pending leave requests.
                      </TableCell>
                    </TableRow>
                  ) : (
                    pendingLeaveRequests.map((row) => (
                      <TableRow key={row.leave_id} hover>
                        <TableCell sx={{ py: 1.5, fontWeight: 600 }}>{row.leave_name}</TableCell>
                        <TableCell sx={{ py: 1.5 }}>{`${new Date(row.start_date).toLocaleDateString()} to ${new Date(row.end_date).toLocaleDateString()}`}</TableCell>
                        <TableCell sx={{ py: 1.5 }}>{row.total_days}</TableCell>
                        <TableCell sx={{ py: 1.5 }}>{row.reason}</TableCell>
                        <TableCell sx={{ py: 1.5 }}>
                          <Chip label="Pending" size="small" sx={{ fontWeight: 700, color: colors.amberDeep, bgcolor: colors.amberSoft }} />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Approved Leave History Table */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3, border: `1px solid ${colors.line}`, borderRadius: 3, height: '100%' }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 2.5, color: colors.navy }}>
              Approved Leave History
            </Typography>
            <TableContainer sx={{ overflowX: 'auto' }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, py: 1.5, bgcolor: colors.navySoft }}>Type / Dates</TableCell>
                    <TableCell sx={{ fontWeight: 700, py: 1.5, bgcolor: colors.navySoft }}>Days</TableCell>
                    <TableCell sx={{ fontWeight: 700, py: 1.5, bgcolor: colors.navySoft }}>Approver Comment</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {approvedLeaveHistory.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                        No records found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    approvedLeaveHistory.map((row) => (
                      <TableRow key={row.leave_id} hover>
                        <TableCell sx={{ py: 1.5 }}>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>{row.leave_name}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {`${new Date(row.start_date).toLocaleDateString()} to ${new Date(row.end_date).toLocaleDateString()}`}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ py: 1.5 }}>{row.total_days}</TableCell>
                        <TableCell sx={{ py: 1.5 }}>{row.approval_reason || '—'}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Rejected Leave History Table */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3, border: `1px solid ${colors.line}`, borderRadius: 3, height: '100%' }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 2.5, color: colors.navy }}>
              Rejected Leave History
            </Typography>
            <TableContainer sx={{ overflowX: 'auto' }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, py: 1.5, bgcolor: colors.navySoft }}>Type / Dates</TableCell>
                    <TableCell sx={{ fontWeight: 700, py: 1.5, bgcolor: colors.navySoft }}>Days</TableCell>
                    <TableCell sx={{ fontWeight: 700, py: 1.5, bgcolor: colors.navySoft }}>Rejection Reason</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rejectedLeaveHistory.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                        No records found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    rejectedLeaveHistory.map((row) => (
                      <TableRow key={row.leave_id} hover>
                        <TableCell sx={{ py: 1.5 }}>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>{row.leave_name}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {`${new Date(row.start_date).toLocaleDateString()} to ${new Date(row.end_date).toLocaleDateString()}`}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ py: 1.5 }}>{row.total_days}</TableCell>
                        <TableCell sx={{ py: 1.5 }}>{row.rejection_reason || '—'}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
