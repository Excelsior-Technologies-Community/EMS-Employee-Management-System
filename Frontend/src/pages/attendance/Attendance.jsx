import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Box, Card, Typography, Button, Grid, Stack, Divider, Chip,
  Paper, CircularProgress
} from '@mui/material';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import LoginRoundedIcon from '@mui/icons-material/LoginRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import CalendarTodayRoundedIcon from '@mui/icons-material/CalendarTodayRounded';
import WarningRoundedIcon from '@mui/icons-material/WarningRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import CheckInOutSheet from '../../components/attendance/CheckInOutSheet';
import { attendanceService } from '../../services/attendanceService';
import { colors } from '../../theme/colors';

const Attendance = () => {
  const [todayRecord, setTodayRecord] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetAction, setSheetAction] = useState('check-in'); // 'check-in' | 'check-out'
  const [monthlySummary, setMonthlySummary] = useState(null);

  const fetchTodayStatus = async () => {
    try {
      const res = await attendanceService.getToday();
      if (res.data?.success && res.data?.data) {
        setTodayRecord(res.data.data);
      } else {
        setTodayRecord(null);
      }
    } catch (err) {
      console.error('Error fetching today status:', err);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await attendanceService.getMyHistory();
      if (res.data?.success && Array.isArray(res.data?.data)) {
        setHistory(res.data.data);
      }
    } catch (err) {
      console.log('History endpoint returned error:', err.message);
    }
  };

  const fetchMonthlyReport = async () => {
    try {
      const res = await attendanceService.getMonthlyReport();
      if (res.data?.success && res.data?.data?.summary) {
        setMonthlySummary(res.data.data.summary);
      }
    } catch (err) {
      console.error('Error fetching monthly report:', err);
    }
  };

  const loadData = async () => {
    setLoading(true);
    await Promise.all([fetchTodayStatus(), fetchHistory(), fetchMonthlyReport()]);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleActionClick = (action) => {
    setSheetAction(action);
    setSheetOpen(true);
  };

  const formatTime = (isoString) => {
    if (!isoString) return '---';
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    } catch (e) {
      return '---';
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });
    } catch (e) {
      return '';
    }
  };

  const checkInTime = todayRecord?.check_in;
  const checkOutTime = todayRecord?.check_out;

  const hasCheckedIn = !!checkInTime;
  const hasCheckedOut = !!checkOutTime;

  // Determine if there is any missing attendance in the history
  const hasMissingAttendance = history.some(r => {
    const recordDate = new Date(r.attendance_date).toISOString().split('T')[0];
    const todayStr = new Date().toISOString().split('T')[0];
    const isPast = recordDate < todayStr;
    return isPast && (!r.check_in || !r.check_out);
  });

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress size={40} thickness={4} color="secondary" />
      </Box>
    );
  }

  const recentHistory = history.slice(0, 5); // display latest 4-5 records

  return (
    <Box sx={{ pb: 6 }}>
      {/* Title Header */}
      <Box sx={{ mb: 3.5 }}>
        <Typography variant="overline" color="secondary.dark" sx={{ display: 'flex', alignItems: 'center', gap: 0.75, fontWeight: 700 }}>
          <CalendarTodayRoundedIcon sx={{ fontSize: 14 }} />
          DAILY ATTENDANCE
        </Typography>
        <Typography variant="h4" sx={{ mt: 0.5 }}>
          Attendance Tracker
        </Typography>
      </Box>

      {/* Compact Monthly Summary Widget */}
      {monthlySummary && (
        <Grid container spacing={{ xs: 1.5, sm: 2.5 }} sx={{ mb: 4.5 }}>
          {[
            { label: 'Present', value: monthlySummary.presentDays, tone: { fg: colors.success, bg: colors.successSoft } },
            { label: 'Late', value: monthlySummary.lateDays, tone: { fg: colors.amberDeep, bg: colors.amberSoft } },
            { label: 'Half Day', value: monthlySummary.halfDays, tone: { fg: colors.info, bg: colors.infoSoft } },
            { label: 'Absent', value: monthlySummary.absentDays, tone: { fg: colors.danger, bg: colors.dangerSoft } },
            { label: 'Total Hours', value: `${monthlySummary.totalWorkHours} hrs`, tone: { fg: colors.navy, bg: colors.navySoft } },
          ].map((stat, i) => (
            <Grid size={{ xs: 6, sm: 4, md: 2.4 }} key={i}>
              <Box
                sx={{
                  p: { xs: 1.5, sm: 2 },
                  borderRadius: 3,
                  bgcolor: stat.tone.bg,
                  border: `1px solid ${stat.tone.fg}18`,
                  textAlign: 'center',
                }}
              >
                <Typography variant="h5" sx={{ fontWeight: 800, color: stat.tone.fg, lineHeight: 1.1, fontSize: { xs: '1.2rem', sm: '1.5rem' } }}>
                  {stat.value}
                </Typography>
                <Typography variant="caption" sx={{ color: stat.tone.fg, fontWeight: 700, mt: 0.5, display: 'block', textTransform: 'uppercase', fontSize: { xs: 9, sm: 10 }, letterSpacing: '0.03em' }}>
                  {stat.label}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Balanced 2-Column Grid */}
      <Grid container spacing={3.5} alignItems="stretch">
        
        {/* Left Column: Shift Attendance Action Card */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card
            sx={{
              p: { xs: 2.5, sm: 3.5 },
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 8px 32px rgba(38, 51, 92, 0.03)',
              border: `1px solid ${colors.line}`,
              borderRadius: 3,
            }}
          >
            <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5, color: colors.navy }}>
                Shift Attendance
              </Typography>

              {/* Attendance action required state */}
              {hasMissingAttendance && (
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    mb: 2.5,
                    bgcolor: colors.dangerSoft,
                    border: `1px solid ${colors.danger}22`,
                    borderRadius: 2.5,
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 1.5
                  }}
                >
                  <WarningRoundedIcon sx={{ color: colors.danger, mt: 0.25, fontSize: 20 }} />
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: colors.danger, fontSize: 13, lineHeight: 1.2 }}>
                      Attendance action required
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5, fontSize: 11.5, lineHeight: 1.35 }}>
                      We couldn't find a check-in/check-out record for one or more days.
                    </Typography>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: colors.danger, mt: 1, display: 'block', fontSize: 11.5 }}>
                      Contact Admin / HR
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25, fontSize: 11.5, lineHeight: 1.35 }}>
                      If you forgot to check in or check out, please contact your administrator or HR team to update your attendance.
                    </Typography>
                  </Box>
                </Paper>
              )}

              {/* Status information */}
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {!hasCheckedIn && "You're not checked in yet"}
                {hasCheckedIn && !hasCheckedOut && `You're checked in since ${formatTime(checkInTime)}`}
                {hasCheckedIn && hasCheckedOut && "Today's shift is completed"}
              </Typography>

              {/* Action Buttons */}
              <Box sx={{ mb: 3.5 }}>
                {hasCheckedIn && hasCheckedOut ? (
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      bgcolor: colors.successSoft,
                      border: `1px solid ${colors.success}33`,
                      borderRadius: 2.5,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                    }}
                  >
                    <CheckCircleOutlineRoundedIcon sx={{ color: colors.success, fontSize: 24 }} />
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: colors.success }}>
                        Today's Shift Completed
                      </Typography>
                    </Box>
                  </Paper>
                ) : (
                  <Stack direction="row" spacing={2}>
                    {!hasCheckedIn && (
                      <Button
                        variant="contained"
                        onClick={() => handleActionClick('check-in')}
                        startIcon={<LoginRoundedIcon />}
                        sx={{
                          flex: 1,
                          bgcolor: colors.navy,
                          color: '#fff',
                          py: 1.5,
                          fontWeight: 700,
                          borderRadius: 2,
                          '&:hover': { bgcolor: colors.navyDeep },
                        }}
                      >
                        Check In
                      </Button>
                    )}

                    {hasCheckedIn && !hasCheckedOut && (
                      <Button
                        variant="contained"
                        onClick={() => handleActionClick('check-out')}
                        startIcon={<LogoutRoundedIcon />}
                        sx={{
                          flex: 1,
                          bgcolor: colors.amber,
                          color: colors.ink,
                          py: 1.5,
                          fontWeight: 700,
                          borderRadius: 2,
                          '&:hover': { bgcolor: colors.amberDeep },
                        }}
                      >
                        Check Out
                      </Button>
                    )}
                  </Stack>
                )}
              </Box>
            </Box>

            {/* Timings */}
            <Box>
              <Divider sx={{ mb: 2 }} />
              <Stack direction="row" divider={<Divider orientation="vertical" flexItem />} spacing={2} justifyContent="space-around" alignItems="center">
                <Box sx={{ textAlign: 'center', flex: 1 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.03em', fontSize: 10 }}>
                    Check-in Time
                  </Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, mt: 0.25, color: hasCheckedIn ? colors.navy : 'text.disabled' }}>
                    {formatTime(checkInTime)}
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center', flex: 1 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.03em', fontSize: 10 }}>
                    Check-out Time
                  </Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, mt: 0.25, color: hasCheckedOut ? colors.amber : 'text.disabled' }}>
                    {formatTime(checkOutTime)}
                  </Typography>
                </Box>
              </Stack>
            </Box>
          </Card>
        </Grid>

        {/* Right Column: Recent History Card (Balanced Height) */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card
            sx={{
              p: { xs: 2.5, sm: 3.5 },
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 8px 32px rgba(38, 51, 92, 0.03)',
              border: `1px solid ${colors.line}`,
              borderRadius: 3,
            }}
          >
            <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2.5, display: 'flex', alignItems: 'center', gap: 1, color: colors.navy }}>
                <HistoryRoundedIcon />
                Recent History
              </Typography>

              {recentHistory.length > 0 ? (
                <Stack spacing={1.75} sx={{ flexGrow: 1 }}>
                  {recentHistory.map((record, index) => {
                    const isMissing = !record.check_in || !record.check_out;
                    const timeStr = `${formatTime(record.check_in)} → ${formatTime(record.check_out)}`;
                    
                    const pills = [];
                    if (record.work_hours) pills.push(`${record.work_hours} hrs`);
                    if (record.status) pills.push(record.status);
                    if (record.remarks) {
                      if (record.remarks.includes('In-Office')) pills.push('In-Office');
                      else if (record.remarks.includes('WFH')) pills.push('WFH');
                    }

                    return (
                      <Box key={record.id || index}>
                        {index > 0 && <Divider sx={{ mb: 1.75 }} />}
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: colors.navy }}>
                              {formatDate(record.attendance_date)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25 }}>
                              {timeStr}
                            </Typography>
                          </Box>
                          
                          <Stack direction="row" spacing={0.75} alignItems="center">
                            {pills.map((pill, pIdx) => {
                              let statusColor = 'default';
                              if (pill === 'Present') statusColor = 'success';
                              if (pill === 'Late') statusColor = 'warning';
                              if (pill === 'Half Day') statusColor = 'info';
                              if (pill === 'Absent') statusColor = 'error';

                              return (
                                <Chip
                                  key={pIdx}
                                  label={pill}
                                  size="small"
                                  variant={pill.includes('hrs') ? 'outlined' : 'filled'}
                                  color={statusColor}
                                  sx={{
                                    fontWeight: 700,
                                    fontSize: 10,
                                    height: 18,
                                    ...(statusColor === 'default' && {
                                      bgcolor: colors.navySoft,
                                      color: colors.navy,
                                    })
                                  }}
                                />
                              );
                            })}
                          </Stack>
                        </Stack>
                      </Box>
                    );
                  })}
                </Stack>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexGrow: 1, py: 4, textAlign: 'center' }}>
                  <CalendarTodayRoundedIcon sx={{ fontSize: 44, color: 'text.disabled', mb: 1.5 }} />
                  <Typography variant="body2" color="text.secondary">
                    No attendance records yet.
                  </Typography>
                </Box>
              )}
            </Box>

            {/* View All Attendance Button */}
            {recentHistory.length > 0 && (
              <Box sx={{ mt: 'auto', pt: 2, display: 'flex', justifyContent: 'center' }}>
                <Button
                  component={Link}
                  to="/attendance/history"
                  variant="text"
                  sx={{
                    fontWeight: 700,
                    textTransform: 'none',
                    color: colors.navy,
                    '&:hover': {
                      bgcolor: colors.navySoft
                    }
                  }}
                >
                  View All Attendance
                </Button>
              </Box>
            )}
          </Card>
        </Grid>

      </Grid>

      {/* Slide Drawer Sheet */}
      <CheckInOutSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        action={sheetAction}
        onSuccess={loadData}
      />
    </Box>
  );
};

export default Attendance;
