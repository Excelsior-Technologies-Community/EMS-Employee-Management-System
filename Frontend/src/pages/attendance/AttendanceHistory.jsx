import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Box, Card, Typography, Button, Grid, Stack, Divider, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, CircularProgress, MenuItem, Select, FormControl, InputLabel, TextField
} from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import WarningRoundedIcon from '@mui/icons-material/WarningRounded';
import CalendarTodayRoundedIcon from '@mui/icons-material/CalendarTodayRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import { attendanceService } from '../../services/attendanceService';
import { colors } from '../../theme/colors';

const AttendanceHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [workModeFilter, setWorkModeFilter] = useState('All');
  
  // Date filters
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await attendanceService.getMyHistory(fromDate || undefined, toDate || undefined);
      if (res.data?.success && Array.isArray(res.data?.data)) {
        setHistory(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching attendance history:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchHistory();
  }, [fromDate, toDate]);

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
        year: 'numeric'
      });
    } catch (e) {
      return '';
    }
  };

  const getWorkModeLabel = (remarks) => {
    if (!remarks) return '---';
    if (remarks.includes('In-Office')) return 'In-Office';
    if (remarks.includes('WFH')) return 'WFH';
    return '---';
  };

  // Client-side filtering for Status and Work Mode
  const filteredHistory = history.filter(record => {
    const matchesStatus = statusFilter === 'All' || record.status === statusFilter;
    
    let matchesWorkMode = true;
    if (workModeFilter !== 'All') {
      const mode = getWorkModeLabel(record.remarks);
      matchesWorkMode = mode === workModeFilter;
    }

    return matchesStatus && matchesWorkMode;
  });

  return (
    <Box sx={{ pb: 6 }}>
      {/* Back to Dashboard Button */}
      <Button
        component={Link}
        to="/attendance"
        startIcon={<ArrowBackRoundedIcon />}
        sx={{
          mb: 3,
          fontWeight: 700,
          color: colors.navy,
          textTransform: 'none',
          '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' }
        }}
      >
        Back to Dashboard
      </Button>

      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="overline" color="secondary.dark" sx={{ display: 'flex', alignItems: 'center', gap: 0.75, fontWeight: 700 }}>
          <CalendarTodayRoundedIcon sx={{ fontSize: 14 }} />
          DETAILED HISTORY
        </Typography>
        <Typography variant="h4" sx={{ mt: 0.5 }}>
          Attendance Logs
        </Typography>
      </Box>

      {/* Filters Card */}
      <Card
        sx={{
          p: { xs: 2, sm: 3 },
          mb: 3.5,
          boxShadow: '0 8px 32px rgba(38, 51, 92, 0.03)',
          border: `1px solid ${colors.line}`,
          borderRadius: 3,
        }}
      >
        <Grid container spacing={2.5} alignItems="center">
          {/* From Date */}
          <Grid item xs={6} sm={6} md={3}>
            <TextField
              label="From Date"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              size="small"
            />
          </Grid>

          {/* To Date */}
          <Grid item xs={6} sm={6} md={3}>
            <TextField
              label="To Date"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              size="small"
            />
          </Grid>

          {/* Status Filter */}
          <Grid item xs={6} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel id="status-filter-label">Status</InputLabel>
              <Select
                labelId="status-filter-label"
                value={statusFilter}
                label="Status"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="All">All Statuses</MenuItem>
                <MenuItem value="Present">Present</MenuItem>
                <MenuItem value="Late">Late</MenuItem>
                <MenuItem value="Half Day">Half Day</MenuItem>
                <MenuItem value="Absent">Absent</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Work Mode Filter */}
          <Grid item xs={6} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel id="mode-filter-label">Work Mode</InputLabel>
              <Select
                labelId="mode-filter-label"
                value={workModeFilter}
                label="Work Mode"
                onChange={(e) => setWorkModeFilter(e.target.value)}
              >
                <MenuItem value="All">All Modes</MenuItem>
                <MenuItem value="In-Office">In-Office</MenuItem>
                <MenuItem value="WFH">WFH</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Card>

      {/* History Table Container */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress color="secondary" />
        </Box>
      ) : filteredHistory.length > 0 ? (
        <>
          {/* Desktop and Tablet Table view */}
          <TableContainer
            component={Paper}
            elevation={0}
            sx={{
              display: { xs: 'none', md: 'block' },
              border: `1px solid ${colors.line}`,
              borderRadius: 3,
              overflowX: 'auto',
              boxShadow: '0 8px 32px rgba(38, 51, 92, 0.02)',
            }}
          >
            <Table sx={{ minWidth: 700 }}>
              <TableHead sx={{ bgcolor: colors.navySoft }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, fontSize: 13, color: colors.navy }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: 13, color: colors.navy }}>Check In</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: 13, color: colors.navy }}>Check Out</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: 13, color: colors.navy, textAlign: 'center' }}>Total Hours</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: 13, color: colors.navy }}>Work Mode</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: 13, color: colors.navy }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: 13, color: colors.navy }}>Indicators</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredHistory.map((record) => {
                  const recordDate = new Date(record.attendance_date).toISOString().split('T')[0];
                  const todayStr = new Date().toISOString().split('T')[0];
                  const isPast = recordDate < todayStr;
                  const isMissing = isPast && (!record.check_in || !record.check_out);

                  let statusColor = 'default';
                  if (record.status === 'Present') statusColor = 'success';
                  if (record.status === 'Late') statusColor = 'warning';
                  if (record.status === 'Half Day') statusColor = 'info';
                  if (record.status === 'Absent') statusColor = 'error';

                  return (
                    <TableRow key={record.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                      <TableCell sx={{ fontWeight: 700, color: colors.navy }}>
                        {formatDate(record.attendance_date)}
                      </TableCell>
                      
                      <TableCell sx={{ fontSize: 13 }}>
                        {formatTime(record.check_in)}
                      </TableCell>
                      
                      <TableCell sx={{ fontSize: 13 }}>
                        {formatTime(record.check_out)}
                      </TableCell>
                      
                      <TableCell sx={{ fontSize: 13, fontWeight: 700, textAlign: 'center' }}>
                        {record.work_hours !== null && record.work_hours !== undefined ? `${record.work_hours} hrs` : '---'}
                      </TableCell>
                      
                      <TableCell>
                        <Chip
                          label={getWorkModeLabel(record.remarks)}
                          size="small"
                          variant="outlined"
                          sx={{
                            fontWeight: 600,
                            fontSize: 11,
                            height: 22,
                            ...(getWorkModeLabel(record.remarks) === 'In-Office' && {
                              borderColor: colors.navy,
                              color: colors.navy
                            }),
                            ...(getWorkModeLabel(record.remarks) === 'WFH' && {
                              borderColor: colors.info,
                              color: colors.info
                            })
                          }}
                        />
                      </TableCell>
                      
                      <TableCell>
                        <Chip
                          label={record.status || 'Present'}
                          size="small"
                          color={statusColor}
                          sx={{ fontWeight: 700, fontSize: 11, height: 22 }}
                        />
                      </TableCell>

                      <TableCell>
                        {isMissing ? (
                          <Chip
                            icon={<WarningRoundedIcon sx={{ fontSize: '13px !important' }} />}
                            label="Action Required"
                            size="small"
                            color="error"
                            variant="outlined"
                            sx={{ fontWeight: 700, fontSize: 10, height: 22 }}
                          />
                        ) : (
                          <Typography variant="caption" color="text.secondary">
                            ---
                          </Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Mobile and Tablet Card view */}
          <Box sx={{ display: { xs: 'block', md: 'none' } }}>
            {filteredHistory.map((record) => {
              const recordDate = new Date(record.attendance_date).toISOString().split('T')[0];
              const todayStr = new Date().toISOString().split('T')[0];
              const isPast = recordDate < todayStr;
              const isMissing = isPast && (!record.check_in || !record.check_out);

              let statusColor = 'default';
              if (record.status === 'Present') statusColor = 'success';
              if (record.status === 'Late') statusColor = 'warning';
              if (record.status === 'Half Day') statusColor = 'info';
              if (record.status === 'Absent') statusColor = 'error';

              const workMode = getWorkModeLabel(record.remarks);

              return (
                <Paper
                  key={record.id}
                  elevation={0}
                  sx={{
                    p: 2,
                    mb: 2,
                    border: `1px solid ${colors.line}`,
                    borderRadius: 2.5,
                    bgcolor: 'background.paper',
                  }}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: colors.navy }}>
                      {formatDate(record.attendance_date)}
                    </Typography>
                    <Chip
                      label={record.status || 'Present'}
                      size="small"
                      color={statusColor}
                      sx={{ fontWeight: 700, fontSize: 11, height: 22 }}
                    />
                  </Stack>

                  <Divider sx={{ my: 1.25, borderStyle: 'dashed' }} />

                  <Grid container spacing={1.5} sx={{ mb: 1.5 }}>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 600 }}>
                        CHECK IN
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {formatTime(record.check_in)}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 600 }}>
                        CHECK OUT
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {formatTime(record.check_out)}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 600 }}>
                        TOTAL HOURS
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: colors.navy }}>
                        {record.work_hours !== null && record.work_hours !== undefined ? `${record.work_hours} hrs` : '---'}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 600 }}>
                        WORK MODE
                      </Typography>
                      {workMode !== '---' ? (
                        <Chip
                          label={workMode}
                          size="small"
                          variant="outlined"
                          sx={{
                            fontWeight: 600,
                            fontSize: 10,
                            height: 18,
                            mt: 0.25,
                            borderColor: workMode === 'In-Office' ? colors.navy : colors.info,
                            color: workMode === 'In-Office' ? colors.navy : colors.info
                          }}
                        />
                      ) : (
                        <Typography variant="body2">---</Typography>
                      )}
                    </Grid>
                  </Grid>

                  {isMissing && (
                    <Box sx={{ mt: 1.5, pt: 1.5, borderTop: `1px solid ${colors.line}` }}>
                      <Chip
                        icon={<WarningRoundedIcon sx={{ fontSize: '13px !important' }} />}
                        label="Action Required: Contact Admin/HR"
                        size="small"
                        color="error"
                        variant="outlined"
                        sx={{ fontWeight: 700, fontSize: 10, height: 22, width: '100%', justifyContent: 'center' }}
                      />
                    </Box>
                  )}
                </Paper>
              );
            })}
          </Box>
        </>
      ) : (
        <Paper
          elevation={0}
          sx={{
            p: 6,
            border: `1px dashed ${colors.line}`,
            borderRadius: 3,
            textAlign: 'center',
            bgcolor: 'background.paper'
          }}
        >
          <WarningRoundedIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: colors.navy, mb: 0.5 }}>
            No records match the active filters
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Try adjusting your search filters or dates.
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default AttendanceHistory;
