import { useState } from 'react';
import { Box, IconButton, Tooltip, Chip, MenuItem, Grid, TextField } from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import CalendarTodayRoundedIcon from '@mui/icons-material/CalendarTodayRounded';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import CustomButton from '../../components/common/CustomButton';
import CustomInput from '../../components/common/CustomInput';
import AttendanceEntryDialog from '../../components/attendance/AttendanceEntryDialog';
import { useAuth } from '../../context/AuthContext';
import { useFetch } from '../../hooks/useFetch';
import { attendanceService } from '../../services/attendanceService';
import { departmentService } from '../../services/departmentService';
import { colors } from '../../theme/colors';
import { getAttendanceStatusTone } from '../../utils/attendanceStatus';


const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch (e) {
    return dateStr;
  }
};

const formatTime = (dateTimeStr) => {
  if (!dateTimeStr) return '—';
  try {
    const d = new Date(dateTimeStr);
    return d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch (e) {
    return '—';
  }
};

const AttendanceList = () => {
  const { hasRole } = useAuth();
  const canWrite = hasRole('Admin', 'HR');

  const todayStr = new Date().toLocaleDateString('en-CA');
  const [filterDate, setFilterDate] = useState(todayStr);
  const [filterDept, setFilterDept] = useState('all');

  const { data: res, loading, refetch } = useFetch(
    () =>
      attendanceService.getAll({
        date: filterDate || undefined,
        department_id: filterDept === 'all' ? undefined : filterDept,
      }),
    [filterDate, filterDept]
  );
  const attendanceRecords = res?.data || [];

  const { data: deptRes } = useFetch(() => departmentService.getAll(), []);
  const departments = deptRes?.data || [];

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState('add');
  const [editTarget, setEditTarget] = useState(null);

  const handleAddClick = () => {
    setDialogMode('add');
    setEditTarget(null);
    setDialogOpen(true);
  };

  const handleEditClick = (record) => {
    setDialogMode('edit');
    setEditTarget(record);
    setDialogOpen(true);
  };

  const columns = [
    {
      key: 'attendance_date',
      label: 'Date',
      render: (row) => formatDate(row.attendance_date),
    },
    { key: 'employee_name', label: 'Employee' },
    { key: 'department_name', label: 'Department' },
    {
      key: 'check_in',
      label: 'Check In',
      render: (row) => formatTime(row.check_in),
    },
    {
      key: 'check_out',
      label: 'Check Out',
      render: (row) => formatTime(row.check_out),
    },
    {
      key: 'work_hours',
      label: 'Hours',
      render: (row) => (row.work_hours !== null && row.work_hours !== undefined ? `${row.work_hours} hrs` : '—'),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => {
        const tone = getAttendanceStatusTone(row.status);
        return (
          <Chip
            label={row.status}
            size="small"
            sx={{
              color: tone.fg,
              bgcolor: tone.bg,
              fontSize: 11.5,
              height: 22,
              fontWeight: 600,
            }}
          />
        );
      },
    },
    {
      key: 'remarks',
      label: 'Remarks',
      render: (row) => row.remarks || '—',
      sx: { display: { xs: 'none', md: 'table-cell' } },
    },
    ...(canWrite
      ? [
          {
            key: 'actions',
            label: 'Actions',
            sortable: false,
            render: (row) => (
              <Tooltip title="Edit Attendance">
                <IconButton size="small" color="primary" onClick={() => handleEditClick(row)}>
                  <EditRoundedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            ),
          },
        ]
      : []),
  ];

  return (
    <Box>
      <PageHeader
        title="Attendance Records"
        crumbs={[{ label: 'Dashboard', path: '/dashboard' }, { label: 'Attendance' }]}
        action={
          canWrite && (
            <CustomButton startIcon={<AddRoundedIcon />} onClick={handleAddClick}>
              Add/Edit Attendance
            </CustomButton>
          )
        }
      />

      {/* Filters */}
      <Box sx={{ mb: 3, bgcolor: 'background.paper', p: 2, borderRadius: 2, border: `1px solid ${colors.line}` }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <TextField
              label="Filter by Date"
              type="date"
              fullWidth
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              inputProps={{ max: todayStr }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Filter by Department"
              select
              fullWidth
              value={filterDept}
              onChange={(e) => setFilterDept(e.target.value)}
            >
              <MenuItem value="all">All Departments</MenuItem>
              {departments.map((dept) => (
                <MenuItem key={dept.id} value={dept.id}>
                  {dept.department_name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={4} sx={{ textAlign: { sm: 'right' } }}>
            <CustomButton
              variant="outlined"
              color="inherit"
              onClick={() => {
                setFilterDate(todayStr);
                setFilterDept('all');
              }}
            >
              Reset Filters
            </CustomButton>
          </Grid>
        </Grid>
      </Box>

      <DataTable
        columns={columns}
        rows={attendanceRecords}
        loading={loading}
        searchKeys={['employee_name', 'department_name', 'status', 'remarks']}
        searchPlaceholder="Search attendance..."
        emptyLabel="No attendance records found."
      />

      <AttendanceEntryDialog
        open={dialogOpen}
        mode={dialogMode}
        record={editTarget}
        onClose={() => setDialogOpen(false)}
        onSuccess={refetch}
      />
    </Box>
  );
};

export default AttendanceList;
