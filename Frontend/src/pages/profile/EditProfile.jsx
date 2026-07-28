import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Box, Card, Typography, Alert } from '@mui/material';
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded';
import MailOutlineRoundedIcon from '@mui/icons-material/MailOutlineRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import CustomInput from '../../components/common/CustomInput';
import CustomButton from '../../components/common/CustomButton';
import Loader from '../../components/common/Loader';
import { useAuth } from '../../context/AuthContext';
import { useFetch } from '../../hooks/useFetch';
import { profileService } from '../../services/profileService';
import { getErrorMessage } from '../../services/api';
import { emailPattern } from '../../utils/validators';

const EditProfile = () => {
  const { user, updateUserData } = useAuth();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { data: employee, loading } = useFetch(() => profileService.getProfile(user.id), [user.id]);
  const { control, handleSubmit, reset } = useForm({ defaultValues: { name: '', email: '' } });

  useEffect(() => {
    if (employee) reset({ name: employee.name, email: employee.email });
  }, [employee, reset]);

  const onSubmit = async (values) => {
    setError('');
    setSuccess('');
    setSaving(true);
    try {
      await profileService.updateProfile(user.id, values);
      updateUserData({ name: values.name, email: values.email });
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader label="Loading profile..." />;

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <CustomButton variant="text" onClick={() => navigate('/profile')} startIcon={<ArrowBackRoundedIcon fontSize="small" />}>
          Back
        </CustomButton>
      </Box>

      <Typography variant="h5" sx={{ mb: 3 }}>Edit Profile</Typography>

      <Card sx={{ p: 3.5, maxWidth: 480 }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <CustomInput
            name="name"
            control={control}
            label="Full name"
            rules={{ required: 'Name is required' }}
            startIcon={<PersonOutlineRoundedIcon fontSize="small" />}
          />
          <CustomInput
            name="email"
            control={control}
            label="Email address"
            type="email"
            rules={{ required: 'Email is required', pattern: emailPattern }}
            startIcon={<MailOutlineRoundedIcon fontSize="small" />}
          />
          <CustomButton type="submit" loading={saving} sx={{ mt: 2 }}>
            Save Changes
          </CustomButton>
        </form>
      </Card>
    </Box>
  );
};

export default EditProfile;
