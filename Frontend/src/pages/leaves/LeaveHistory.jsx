import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Card, Typography, Grid, Stack, Chip, IconButton,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Divider, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import EventNoteRoundedIcon from '@mui/icons-material/EventNoteRounded';

import Loader from '../../components/common/Loader';
import { leaveService } from '../../services/leaveService';
import { useFetch } from '../../hooks/useFetch';
import { colors } from '../../theme/colors';

const LeaveHistory = () => {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Fetch Leave History
  const { data: leaves = [], loading } = useFetch(
    () => leaveService.getMyLeaves(),
    []
  );

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

  if (loading) {
    return <Loader label="Loading leave history..." />;
  }

  const safeLeaves = leaves || [];

  // Extract unique categories for filter
  const leaveCategories = Array.from(new Set(safeLeaves.map(l => l.leave_name).filter(Boolean)));

  // Filter leaves
  const filteredLeaves = safeLeaves.filter(leave => {
    const matchesStatus = statusFilter === 'All' || leave.status === statusFilter;
    const matchesCategory = categoryFilter === 'All' || leave.leave_name === categoryFilter;
    return matchesStatus && matchesCategory;
  });

  // Calculate metrics based on ALL requests
  const totalApplied = safeLeaves.length;
  const totalPending = safeLeaves.filter(l => l.status === 'Pending').length;
  const totalApproved = safeLeaves.filter(l => l.status === 'Approved').length;
  const totalRejected = safeLeaves.filter(l => l.status === 'Rejected' || l.status === 'Cancelled').length;

  return (
    <Box sx={{ pb: 6 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="overline" color="secondary.dark" sx={{ display: 'flex', alignItems: 'center', gap: 0.75, fontWeight: 700 }}>
          <CalendarMonthRoundedIcon sx={{ fontSize: 14 }} />
          LEAVE PORTAL
        </Typography>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 0.5 }}>
          <IconButton onClick={() => navigate('/leaves')} size="small" sx={{ color: colors.navy, mr: 0.5 }}>
            <ArrowBackRoundedIcon />
          </IconButton>
          <Typography variant="h4">
            Leave History
          </Typography>
        </Stack>
      </Box>

      {/* Metrics Row */}
      <Grid container spacing={{ xs: 1.5, sm: 2.5 }} sx={{ mb: 4.5 }}>
        {[
          { label: 'Total Requests', value: totalApplied, tone: { fg: colors.navy, bg: colors.navySoft } },
          { label: 'Pending Approval', value: totalPending, tone: { fg: colors.amberDeep, bg: colors.amberSoft } },
          { label: 'Approved', value: totalApproved, tone: { fg: colors.success, bg: colors.successSoft } },
          { label: 'Rejected / Cancelled', value: totalRejected, tone: { fg: colors.danger, bg: colors.dangerSoft } }
        ].map((stat, idx) => (
          <Grid item xs={6} sm={6} md={3} key={idx}>
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
          {/* Status Filter */}
          <Grid item xs={6} sm={6} md={6}>
            <FormControl fullWidth size="small">
              <InputLabel id="status-filter-label">Status</InputLabel>
              <Select
                labelId="status-filter-label"
                value={statusFilter}
                label="Status"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="All">All Statuses</MenuItem>
                <MenuItem value="Pending">Pending</MenuItem>
                <MenuItem value="Approved">Approved</MenuItem>
                <MenuItem value="Rejected">Rejected</MenuItem>
                <MenuItem value="Cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Category Filter */}
          <Grid item xs={6} sm={6} md={6}>
            <FormControl fullWidth size="small">
              <InputLabel id="category-filter-label">Leave Category</InputLabel>
              <Select
                labelId="category-filter-label"
                value={categoryFilter}
                label="Leave Category"
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <MenuItem value="All">All Categories</MenuItem>
                {leaveCategories.map((cat, idx) => (
                  <MenuItem key={idx} value={cat}>{cat}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Card>

      {/* Leave History List */}
      <Card
        sx={{
          p: { xs: 2, sm: 3.5 },
          boxShadow: '0 8px 32px rgba(38, 51, 92, 0.03)',
          border: `1px solid ${colors.line}`
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2.5, color: colors.navy, display: 'flex', alignItems: 'center', gap: 1 }}>
          <HistoryRoundedIcon />
          All Applications
        </Typography>

        {safeLeaves.length > 0 ? (
          filteredLeaves.length > 0 ? (
            <>
              {/* Desktop and Tablet Table view */}
              <TableContainer 
                component={Paper} 
                elevation={0} 
                sx={{ 
                  display: { xs: 'none', md: 'block' },
                  border: `1px solid ${colors.line}`, 
                  borderRadius: 2, 
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
                    {filteredLeaves.map((leave) => (
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
                        <TableCell sx={{ fontSize: 13, maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={leave.reason}>
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

              {/* Mobile and Tablet Card view */}
              <Box sx={{ display: { xs: 'block', md: 'none' } }}>
                {filteredLeaves.map((leave) => (
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
            </>
          ) : (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                py: 6,
                textAlign: 'center',
                border: `1px dashed ${colors.line}`,
                borderRadius: 2
              }}
            >
              <HistoryRoundedIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: colors.navy, mb: 0.5 }}>
                No applications match the active filters
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Try adjusting your search filters.
              </Typography>
            </Box>
          )
        ) : (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
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
    </Box>
  );
};

export default LeaveHistory;
