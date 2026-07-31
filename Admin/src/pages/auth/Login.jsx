import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate ,  Link as RouterLink  } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Box, Card, Typography, Alert, InputAdornment, IconButton, Link
} from '@mui/material';
import MailOutlineRoundedIcon from '@mui/icons-material/MailOutlineRounded';
import LockOutlineRoundedIcon from '@mui/icons-material/LockOutlineRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded';
import CustomInput from '../../components/common/CustomInput';
import CustomButton from '../../components/common/CustomButton';
import { authService } from '../../services/authService';
import { getErrorMessage } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme/colors';
import { emailPattern } from '../../utils/validators';

const Login = () => {
  const { control, handleSubmit } = useForm({ defaultValues: { email: '', password: '' } });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate('/dashboard', { replace: true });
  }, [user, navigate]);

  const onSubmit = async ({ email, password }) => {
    setError('');
    setLoading(true);
    try {
      const res = await authService.login(email, password);
      const { token, user: userData } = res.data;
      login(token, userData);
      toast.success(`Welcome back, ${userData.name.split(' ')[0]}!`);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: colors.navy,
        backgroundImage: `radial-gradient(circle at 15% 20%, ${colors.navyDeep} 0%, ${colors.navy} 55%)`,
        p: 2,
      }}
    >
      <Card sx={{ maxWidth: 420, width: '100%', borderRadius: 4, overflow: 'hidden' }}>
        <Box sx={{ bgcolor: colors.navy, px: 4, py: 3.5, position: 'relative' }}>
          <Box sx={{ position: 'absolute', top: 0, left: 0, width: 4, height: '100%', bgcolor: colors.amber }} />
          <Typography sx={{ fontFamily: '"Space Grotesk", sans-serif', fontWeight: 700, fontSize: 22, color: '#fff' }}>
            EMS
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mt: 0.25 }}>
            Admin Panel
          </Typography>
        </Box>

        <Box sx={{ p: 4 }}>
          <Typography variant="h6" sx={{ mb: 0.5 }}>Sign in</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
            For Admin, HR &amp; Manager accounts.
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <CustomInput
              name="email"
              control={control}
              label="Email"
              type="email"
              rules={{ required: 'Email is required', pattern: emailPattern }}
              startIcon={<MailOutlineRoundedIcon fontSize="small" />}
              autoFocus
            />
            <CustomInput
              name="password"
              control={control}
              label="Password"
              type={showPassword ? 'text' : 'password'}
              rules={{ required: 'Password is required' }}
              startIcon={<LockOutlineRoundedIcon fontSize="small" />}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setShowPassword((v) => !v)} edge="end">
                    {showPassword ? <VisibilityOffRoundedIcon fontSize="small" /> : <VisibilityRoundedIcon fontSize="small" />}
                  </IconButton>
                </InputAdornment>
              }
            />

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: -0.5, mb: 1 }}>
              <Link
                component={RouterLink}
                to="/forgot-password"
                variant="body2"
                sx={{
                  color: colors.amber,
                  fontWeight: 600,
                  textDecoration: 'none',
                  '&:hover': { textDecoration: 'underline' }
                }}
              >
                Forgot Password?
              </Link>
            </Box>

            <CustomButton type="submit" fullWidth loading={loading} sx={{ mt: 2.5, py: 1.25 }}>
              Sign in
            </CustomButton>
          </form>


        </Box>
      </Card>
    </Box>
  );
};

export default Login;
