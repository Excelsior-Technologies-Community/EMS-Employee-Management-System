import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Grid, Alert, MenuItem,
} from '@mui/material';
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded';
import MailOutlineRoundedIcon from '@mui/icons-material/MailOutlineRounded';
import LockOutlineRoundedIcon from '@mui/icons-material/LockOutlineRounded';
import CustomInput from '../common/CustomInput';
import CustomButton from '../common/CustomButton';
import { useFetch } from '../../hooks/useFetch';
import { employeeService } from '../../services/employeeService';
import { getErrorMessage } from '../../services/api';
import { emailPattern, passwordMinLength } from '../../utils/validators';

/**
 * mode: 'add' | 'edit'. When editing, `employee` supplies the initial values
 * and password becomes optional (leave blank to keep it unchanged).
 */
const EmployeeFormDialog = ({ open, mode = 'add', employee, onClose, onSuccess }) => {
  const isEdit = mode === 'edit';
  const { data: options } = useFetch(() => employeeService.getFormOptions(), [open]);
  const roles = options?.data?.roles || [];
  const departments = options?.data?.departments || [];

  const {
    control, handleSubmit, reset, formState: { isSubmitting },
  } = useForm({
    defaultValues: { name: '', email: '', password: '', role_id: '', department_id: '' },
  });

  useEffect(() => {
    if (open) {
      reset(
        isEdit && employee
          ? {
              name: employee.name,
              email: employee.email,
              password: '',
              role_id: employee.role_id,
              department_id: employee.department_id,
            }
          : { name: '', email: '', password: '', role_id: '', department_id: '' }
      );
    }
  }, [open, isEdit, employee, reset]);

  const onSubmit = async (values) => {
    try {
      if (isEdit) {
        const payload = { name: values.name, email: values.email, role_id: values.role_id, department_id: values.department_id };
        if (values.password) payload.password = values.password;
        await employeeService.update(employee.id, payload);
        toast.success('Employee updated successfully!');
      } else {
        await employeeService.add(values);
        toast.success('Employee added successfully!');
      }
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEdit ? 'Edit Employee' : 'Add New Employee'}</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <DialogContent dividers>
          <Grid container spacing={1}>
            <Grid size={{ xs: 12 }}>
              <CustomInput
                name="name"
                control={control}
                label="Full name"
                rules={{ required: 'Name is required' }}
                startIcon={<PersonOutlineRoundedIcon fontSize="small" />}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <CustomInput
                name="email"
                control={control}
                label="Email address"
                type="email"
                rules={{ required: 'Email is required', pattern: emailPattern }}
                startIcon={<MailOutlineRoundedIcon fontSize="small" />}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <CustomInput
                name="password"
                control={control}
                label={isEdit ? 'New password (optional)' : 'Password'}
                type="password"
                rules={isEdit ? {} : { required: 'Password is required', minLength: passwordMinLength }}
                startIcon={<LockOutlineRoundedIcon fontSize="small" />}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomInput name="role_id" control={control} label="Role" select rules={{ required: 'Role is required' }}>
                {roles.map((r) => (
                  <MenuItem key={r.id} value={r.id}>{r.role_name}</MenuItem>
                ))}
              </CustomInput>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomInput name="department_id" control={control} label="Department" select rules={{ required: 'Department is required' }}>
                {departments.map((d) => (
                  <MenuItem key={d.id} value={d.id}>{d.department_name}</MenuItem>
                ))}
              </CustomInput>
            </Grid>
          </Grid>
          {!isEdit && (
            <Alert severity="info" sx={{ mt: 1.5 }}>
              The employee can sign in with this email and password once created.
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <CustomButton variant="text" color="inherit" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </CustomButton>
          <CustomButton type="submit" loading={isSubmitting}>
            {isEdit ? 'Save Changes' : 'Add Employee'}
          </CustomButton>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default EmployeeFormDialog;
