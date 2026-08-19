import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import {
  Box, Card, Typography, Grid, Stack, MenuItem, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Alert, Divider, CircularProgress, Button
} from '@mui/material';
import EventNoteRoundedIcon from '@mui/icons-material/EventNoteRounded';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';

import CustomInput from '../../components/common/CustomInput';
import CustomButton from '../../components/common/CustomButton';
import Loader from '../../components/common/Loader';
import { leaveService } from '../../services/leaveService';
import { useFetch } from '../../hooks/useFetch';
import { getErrorMessage } from '../../services/api';
import { colors } from '../../theme/colors';

const Leaves = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch Leave History
  const { data: leaves = [], loading: loadingHistory, refetch: refetchHistory } = useFetch(
    () => leaveService.getMyLeaves(),
    []
  );

  const safeLeaves = leaves || [];
  const recentLeaves = safeLeaves.slice(0, 3);

  // Fetch Leave Types
  const { data: leaveTypes = [], loading: loadingTypes } = useFetch(
    () => leaveService.getLeaveTypes(),
    []
  );

  // Form Setup
  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      leave_type_id: '',
      start_date: '',
      end_date: '',
      reason: ''
    }
  });

  const onSubmit = async (values) => {
    setSuccessMsg('');
    setErrorMsg('');

    // Custom validations
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const todayStr = `${yyyy}-${mm}-${dd}`;

    if (values.start_date < todayStr) {
      setErrorMsg('Start date cannot be in the past.');
      return;
    }

    if (values.start_date > values.end_date) {
      setErrorMsg('Start date cannot be greater than end date.');
      return;
    }

    setSubmitting(true);
    try {
      await leaveService.applyLeave({
        leave_type_id: parseInt(values.leave_type_id, 10),
        start_date: values.start_date,
        end_date: values.end_date,
        reason: values.reason
      });
      setSuccessMsg('Leave application submitted successfully.');
      reset();
      refetchHistory(); // Refresh history table
    } catch (err) {
      setErrorMsg(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  // Helper: Format Date
  const formatDateStr = (dateString) => {
    if (!dateString) return '---';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  };

  // Status Chips styles
  const getStatusChip = (status) => {
    let chipStyles = { fontWeight: 700, fontSize: 11 };
    switch (status) {
      case 'Approved':
        return <Chip label={status} size="small" sx={{ ...chipStyles, bgcolor: colors.successSoft, color: colors.success }} />;
      case 'Rejected':
        return <Chip label={status} size="small" sx={{ ...chipStyles, bgcolor: colors.dangerSoft, color: colors.danger }} />;
      case 'Cancelled':
        return <Chip label={status} size="small" sx={{ ...chipStyles, bgcolor: colors.line, color: colors.inkSoft }} />;
      case 'Pending':
      default:
        return <Chip label={status} size="small" sx={{ ...chipStyles, bgcolor: colors.amberSoft, color: colors.amberDeep }} />;
    }
  };

  if (loadingHistory || loadingTypes) {
    return <Loader label="Loading leave configurations..." />;
  }

  // Calculate metrics
  const totalApplied = safeLeaves.length;
  const totalPending = safeLeaves.filter(l => l.status === 'Pending').length;
  const totalApproved = safeLeaves.filter(l => l.status === 'Approved').length;
  const totalRejected = safeLeaves.filter(l => l.status === 'Rejected').length;

  // Filter active leave types
  const activeLeaveTypes = leaveTypes.filter(t => t.status === 1);

  return (
    <Box sx={{ pb: 6 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="overline" color="secondary.dark" sx={{ display: 'flex', alignItems: 'center', gap: 0.75, fontWeight: 700 }}>
          <CalendarMonthRoundedIcon sx={{ fontSize: 14 }} />
          LEAVE PORTAL
        </Typography>
        <Typography variant="h4" sx={{ mt: 0.5 }}>
          Leave Management
        </Typography>
      </Box>

      {/* Metrics Row */}
      <Grid container spacing={{ xs: 1.5, sm: 2.5 }} sx={{ mb: 4.5 }}>
        {[
          { label: 'Total Requests', value: totalApplied, tone: { fg: colors.navy, bg: colors.navySoft } },
          { label: 'Pending Approval', value: totalPending, tone: { fg: colors.amberDeep, bg: colors.amberSoft } },
          { label: 'Approved', value: totalApproved, tone: { fg: colors.success, bg: colors.successSoft } },
          { label: 'Rejected / Cancelled', value: totalRejected, tone: { fg: colors.danger, bg: colors.dangerSoft } }
        ].map((stat, idx) => (
          <Grid size={{ xs: 6, sm: 3 }} key={idx}>
            <Box
              sx={{
                p: { xs: 1.5, sm: 2 },
                borderRadius: 3,
                bgcolor: stat.tone.bg,
                border: `1px solid ${stat.tone.fg}18`,
                textAlign: 'center'
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

      {/* Form and History */}
      <Grid container spacing={{ xs: 3, md: 4 }}>
        {/* Left Column: Apply Form */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card
            sx={{
              p: { xs: 2, sm: 3.5 },
              boxShadow: '0 8px 32px rgba(38, 51, 92, 0.03)',
              border: `1px solid ${colors.line}`
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: colors.navy, display: 'flex', alignItems: 'center', gap: 1 }}>
              <EventNoteRoundedIcon />
              Apply for Leave
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Select your leave category, dates, and provide a clear reason. Your request will be evaluated by your reporting manager.
            </Typography>

            <Divider sx={{ mb: 2.5 }} />

            {errorMsg && <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>{errorMsg}</Alert>}
            {successMsg && <Alert severity="success" sx={{ mb: 2.5, borderRadius: 2 }}>{successMsg}</Alert>}

            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <CustomInput
                name="leave_type_id"
                control={control}
                label="Leave Category"
                select
                rules={{ required: 'Please select a leave category' }}
              >
                {activeLeaveTypes.map((type) => (
                  <MenuItem key={type.id} value={type.id}>
                    {type.leave_name}
                  </MenuItem>
                ))}
              </CustomInput>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <CustomInput
                    name="start_date"
                    control={control}
                    label="Start Date"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    rules={{ required: 'Start date is required' }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <CustomInput
                    name="end_date"
                    control={control}
                    label="End Date"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    rules={{ required: 'End date is required' }}
                  />
                </Grid>
              </Grid>

              <CustomInput
                name="reason"
                control={control}
                label="Reason for Leave"
                multiline
                rows={3}
                rules={{ required: 'Please specify the reason' }}
              />

              <CustomButton
                type="submit"
                loading={submitting}
                variant="contained"
                fullWidth
                startIcon={<SendRoundedIcon fontSize="small" />}
                sx={{
                  mt: 2.5,
                  py: 1.5,
                  bgcolor: colors.navy,
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: 14.5,
                  '&:hover': { bgcolor: colors.navyDeep }
                }}
              >
                Submit Application
              </CustomButton>
            </form>
          </Card>
        </Grid>

        {/* Right Column: Leave History */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card
            sx={{
              p: { xs: 2, sm: 3.5 },
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 8px 32px rgba(38, 51, 92, 0.03)',
              border: `1px solid ${colors.line}`
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5, color: colors.navy, display: 'flex', alignItems: 'center', gap: 1 }}>
              <HistoryRoundedIcon />
              Application History
            </Typography>

            {safeLeaves.length > 0 ? (
              <>
                {/* Desktop and Tablet Table view */}
                <TableContainer 
                  component={Paper} 
                  elevation={0} 
                  sx={{ 
                    display: { xs: 'none', sm: 'block' },
                    border: `1px solid ${colors.line}`, 
                    borderRadius: 2, 
                    flexGrow: 1, 
                    overflowX: 'auto' 
                  }}
                >
                  <Table sx={{ minWidth: 500 }} aria-label="leave history table">
                    <TableHead sx={{ bgcolor: colors.navySoft }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700, fontSize: 13, color: colors.navy }}>Category</TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: 13, color: colors.navy }}>Duration</TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: 13, color: colors.navy, textAlign: 'center' }}>Days</TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: 13, color: colors.navy }}>Reason</TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: 13, color: colors.navy }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: 13, color: colors.navy }}>Action By</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {recentLeaves.map((leave) => (
                        <TableRow key={leave.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                          <TableCell sx={{ fontSize: 13.5, fontWeight: 600 }}>{leave.leave_name}</TableCell>
                          <TableCell sx={{ fontSize: 13 }}>
                            <Box sx={{ whiteSpace: 'nowrap' }}>
                              {formatDateStr(leave.start_date)}
                            </Box>
                            <Box sx={{ fontSize: 11, color: 'text.secondary', mt: 0.25 }}>
                              to {formatDateStr(leave.end_date)}
                            </Box>
                          </TableCell>
                          <TableCell sx={{ fontSize: 13.5, fontWeight: 700, textAlign: 'center' }}>{leave.total_days}</TableCell>
                          <TableCell sx={{ fontSize: 13, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={leave.reason}>
                            {leave.reason}
                          </TableCell>
                          <TableCell>{getStatusChip(leave.status)}</TableCell>
                          <TableCell sx={{ fontSize: 13 }}>
                            {leave.approved_by_name ? (
                              <Box>
                                <Box sx={{ fontWeight: 600, color: colors.navy }}>{leave.approved_by_name}</Box>
                                <Box sx={{ fontSize: 11, color: 'text.secondary' }}>({leave.approved_by_role})</Box>
                                {leave.rejection_reason && leave.status === 'Rejected' && (
                                  <Box sx={{ fontSize: 11, color: colors.danger, mt: 0.5, fontStyle: 'italic', maxWidth: 200, whiteSpace: 'normal' }}>
                                    Reason: {leave.rejection_reason}
                                  </Box>
                                )}
                              </Box>
                            ) : (
                              '—'
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                {/* Mobile Card view */}
                <Box sx={{ display: { xs: 'block', sm: 'none' }, flexGrow: 1 }}>
                  {recentLeaves.map((leave) => (
                    <Paper
                      key={leave.id}
                      elevation={0}
                      sx={{
                        p: 2,
                        mb: 2,
                        border: `1px solid ${colors.line}`,
                        borderRadius: 2.5,
                        bgcolor: 'background.paper',
                      }}
                    >
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1.5 }}>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: colors.navy }}>
                            {leave.leave_name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatDateStr(leave.start_date)} - {formatDateStr(leave.end_date)}
                          </Typography>
                        </Box>
                        {getStatusChip(leave.status)}
                      </Stack>
                      
                      <Divider sx={{ my: 1.25, borderStyle: 'dashed' }} />
                      
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="caption" sx={{ color: colors.navy, fontWeight: 700, bgcolor: colors.navySoft, px: 1.25, py: 0.5, borderRadius: 1.5 }}>
                          {leave.total_days} {leave.total_days === 1 ? 'Day' : 'Days'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: '65%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={leave.reason}>
                          {leave.reason}
                        </Typography>
                      </Stack>
                      <Box sx={{ mt: 1.5, pt: 1.5, borderTop: `1px solid ${colors.line}`, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                          Action By: {leave.approved_by_name ? `${leave.approved_by_name} (${leave.approved_by_role})` : '—'}
                        </Typography>
                        {leave.rejection_reason && leave.status === 'Rejected' && (
                          <Typography variant="caption" color="error" sx={{ fontStyle: 'italic' }}>
                            Rejection Reason: {leave.rejection_reason}
                          </Typography>
                        )}
                      </Box>
                    </Paper>
                  ))}
                </Box>

                {/* View All Button */}
                <Box sx={{ mt: 'auto', pt: 2, display: 'flex', justifyContent: 'center' }}>
                  <Button
                    variant="text"
                    color="primary"
                    onClick={() => navigate('/leaves/history')}
                    sx={{
                      fontWeight: 700,
                      textTransform: 'none',
                      color: colors.navy,
                      '&:hover': {
                        bgcolor: colors.navySoft
                      }
                    }}
                  >
                    View All Applications
                  </Button>
                </Box>
              </>
            ) : (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexGrow: 1,
                  py: 6,
                  textAlign: 'center',
                  border: `1px dashed ${colors.line}`,
                  borderRadius: 2
                }}
              >
                <EventNoteRoundedIcon sx={{ fontSize: 44, color: 'text.disabled', mb: 2 }} />
                <Typography variant="body2" color="text.secondary">
                  You haven't submitted any leave applications yet.
                </Typography>
              </Box>
            )}
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Leaves;
