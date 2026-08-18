import { useState, useMemo } from 'react';
import {
  Box, IconButton, Tooltip, Chip, FormControl, InputLabel, Select, MenuItem,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, TextField,
  Stack
} from '@mui/material';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import toast from 'react-hot-toast';

import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import CustomButton from '../../components/common/CustomButton';
import Loader from '../../components/common/Loader';
import { useAuth } from '../../context/AuthContext';
import { useFetch } from '../../hooks/useFetch';
import { leaveService } from '../../services/leaveService';
import { getErrorMessage } from '../../services/api';
import { colors } from '../../theme/colors';

const LeaveList = () => {
  const { user } = useAuth();

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

  // Dialog action states
  const [approveTarget, setApproveTarget] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [reason, setReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

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
      return true;
    });
  }, [leaves, statusFilter, typeFilter, startDateFilter, endDateFilter]);

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

      <DataTable
        columns={columns}
        rows={filteredLeaves}
        loading={loading}
        searchKeys={['employee_name', 'employee_email', 'department_name', 'leave_name', 'reason']}
        searchPlaceholder="Search by name, email, department..."
        emptyLabel="No leave applications found."
        toolbarAction={
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ minWidth: { sm: 600 }, flexGrow: 1, justifyContent: 'flex-end' }}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
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

            <FormControl size="small" sx={{ minWidth: 140 }}>
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

            <TextField
              size="small"
              label="From Date"
              type="date"
              value={startDateFilter}
              onChange={(e) => setStartDateFilter(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ width: 130 }}
            />

            <TextField
              size="small"
              label="To Date"
              type="date"
              value={endDateFilter}
              onChange={(e) => setEndDateFilter(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ width: 130 }}
            />
          </Stack>
        }
      />

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
