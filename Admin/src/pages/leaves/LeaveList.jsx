import { useState, useMemo } from 'react';
import {
  Box, IconButton, Tooltip, Chip, FormControl, InputLabel, Select, MenuItem,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, TextField,
  Stack, useTheme, useMediaQuery, Collapse, Button, Grid, Avatar, InputAdornment, Card, Typography, Divider
} from '@mui/material';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import FilterListRoundedIcon from '@mui/icons-material/FilterListRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import EventNoteRoundedIcon from '@mui/icons-material/EventNoteRounded';
import toast from 'react-hot-toast';

import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import CustomButton from '../../components/common/CustomButton';
import Loader from '../../components/common/Loader';
import { useAuth } from '../../context/AuthContext';
import { useFetch } from '../../hooks/useFetch';
import { leaveService } from '../../services/leaveService';
import { getErrorMessage } from '../../services/api';
import { colors, getAvatarGradient } from '../../theme/colors';
import { getInitials } from '../../utils/validators';

const LeaveList = () => {
  const { user } = useAuth();
  const theme = useTheme();
  const isMobileOrTablet = useMediaQuery(theme.breakpoints.down('md'));

  // Fetch Leaves
  const { data: res, loading, refetch } = useFetch(() => leaveService.getAll(), []);
  const leaves = res?.data || [];

  // Fetch Leave Types for filtering
  const { data: typeRes } = useFetch(() => leaveService.getLeaveTypes(), []);
  const leaveTypes = typeRes?.data || [];

  // Filter states
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Dialog action states
  const [approveTarget, setApproveTarget] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [reason, setReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Active filters count helper
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (statusFilter !== 'all') count++;
    if (typeFilter !== 'all') count++;
    if (startDateFilter) count++;
    if (endDateFilter) count++;
    return count;
  }, [statusFilter, typeFilter, startDateFilter, endDateFilter]);

  // Filter leaves locally
  const filteredLeaves = useMemo(() => {
    return leaves.filter((leave) => {
      // 1. Status Filter
      if (statusFilter !== 'all' && leave.status !== statusFilter) {
        return false;
      }
      // 2. Type Filter
      if (typeFilter !== 'all' && leave.leave_type_id !== Number(typeFilter)) {
        return false;
      }
      // 3. Start Date Filter (leave starts after or on startDateFilter)
      if (startDateFilter && leave.start_date < startDateFilter) {
        return false;
      }
      // 4. End Date Filter (leave ends before or on endDateFilter)
      if (endDateFilter && leave.end_date > endDateFilter) {
        return false;
      }
      // 5. Search Query Filter
      if (searchQuery.trim()) {
        const term = searchQuery.trim().toLowerCase();
        const matches = [
          leave.employee_name,
          leave.employee_email,
          leave.department_name,
          leave.leave_name,
          leave.reason
        ].some((val) => String(val ?? '').toLowerCase().includes(term));
        if (!matches) return false;
      }
      return true;
    });
  }, [leaves, statusFilter, typeFilter, startDateFilter, endDateFilter, searchQuery]);

  // Handle Approve
  const handleApprove = async () => {
    if (!approveTarget) return;
    setActionLoading(true);
    try {
      await leaveService.approve(approveTarget.id, reason);
      toast.success('Leave approved successfully!');
      setApproveTarget(null);
      setReason('');
      refetch();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Reject
  const handleReject = async () => {
    if (!rejectTarget) return;
    if (!reason.trim()) {
      toast.error('Rejection reason is required.');
      return;
    }
    setActionLoading(true);
    try {
      await leaveService.reject(rejectTarget.id, reason);
      toast.success('Leave rejected successfully!');
      setRejectTarget(null);
      setReason('');
      refetch();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setActionLoading(false);
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
        return <Chip label={status} size="small" sx={{ ...chipStyles, bgcolor: colors.neutralSoft, color: colors.inkSoft }} />;
      case 'Pending':
      default:
        return <Chip label={status} size="small" sx={{ ...chipStyles, bgcolor: colors.amberSoft, color: colors.amberDeep }} />;
    }
  };

  const columns = [
    { key: 'employee_name', label: 'Employee', render: (row) => (
      <Box>
        <Box sx={{ fontWeight: 600, color: colors.ink }}>{row.employee_name}</Box>
        <Box sx={{ fontSize: 11, color: colors.inkSoft }}>{row.employee_email}</Box>
      </Box>
    )},
    { key: 'department_name', label: 'Department', render: (row) => row.department_name || '—' },
    { key: 'leave_name', label: 'Category', sx: { fontWeight: 600 } },
    { key: 'duration', label: 'Duration', render: (row) => (
      <Box>
        <Box sx={{ whiteSpace: 'nowrap', fontSize: 12.5 }}>{formatDateStr(row.start_date)}</Box>
        <Box sx={{ fontSize: 11, color: colors.inkSoft }}>to {formatDateStr(row.end_date)}</Box>
      </Box>
    )},
    { key: 'total_days', label: 'Days', sx: { fontWeight: 700, textAlign: 'center' } },
    { key: 'reason', label: 'Reason', sx: { maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }, render: (row) => (
      <span title={row.reason}>{row.reason || '—'}</span>
    )},
    { key: 'status', label: 'Status', render: (row) => getStatusChip(row.status) },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      render: (row) => {
        if (row.status !== 'Pending') return '—';
        return (
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Tooltip title="Approve">
              <IconButton size="small" color="success" onClick={() => { setApproveTarget(row); setReason(''); }}>
                <CheckCircleRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Reject">
              <IconButton size="small" color="error" onClick={() => { setRejectTarget(row); setReason(''); }}>
                <CancelRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        );
      }
    }
  ];

  return (
    <Box>
      <PageHeader
        title="Leave Management"
        crumbs={[{ label: 'Dashboard', path: '/dashboard' }, { label: 'Leaves' }]}
      />

      {/* Unified Search and Collapsible Filter Panel */}
      <Card
        sx={{
          p: 2,
          mb: 3,
          boxShadow: '0 4px 12px rgba(38, 51, 92, 0.03)',
          border: `1px solid ${colors.line}`,
          borderRadius: 2.5
        }}
      >
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" justifyContent="space-between">
          <TextField
            size="small"
            placeholder="Search by name, email, department, category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ width: { xs: '100%', sm: 320 } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon fontSize="small" sx={{ color: colors.inkSoft }} />
                </InputAdornment>
              ),
              endAdornment: searchQuery && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setSearchQuery('')}>
                    <CancelRoundedIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              )
            }}
          />

          <Stack direction="row" spacing={1.5} sx={{ width: { xs: '100%', sm: 'auto' }, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              size="medium"
              startIcon={<FilterListRoundedIcon />}
              onClick={() => setShowFilters(!showFilters)}
              sx={{
                borderColor: colors.line,
                color: colors.ink,
                '&:hover': { borderColor: colors.navy, bgcolor: colors.navySoft },
                fontWeight: 600,
                textTransform: 'none',
                px: 2,
                borderRadius: 2
              }}
            >
              Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
            </Button>

            {activeFiltersCount > 0 && (
              <Button
                variant="text"
                color="error"
                size="medium"
                onClick={() => {
                  setStatusFilter('all');
                  setTypeFilter('all');
                  setStartDateFilter('');
                  setEndDateFilter('');
                }}
                sx={{ fontWeight: 600, textTransform: 'none' }}
              >
                Clear
              </Button>
            )}
          </Stack>
        </Stack>

        <Collapse in={showFilters} timeout="auto" unmountOnExit>
          <Box sx={{ mt: 2, pt: 2, borderTop: `1px dashed ${colors.line}` }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <FormControl size="small" fullWidth>
                  <InputLabel id="status-filter-label">Status</InputLabel>
                  <Select
                    labelId="status-filter-label"
                    value={statusFilter}
                    label="Status"
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <MenuItem value="all">All Statuses</MenuItem>
                    <MenuItem value="Pending">Pending</MenuItem>
                    <MenuItem value="Approved">Approved</MenuItem>
                    <MenuItem value="Rejected">Rejected</MenuItem>
                    <MenuItem value="Cancelled">Cancelled</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <FormControl size="small" fullWidth>
                  <InputLabel id="type-filter-label">Leave Type</InputLabel>
                  <Select
                    labelId="type-filter-label"
                    value={typeFilter}
                    label="Leave Type"
                    onChange={(e) => setTypeFilter(e.target.value)}
                  >
                    <MenuItem value="all">All Types</MenuItem>
                    {leaveTypes.map((t) => (
                      <MenuItem key={t.id} value={t.id}>{t.leave_name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <TextField
                  size="small"
                  label="From Date"
                  type="date"
                  fullWidth
                  value={startDateFilter}
                  onChange={(e) => setStartDateFilter(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <TextField
                  size="small"
                  label="To Date"
                  type="date"
                  fullWidth
                  value={endDateFilter}
                  onChange={(e) => setEndDateFilter(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>
          </Box>
        </Collapse>
      </Card>

      {/* Main Content Layout */}
      {isMobileOrTablet ? (
        loading ? (
          <Loader label="Loading leaves..." minHeight="30vh" />
        ) : filteredLeaves.length === 0 ? (
          <Card sx={{ p: 4, textAlign: 'center', border: `1px dashed ${colors.line}`, boxShadow: 'none', borderRadius: 2.5 }}>
            <Typography color="text.secondary">No leave applications found.</Typography>
          </Card>
        ) : (
          <Grid container spacing={2.5}>
            {filteredLeaves.map((leave) => (
              <Grid size={{ xs: 12, sm: 6 }} key={leave.id} sx={{ display: 'flex' }}>
                <Card
                  sx={{
                    p: 2.5,
                    border: `1px solid ${colors.line}`,
                    boxShadow: '0 4px 16px rgba(38, 51, 92, 0.02)',
                    borderRadius: 3,
                    bgcolor: colors.surface,
                    display: 'flex',
                    flexDirection: 'column',
                    width: '100%',
                    height: '100%',
                    justifyContent: 'space-between'
                  }}
                >
                  <Box>
                    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
                      <Avatar
                        sx={{
                          width: 40,
                          height: 40,
                          fontSize: 14,
                          fontWeight: 700,
                          background: getAvatarGradient(leave.employee_name || '')
                        }}
                      >
                        {getInitials(leave.employee_name)}
                      </Avatar>
                      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Typography sx={{ fontWeight: 700, fontSize: 14.5, color: colors.ink }} noWrap>
                          {leave.employee_name}
                        </Typography>
                        <Typography sx={{ fontSize: 11, color: colors.inkSoft }} noWrap>
                          {leave.employee_email} • {leave.department_name || 'No Department'}
                        </Typography>
                      </Box>
                      <Box sx={{ flexShrink: 0 }}>
                        {getStatusChip(leave.status)}
                      </Box>
                    </Stack>

                    <Divider sx={{ mb: 2, borderStyle: 'dashed' }} />
                  </Box>

                  <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    <Stack spacing={1.25} sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <EventNoteRoundedIcon sx={{ fontSize: 16, color: colors.navy }} />
                        <Typography variant="body2" sx={{ fontWeight: 600, color: colors.navy }}>
                          {leave.leave_name}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CalendarMonthRoundedIcon sx={{ fontSize: 16, color: colors.inkSoft }} />
                        <Typography variant="caption" sx={{ color: colors.inkSoft, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                          {formatDateStr(leave.start_date)} - {formatDateStr(leave.end_date)}
                          <Chip
                            label={`${leave.total_days} ${leave.total_days === 1 ? 'Day' : 'Days'}`}
                            size="small"
                            sx={{
                              fontWeight: 700,
                              height: 20,
                              fontSize: 10,
                              bgcolor: colors.navySoft,
                              color: colors.navy
                            }}
                          />
                        </Typography>
                      </Box>

                      {leave.reason && (
                        <Box sx={{ pl: 1.5, borderLeft: `2px solid ${colors.line}`, mt: 0.5 }}>
                          <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic', fontSize: 12.5, lineHeight: 1.4 }}>
                            "{leave.reason}"
                          </Typography>
                        </Box>
                      )}

                      {leave.status_reason && (
                        <Box
                          sx={{
                            pl: 1.5,
                            borderLeft: `2px solid ${leave.status === 'Approved' ? colors.success : colors.danger}`,
                            mt: 0.5
                          }}
                        >
                          <Typography
                            variant="caption"
                            sx={{
                              color: leave.status === 'Approved' ? colors.success : colors.danger,
                              fontWeight: 700,
                              display: 'block'
                            }}
                          >
                            Response: "{leave.status_reason}"
                          </Typography>
                        </Box>
                      )}
                    </Stack>
                  </Box>

                  {leave.status === 'Pending' && (
                    <Box sx={{ mt: 2.5, pt: 2, borderTop: `1px solid ${colors.line}`, display: 'flex', gap: 1.5 }}>
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        fullWidth
                        startIcon={<CancelRoundedIcon />}
                        onClick={() => { setRejectTarget(leave); setReason(''); }}
                        sx={{
                          fontWeight: 700,
                          textTransform: 'none',
                          borderRadius: 2,
                          py: 0.75,
                          borderColor: colors.dangerSoft,
                          bgcolor: colors.dangerSoft,
                          color: colors.danger,
                          '&:hover': {
                            bgcolor: colors.danger,
                            color: '#fff',
                            borderColor: colors.danger
                          }
                        }}
                      >
                        Reject
                      </Button>
                      <Button
                        variant="contained"
                        color="success"
                        size="small"
                        fullWidth
                        startIcon={<CheckCircleRoundedIcon />}
                        onClick={() => { setApproveTarget(leave); setReason(''); }}
                        sx={{
                          fontWeight: 700,
                          textTransform: 'none',
                          borderRadius: 2,
                          py: 0.75,
                          bgcolor: colors.success,
                          color: '#fff',
                          boxShadow: 'none',
                          '&:hover': {
                            bgcolor: colors.success + 'ee',
                            boxShadow: 'none'
                          }
                        }}
                      >
                        Approve
                      </Button>
                    </Box>
                  )}
                </Card>
              </Grid>
            ))}
          </Grid>
        )
      ) : (
        /* Desktop Table View */
        <DataTable
          columns={columns}
          rows={filteredLeaves}
          loading={loading}
          hideSearch={true}
          emptyLabel="No leave applications found."
        />
      )}

      {/* Approve Dialog */}
      <Dialog open={!!approveTarget} onClose={() => !actionLoading && setApproveTarget(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: colors.navy }}>Approve Leave Application</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Are you sure you want to approve the leave request for <strong>{approveTarget?.employee_name}</strong>?
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Approval Reason (Optional)"
            type="text"
            fullWidth
            variant="outlined"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            disabled={actionLoading}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <CustomButton variant="text" color="inherit" onClick={() => setApproveTarget(null)} disabled={actionLoading}>
            Cancel
          </CustomButton>
          <CustomButton color="success" loading={actionLoading} onClick={handleApprove}>
            Approve
          </CustomButton>
        </DialogActions>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={!!rejectTarget} onClose={() => !actionLoading && setRejectTarget(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: colors.danger }}>Reject Leave Application</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Are you sure you want to reject the leave request for <strong>{rejectTarget?.employee_name}</strong>?
            Please provide a rejection reason below (required):
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Rejection Reason"
            type="text"
            fullWidth
            variant="outlined"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            disabled={actionLoading}
            error={!reason.trim()}
            helperText={!reason.trim() ? "Rejection reason is required." : ""}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <CustomButton variant="text" color="inherit" onClick={() => setRejectTarget(null)} disabled={actionLoading}>
            Cancel
          </CustomButton>
          <CustomButton color="error" loading={actionLoading} onClick={handleReject} disabled={!reason.trim()}>
            Reject
          </CustomButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LeaveList;
