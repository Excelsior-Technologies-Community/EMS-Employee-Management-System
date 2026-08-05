/* global google */
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate ,  Link as RouterLink  } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Box, Card, Typography, Alert, InputAdornment, IconButton, Link ,Divider
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

  const handleGoogleLoginResponse = async (response) => {
    setError('');
    setLoading(true);
    try {
      const res = await authService.loginWithGoogle(response.credential);
      const { token, user: userData } = res.data;

      if (!['admin', 'hr', 'manager'].includes(userData.role?.toLowerCase())) {
        setError('This portal is for administrators and managers only.');
        setLoading(false);
        return;
      }

      login(token, userData);
      toast.success(`Welcome back, ${userData.name.split(' ')[0]}!`);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let interval;
    const initializeGoogleSignIn = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          callback: handleGoogleLoginResponse,
        });
        window.google.accounts.id.renderButton(
          document.getElementById('google-login-btn'),
          {
            theme: 'outline',
            size: 'large',
            width: 340, // fixed pixel width matching form fields
            text: 'signin_with',
            shape: 'rectangular',
          }
        );
      }
    };

    if (window.google) {
      initializeGoogleSignIn();
    } else {
      interval = setInterval(() => {
        if (window.google) {
          initializeGoogleSignIn();
          clearInterval(interval);
        }
      }, 100);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, []);

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
      minHeight: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      background:
        "linear-gradient(135deg,#0f172a 0%,#1e293b 45%,#334155 100%)",
      p: 2,
    }}
  >
    <Card
      elevation={12}
      sx={{
        width: 450,
        
        p: 4,
        boxShadow: "0 20px 45px rgba(0,0,0,.25)",
      }}
    >
      <Typography
        variant="h3"
        align="center"
        fontWeight={800}
        sx={{
          color: "text.secondary",
          letterSpacing: 2,
        }}
      >
        EMS
      </Typography>

      <Typography
        align="center"
        sx={{
          color: "text.secondary",
          mt: 1,
          fontWeight: 500,
        }}
      >
        Employee Management System
      </Typography>

      <Box
        sx={{
          mt: 2,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Box
          sx={{
            bgcolor: "#fff7ed",
            color: "#c08b63",
            px: 2,
            py: 0.7,
            borderRadius: 10,
            fontWeight: 700,
            fontSize: 13,
          }}
        >
          ADMIN PANEL
        </Box>
      </Box>

      <Typography
        variant="h5"
        align="center"
        sx={{
          mt: 4,
          fontWeight: 700,
        }}
      >
        
      </Typography>

      <Typography
        align="center"
        color="text.secondary"
        sx={{ mb: 4 }}
      >
        Sign in to access the Administration Dashboard
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <CustomInput
          name="email"
          control={control}
          label="Work Email"
          type="email"
          autoFocus
          rules={{
            required: "Email is required",
            pattern: emailPattern,
          }}
          startIcon={<MailOutlineRoundedIcon />}
        />

        <CustomInput
          name="password"
          control={control}
          label="Password"
          type={showPassword ? "text" : "password"}
          rules={{
            required: "Password is required",
          }}
          startIcon={<LockOutlineRoundedIcon />}
          endAdornment={
            <InputAdornment position="end">
              <IconButton
                size="small"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? (
                  <VisibilityOffRoundedIcon />
                ) : (
                  <VisibilityRoundedIcon />
                )}
              </IconButton>
            </InputAdornment>
          }
        />

        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            mt: -0.5,
            mb: 1,
          }}
        >
          <Link
            component={RouterLink}
            to="/forgot-password"
            underline="hover"
            sx={{
              color: "#f59e0b",
              fontWeight: 600,
            }}
          >
            Forgot Password?
          </Link>
        </Box>

        <CustomButton
          type="submit"
          fullWidth
          loading={loading}
          sx={{
            mt: 3,
            py: 1.5,
            borderRadius: 3,
            fontSize: 16,
            fontWeight: 700,
          }}
        >
          Sign In
        </CustomButton>

       <Divider sx={{ my: 4 }}>
            <Typography variant="body2">
              OR
            </Typography>
        </Divider>

          <Box
            display="flex"
            justifyContent="center"
          >
            <Box id="google-login-btn"></Box>
          </Box>
      </form>

      <Typography
        variant="caption"
        align="center"
        sx={{
          display: "block",
          mt: 4,
          color: "text.secondary",
        }}
      >
        © 2026 Employee Management System • Admin Portal
      </Typography>
    </Card>
  </Box>
);
};

export default Login;
