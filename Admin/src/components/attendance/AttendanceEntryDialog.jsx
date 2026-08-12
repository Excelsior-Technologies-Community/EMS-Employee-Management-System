import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Grid, MenuItem,
} from '@mui/material';
import CustomInput from '../common/CustomInput';
import CustomButton from '../common/CustomButton';
import { useFetch } from '../../hooks/useFetch';
import { employeeService } from '../../services/employeeService';
import { attendanceService } from '../../services/attendanceService';
import { getErrorMessage } from '../../services/api';

const parseTime = (dateTimeStr) => {
  if (!dateTimeStr) return '';
  try {
    const d = new Date(dateTimeStr);
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  } catch (e) {
    return '';
  }
};

const parseDate = (dateStr) => {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch (e) {
    return '';
  }
};

const AttendanceEntryDialog = ({ open, mode = 'add', record, onClose, onSuccess }) => {
  const isEdit = mode === 'edit';
  const { data: empRes } = useFetch(() => employeeService.getAll({ limit: 1000 }), [open]);
  const employees = empRes?.data || [];

  const {
    control, handleSubmit, reset, formState: { isSubmitting }, watch, setValue,
  } = useForm({
    defaultValues: {
      employee_id: '',
      attendance_date: '',
      check_in: '',
      check_out: '',
      status: 'Present',
      remarks: '',
    },
  });

  const todayStr = new Date().toLocaleDateString('en-CA');

  useEffect(() => {
    if (open) {
      if (isEdit && record) {
        reset({
          employee_id: record.employee_id,
          attendance_date: parseDate(record.attendance_date),
          check_in: parseTime(record.check_in),
          check_out: parseTime(record.check_out),
          status: record.status,
          remarks: record.remarks || '',
        });
      } else {
        reset({
          employee_id: '',
          attendance_date: todayStr,
          check_in: '',
          check_out: '',
          status: 'Present',
          remarks: '',
        });
      }
    }
  }, [open, isEdit, record, reset, todayStr]);

  const onSubmit = async (values) => {
    try {
      // Validate that check-out is after check-in if both are provided
      if (values.check_in && values.check_out) {
        const [inH, inM] = values.check_in.split(':').map(Number);
        const [outH, outM] = values.check_out.split(':').map(Number);
        if (outH < inH || (outH === inH && outM <= inM)) {
          toast.error('Check-out time must be after check-in time.');
          return;
        }
      }

      await attendanceService.saveManual(values);
      toast.success(isEdit ? 'Attendance updated successfully!' : 'Attendance added successfully!');
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEdit ? 'Edit Attendance Record' : 'Add Attendance Record'}</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <CustomInput
                name="employee_id"
                control={control}
                label="Employee"
                select
                disabled={isEdit}
                rules={{ required: 'Employee is required' }}
              >
                {employees.map((emp) => (
                  <MenuItem key={emp.id} value={emp.id}>
                    {emp.name} ({emp.email})
                  </MenuItem>
                ))}
              </CustomInput>
            </Grid>

            <Grid item xs={12} sm={6}>
              <CustomInput
                name="attendance_date"
                control={control}
                label="Date"
                type="date"
                disabled={isEdit}
                rules={{ required: 'Date is required' }}
                InputLabelProps={{ shrink: true }}
                inputProps={{ max: todayStr }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <CustomInput
                name="check_in"
                control={control}
                label="Check In Time"
                type="time"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <CustomInput
                name="check_out"
                control={control}
                label="Check Out Time"
                type="time"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12}>
              <CustomInput
                name="status"
                control={control}
                label="Status"
                select
                rules={{ required: 'Status is required' }}
              >
                <MenuItem value="Present">Present</MenuItem>
                <MenuItem value="Late">Late</MenuItem>
                <MenuItem value="Absent">Absent</MenuItem>
                <MenuItem value="Half Day">Half Day</MenuItem>
              </CustomInput>
            </Grid>

            <Grid item xs={12}>
              <CustomInput
                name="remarks"
                control={control}
                label="Remarks / Reason"
                multiline
                rows={3}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <CustomButton variant="text" color="inherit" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </CustomButton>
          <CustomButton type="submit" loading={isSubmitting}>
            {isEdit ? 'Save Changes' : 'Record Attendance'}
          </CustomButton>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AttendanceEntryDialog;
