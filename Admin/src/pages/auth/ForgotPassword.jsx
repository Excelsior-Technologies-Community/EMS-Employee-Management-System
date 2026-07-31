import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box, Card, Typography, Alert, Link, InputAdornment, IconButton
} from '@mui/material';
import MailOutlineRoundedIcon from '@mui/icons-material/MailOutlineRounded';
import LockOutlineRoundedIcon from '@mui/icons-material/LockOutlineRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded';
import PinRoundedIcon from '@mui/icons-material/PinRounded';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import CustomInput from '../../components/common/CustomInput';
import CustomButton from '../../components/common/CustomButton';
import { authService } from '../../services/authService';
import { getErrorMessage } from '../../services/api';
import { colors } from '../../theme/colors';
import { emailPattern, passwordMinLength } from '../../utils/validators';

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: Reset, 4: Success
  const [email, setEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Timer for OTP resend
  const [resendCooldown, setResendCooldown] = useState(0);

  const navigate = useNavigate();

  // Form hooks
  const { control: emailControl, handleSubmit: handleEmailSubmit } = useForm({
    defaultValues: { email: '' }
  });

  const { control: otpControl, handleSubmit: handleOtpSubmit, reset: resetOtpForm } = useForm({
    defaultValues: { otp: '' }
  });

  const { control: resetControl, handleSubmit: handleResetSubmit, watch: watchReset } = useForm({
    defaultValues: { newPassword: '', confirmPassword: '' }
  });

  // Cooldown effect
  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  // Request OTP handler
  const onRequestOtp = async (data) => {
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await authService.forgotPassword(data.email);
      setEmail(data.email);
      setSuccess('OTP sent successfully to your email.');
      setStep(2);
      setResendCooldown(60); // 60s cooldown
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP handler
  const onResendOtp = async () => {
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await authService.forgotPassword(email);
      setSuccess('A new OTP has been sent.');
      setResendCooldown(60);
      resetOtpForm();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP handler
  const onVerifyOtp = async (data) => {
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const res = await authService.verifyOTP(email, data.otp);
      setResetToken(res.data.resetToken);
      setSuccess('OTP verified. Please set your new password.');
      setStep(3);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // Reset Password handler
  const onResetPassword = async (data) => {
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await authService.resetPassword(resetToken, data.newPassword);
      setStep(4);
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
        {/* Banner */}
        <Box sx={{ bgcolor: colors.navy, px: 4, py: 3.5, position: 'relative' }}>
          <Box sx={{ position: 'absolute', top: 0, left: 0, width: 4, height: '100%', bgcolor: colors.amber }} />
          <Typography sx={{ fontFamily: '"Space Grotesk", sans-serif', fontWeight: 700, fontSize: 22, color: '#fff' }}>
            EMS
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mt: 0.25 }}>
            Reset Password
          </Typography>
        </Box>

        <Box sx={{ p: 4 }}>
          {error && <Alert severity="error" sx={{ mb: 2.5 }}>{error}</Alert>}
          {success && step !== 4 && <Alert severity="success" sx={{ mb: 2.5 }}>{success}</Alert>}

          {/* STEP 1: Enter Email */}
          {step === 1 && (
            <>
              <Typography variant="h6" sx={{ mb: 1 }}>Forgot Password?</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Enter your work email address, and we will send you a 6-digit OTP to verify your identity.
              </Typography>

              <form onSubmit={handleEmailSubmit(onRequestOtp)} noValidate>
                <CustomInput
                  name="email"
                  control={emailControl}
                  label="Work email"
                  type="email"
                  rules={{ required: 'Email is required', pattern: emailPattern }}
                  startIcon={<MailOutlineRoundedIcon fontSize="small" />}
                  autoFocus
                />

                <CustomButton type="submit" fullWidth loading={loading} sx={{ mt: 3, py: 1.25 }}>
                  Send OTP
                </CustomButton>

                <Box sx={{ mt: 2.5, textAlign: 'center' }}>
                  <Link
                    component={RouterLink}
                    to="/login"
                    variant="body2"
                    sx={{ color: colors.amber, fontWeight: 600, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                  >
                    Back to Sign In
                  </Link>
                </Box>
              </form>
            </>
          )}

          {/* STEP 2: Enter OTP */}
          {step === 2 && (
            <>
              <Typography variant="h6" sx={{ mb: 1 }}>Enter OTP</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
                We sent a 6-digit verification code to <Box component="span" sx={{ fontWeight: 600, color: 'text.primary' }}>{email}</Box>.
              </Typography>

              <form onSubmit={handleOtpSubmit(onVerifyOtp)} noValidate>
                <CustomInput
                  name="otp"
                  control={otpControl}
                  label="Verification Code (OTP)"
                  type="text"
                  rules={{
                    required: 'Verification code is required',
                    pattern: { value: /^\d{6}$/, message: 'Verification code must be exactly 6 digits' }
                  }}
                  startIcon={<PinRoundedIcon fontSize="small" />}
                  autoFocus
                />

                <CustomButton type="submit" fullWidth loading={loading} sx={{ mt: 3, py: 1.25 }}>
                  Verify OTP
                </CustomButton>

                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Link
                    component="button"
                    type="button"
                    onClick={() => {
                      setError('');
                      setSuccess('');
                      setStep(1);
                    }}
                    variant="body2"
                    sx={{ color: 'text.secondary', fontWeight: 500, textDecoration: 'none', '&:hover': { textDecoration: 'underline', color: 'text.primary' } }}
                  >
                    Change email
                  </Link>

                  {resendCooldown > 0 ? (
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                      Resend OTP in {resendCooldown}s
                    </Typography>
                  ) : (
                    <Link
                      component="button"
                      type="button"
                      onClick={onResendOtp}
                      variant="body2"
                      disabled={loading}
                      sx={{ color: colors.amber, fontWeight: 600, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                    >
                      Resend OTP
                    </Link>
                  )}
                </Box>
              </form>
            </>
          )}

          {/* STEP 3: Reset Password */}
          {step === 3 && (
            <>
              <Typography variant="h6" sx={{ mb: 1 }}>Set New Password</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Create a new password that is secure and easy to remember.
              </Typography>

              <form onSubmit={handleResetSubmit(onResetPassword)} noValidate>
                <CustomInput
                  name="newPassword"
                  control={resetControl}
                  label="New Password"
                  type={showPassword ? 'text' : 'password'}
                  rules={{ required: 'Password is required', minLength: passwordMinLength }}
                  startIcon={<LockOutlineRoundedIcon fontSize="small" />}
                />

                <CustomInput
                  name="confirmPassword"
                  control={resetControl}
                  label="Confirm Password"
                  type={showPassword ? 'text' : 'password'}
                  rules={{
                    required: 'Please confirm your password',
                    validate: (value) => value === watchReset('newPassword') || 'Passwords do not match'
                  }}
                  startIcon={<LockOutlineRoundedIcon fontSize="small" />}
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setShowPassword((v) => !v)} edge="end">
                        {showPassword ? <VisibilityOffRoundedIcon fontSize="small" /> : <VisibilityRoundedIcon fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  }
                />

                <CustomButton type="submit" fullWidth loading={loading} sx={{ mt: 3, py: 1.25 }}>
                  Reset Password
                </CustomButton>
              </form>
            </>
          )}

          {/* STEP 4: Success State */}
          {step === 4 && (
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <CheckCircleOutlineRoundedIcon sx={{ fontSize: 60, color: colors.success, mb: 2 }} />

              <Typography variant="h5" sx={{ mb: 1.5, fontWeight: 700 }}>Password Reset!</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 4, px: 2 }}>
                Your password has been changed successfully. You can now use your new password to sign in.
              </Typography>

              <CustomButton
                fullWidth
                onClick={() => navigate('/login')}
                sx={{ py: 1.25 }}
              >
                Back to Sign In
              </CustomButton>
            </Box>
          )}
        </Box>
      </Card>
    </Box>
  );
};

export default ForgotPassword;
