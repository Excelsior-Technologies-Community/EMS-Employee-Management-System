import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Box, Card, Typography, Alert, InputAdornment, IconButton } from '@mui/material';
import LockOutlineRoundedIcon from '@mui/icons-material/LockOutlineRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded';
import CustomInput from '../../components/common/CustomInput';
import CustomButton from '../../components/common/CustomButton';
import { useAuth } from '../../context/AuthContext';
import { profileService } from '../../services/profileService';

import { passwordMinLength } from '../../utils/validators';

const ChangePassword = () => {
  const { user } = useAuth();
  const [show, setShow] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { control, handleSubmit, watch, reset } = useForm({
    defaultValues: { newPassword: '', confirmPassword: '' },
  });

  const onSubmit = async ({ newPassword }) => {
    setError('');
    setSuccess('');
    setSaving(true);
    try {
      await profileService.changePassword(user.id, newPassword);
      setSuccess('Password changed successfully!');
      reset();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3 }}>Change Password</Typography>

      <Card sx={{ p: 3.5, maxWidth: 480 }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

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
          <CustomButton type="submit" loading={saving} sx={{ mt: 2 }}>
            Update Password
          </CustomButton>
        </form>
      </Card>
    </Box>
  );
};

export default ChangePassword;
