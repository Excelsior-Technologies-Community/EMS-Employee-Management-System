import { useState, useEffect } from 'react';
import {
  Box, Card, Typography, Button, Grid, Stack, Divider, Chip,
  List, ListItem, ListItemText, Paper, CircularProgress
} from '@mui/material';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import LoginRoundedIcon from '@mui/icons-material/LoginRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import HistoryToggleOffRoundedIcon from '@mui/icons-material/HistoryToggleOffRounded';
import CalendarTodayRoundedIcon from '@mui/icons-material/CalendarTodayRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import CheckInOutSheet from '../../components/attendance/CheckInOutSheet';
import { attendanceService } from '../../services/attendanceService';
import { colors } from '../../theme/colors';
import { getAttendanceStatusTone } from '../../utils/attendanceStatus';

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
      // Optional history endpoint. We filter to last 7 days or pass empty params
      const res = await attendanceService.getMyHistory();
      if (res.data?.success && Array.isArray(res.data?.data)) {
        setHistory(res.data.data);
      }
    } catch (err) {
      // Endpoint is optional, ignore failure or show empty history gracefully
      console.log('History endpoint not available or returned error:', err.message);
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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress size={40} thickness={4} color="secondary" />
      </Box>
    );
  }

  const renderLocationChips = (remarks) => {
    if (!remarks) return null;
    const chips = [];
    if (remarks.includes('In-Office')) {
      chips.push(
        <Chip
          key="in-office"
          label="In-Office"
          variant="outlined"
          size="small"
          sx={{ fontSize: 10, height: 18, borderColor: colors.navy, color: colors.navy }}
        />
      );
    }
    if (remarks.includes('WFH')) {
      chips.push(
        <Chip
          key="wfh"
          label="WFH"
          variant="outlined"
          size="small"
          sx={{ fontSize: 10, height: 18, borderColor: colors.info, color: colors.info }}
        />
      );
    }
    if (chips.length > 0) {
      return (
        <Stack direction="row" spacing={0.5} sx={{ mt: 0.5 }}>
          {chips}
        </Stack>
      );
    }
    return null;
  };

  return (
    <Box sx={{ pb: 6 }}>
      {/* Title Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="overline" color="secondary.dark" sx={{ display: 'flex', alignItems: 'center', gap: 0.75, fontWeight: 700 }}>
          <CalendarTodayRoundedIcon sx={{ fontSize: 14 }} />
          DAILY ATTENDANCE
        </Typography>
        <Typography variant="h4" sx={{ mt: 0.5 }}>
          Attendance Tracker
        </Typography>
      </Box>

      {/* Monthly Summary Widget */}
      {monthlySummary && (
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            mb: 4,
            border: `1px solid ${colors.line}`,
            borderRadius: 3,
            bgcolor: 'background.paper',
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: colors.navy, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
            <CalendarTodayRoundedIcon sx={{ fontSize: 18 }} />
            This Month's Summary
          </Typography>
          <Grid container spacing={2}>
            {[
              { label: 'Present', value: monthlySummary.presentDays, tone: { fg: colors.success, bg: colors.successSoft } },
              { label: 'Late', value: monthlySummary.lateDays, tone: { fg: colors.amberDeep, bg: colors.amberSoft } },
              { label: 'Half Day', value: monthlySummary.halfDays, tone: { fg: colors.info, bg: colors.infoSoft } },
              { label: 'Absent', value: monthlySummary.absentDays, tone: { fg: colors.danger, bg: colors.dangerSoft } },
              { label: 'Total Hours', value: `${monthlySummary.totalWorkHours} hrs`, tone: { fg: colors.navy, bg: colors.navySoft } },
            ].map((stat, i) => (
              <Grid item xs={6} sm={2.4} key={i}>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: stat.tone.bg,
                    textAlign: 'center',
                    border: `1px solid ${stat.tone.fg}22`,
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 800, color: stat.tone.fg, lineHeight: 1.1 }}>
                    {stat.value}
                  </Typography>
                  <Typography variant="caption" sx={{ color: stat.tone.fg, fontWeight: 700, mt: 0.5, display: 'block', textTransform: 'uppercase', fontSize: 10 }}>
                    {stat.label}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}

      <Grid container spacing={3.5}>
        {/* Main Attendance Card */}
        <Grid item xs={12}>
          <Card
            sx={{
              p: 4,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 8px 32px rgba(38, 51, 92, 0.04)',
              border: `1px solid ${colors.line}`,
            }}
          >
            {/* Action Section */}
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5, color: colors.navy }}>
                Shift Attendance
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 4, lineHeight: 1.6 }}>
                {!hasCheckedIn && (
                  "Make sure your browser's location settings are enabled. Your check-in/out requests will be validated based on your proximity to the office location."
                )}
                {hasCheckedIn && !hasCheckedOut && (
                  <Box component="span" sx={{ color: colors.success, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    You're checked in since {formatTime(checkInTime)}.
                  </Box>
                )}
                {hasCheckedIn && hasCheckedOut && (
                  <Box component="span" sx={{ color: colors.success, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    Today's attendance complete ✅
                  </Box>
                )}
              </Typography>

              {/* Status & Buttons */}
              <Box sx={{ mb: 4 }}>
                {hasCheckedIn && hasCheckedOut ? (
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2.5,
                      bgcolor: colors.successSoft,
                      border: `1px solid ${colors.success}33`,
                      borderRadius: 3,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                    }}
                  >
                    <CheckCircleOutlineRoundedIcon sx={{ color: colors.success, fontSize: 32 }} />
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: colors.success }}>
                        Today's Attendance Complete
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Great job! You have completed your work shift for today.
                      </Typography>
                    </Box>
                  </Paper>
                ) : (
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2.5}>
                    {/* Check In Button */}
                    {!hasCheckedIn && (
                      <Button
                        variant="contained"
                        size="large"
                        onClick={() => handleActionClick('check-in')}
                        startIcon={<LoginRoundedIcon />}
                        sx={{
                          flex: 1,
                          bgcolor: colors.navy,
                          color: '#fff',
                          py: 2,
                          fontWeight: 700,
                          fontSize: 16,
                          '&:hover': { bgcolor: colors.navyDeep },
                        }}
                      >
                        Check In
                      </Button>
                    )}

                    {/* Check Out Button */}
                    {hasCheckedIn && !hasCheckedOut && (
                      <Button
                        variant="contained"
                        size="large"
                        onClick={() => handleActionClick('check-out')}
                        startIcon={<LogoutRoundedIcon />}
                        sx={{
                          flex: 1,
                          bgcolor: colors.amber,
                          color: colors.ink,
                          py: 2,
                          fontWeight: 700,
                          fontSize: 16,
                          '&:hover': { bgcolor: colors.amberDeep },
                        }}
                      >
                        Check Out
                      </Button>
                    )}

                    {/* Disabled visual feedback for Check Out if Check In is not done yet */}
                    {!hasCheckedIn && (
                      <Button
                        variant="outlined"
                        size="large"
                        disabled
                        startIcon={<LogoutRoundedIcon />}
                        sx={{
                          flex: 1,
                          py: 2,
                          fontWeight: 700,
                          fontSize: 16,
                          borderColor: colors.line,
                          color: 'text.disabled',
                        }}
                      >
                        Check Out
                      </Button>
                    )}
                  </Stack>
                )}
              </Box>
            </Box>

            {/* Columns Summary Bar */}
            <Box>
              <Divider sx={{ mb: 3 }} />
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center', py: 1 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Check In Time
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 800, mt: 0.5, color: hasCheckedIn ? colors.navy : 'text.disabled' }}>
                      {formatTime(checkInTime)}
                    </Typography>
                  </Box>
                </Grid>
                <Box sx={{ width: '1px', bgcolor: colors.line, my: 1.5 }} />
                <Grid item xs={6} sx={{ flexGrow: 1 }}>
                  <Box sx={{ textAlign: 'center', py: 1 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Check Out Time
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 800, mt: 0.5, color: hasCheckedOut ? colors.amber : 'text.disabled' }}>
                      {formatTime(checkOutTime)}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Card>
        </Grid>

        {/* History / Info Sidebar */}
        <Grid item xs={12}>
          <Card
            sx={{
              p: 4,
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 8px 32px rgba(38, 51, 92, 0.04)',
              border: `1px solid ${colors.line}`,
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2.5, display: 'flex', alignItems: 'center', gap: 1, color: colors.navy }}>
              <HistoryToggleOffRoundedIcon />
              Recent History
            </Typography>

            {history.length > 0 ? (
              <List sx={{ p: 0, flexGrow: 1 }}>
                {history.map((record, index) => {
                  const tone = getAttendanceStatusTone(record.status || 'Present');
                  return (
                    <Box key={record.id || index}>
                      {index > 0 && <Divider />}
                      <ListItem sx={{ px: 0, py: 2 }}>
                        <ListItemText
                          primary={formatDate(record.attendance_date)}
                          primaryTypographyProps={{ fontWeight: 700, fontSize: 14.5 }}
                          secondary={
                            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mt: 0.5, flexWrap: 'wrap', gap: 1 }}>
                              <Stack direction="row" spacing={0.5} alignItems="center" sx={{ color: 'text.secondary', fontSize: 12 }}>
                                <AccessTimeRoundedIcon sx={{ fontSize: 14 }} />
                                <span>In: {formatTime(record.check_in)}</span>
                              </Stack>
                              <Stack direction="row" spacing={0.5} alignItems="center" sx={{ color: 'text.secondary', fontSize: 12 }}>
                                <AccessTimeRoundedIcon sx={{ fontSize: 14 }} />
                                <span>Out: {formatTime(record.check_out)}</span>
                              </Stack>
                              {record.work_hours !== null && record.work_hours !== undefined && (
                                <Stack direction="row" spacing={0.5} alignItems="center" sx={{ color: colors.navy, fontSize: 12, fontWeight: 600 }}>
                                  <span>• {record.work_hours} hrs</span>
                                </Stack>
                              )}
                              {renderLocationChips(record.remarks)}
                            </Stack>
                          }
                          secondaryTypographyProps={{ component: 'div' }}
                        />
                        <Chip
                          label={record.status || 'Present'}
                          size="small"
                          sx={{
                            fontWeight: 700,
                            fontSize: 11,
                            bgcolor: tone.bg,
                            color: tone.fg,
                          }}
                        />
                      </ListItem>
                    </Box>
                  );
                })}
              </List>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexGrow: 1, py: 4, textAlign: 'center' }}>
                <CalendarTodayRoundedIcon sx={{ fontSize: 44, color: 'text.disabled', mb: 1.5 }} />
                <Typography variant="body2" color="text.secondary">
                  No attendance records yet — check in to get started.
                </Typography>
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
