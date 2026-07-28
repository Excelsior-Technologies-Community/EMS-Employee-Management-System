import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Box, Card, InputAdornment, IconButton } from '@mui/material';
import LockOutlineRoundedIcon from '@mui/icons-material/LockOutlineRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded';
import PageHeader from '../../components/common/PageHeader';
import CustomInput from '../../components/common/CustomInput';
import CustomButton from '../../components/common/CustomButton';
import { useAuth } from '../../context/AuthContext';
import { employeeService } from '../../services/employeeService';
import { getErrorMessage } from '../../services/api';
import { passwordMinLength } from '../../utils/validators';

const ChangePassword = () => {
  const { user } = useAuth();
  const [show, setShow] = useState(false);
  const { control, handleSubmit, watch, reset, formState: { isSubmitting } } = useForm({
    defaultValues: { newPassword: '', confirmPassword: '' },
  });

  const onSubmit = async ({ newPassword }) => {
    try {
      await employeeService.changePassword(user.id, newPassword);
      toast.success('Password changed successfully!');
      reset();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <Box>
      <PageHeader
        title="Change Password"
        crumbs={[{ label: 'Dashboard', path: '/dashboard' }, { label: 'Profile', path: '/profile' }, { label: 'Change Password' }]}
      />

      <Card sx={{ p: 3.5, maxWidth: 460 }}>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <CustomInput
            name="newPassword"
            control={control}
            label="New password"
            type={show ? 'text' : 'password'}
            rules={{ required: 'New password is required', minLength: passwordMinLength }}
            startIcon={<LockOutlineRoundedIcon fontSize="small" />}
          />
          <CustomInput
            name="confirmPassword"
            control={control}
            label="Confirm new password"
            type={show ? 'text' : 'password'}
            rules={{
              required: 'Please confirm your password',
              validate: (value) => value === watch('newPassword') || 'Passwords do not match',
            }}
            startIcon={<LockOutlineRoundedIcon fontSize="small" />}
            endAdornment={
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => setShow((v) => !v)} edge="end">
                  {show ? <VisibilityOffRoundedIcon fontSize="small" /> : <VisibilityRoundedIcon fontSize="small" />}
                </IconButton>
              </InputAdornment>
            }
          />
          <CustomButton type="submit" loading={isSubmitting} sx={{ mt: 2 }}>
            Update Password
          </CustomButton>
        </form>
      </Card>
    </Box>
  );
};

export default ChangePassword;
