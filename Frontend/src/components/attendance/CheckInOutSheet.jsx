import { useState, useEffect } from 'react';
import {
  Drawer, Box, Typography, Button, CircularProgress, IconButton, Stack
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded';
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';
import MyLocationRoundedIcon from '@mui/icons-material/MyLocationRounded';
import { colors } from '../../theme/colors';
import { attendanceService } from '../../services/attendanceService';

const CheckInOutSheet = ({ open, onClose, action, onSuccess }) => {
  const [step, setStep] = useState('fetching'); // 'fetching' | 'resolved' | 'error'
  const [coords, setCoords] = useState(null);
  const [address, setAddress] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isPermanentlyDenied, setIsPermanentlyDenied] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const actionLabel = action === 'check-in' ? 'Check In' : 'Check Out';

  const getCurrentLocation = () => {
    setStep('fetching');
    setErrorMsg('');
    setIsPermanentlyDenied(false);

    if (!navigator.geolocation) {
      setStep('error');
      setErrorMsg('Geolocation is not supported by your browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        setCoords({ latitude, longitude, accuracy });

        try {
          // Reverse geocoding using OSM Nominatim free API
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&zoom=18&addressdetails=1`,
            { headers: { 'Accept-Language': 'en' } }
          );
          if (res.ok) {
            const data = await res.json();
            setAddress(data.display_name || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
          } else {
            setAddress(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
          }
        } catch (err) {
          // Network issue - do not block backend attendance check-in/out
          setAddress(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
        }
        
        setStep('resolved');
      },
      (error) => {
        setStep('error');
        if (error.code === error.PERMISSION_DENIED) {
          setIsPermanentlyDenied(true);
          setErrorMsg('Location access denied. Enable location access in your browser settings and reload the page.');
        } else if (error.code === error.TIMEOUT) {
          setErrorMsg('Location request timed out. Please check your GPS signal and try again.');
        } else {
          setErrorMsg('Unable to retrieve location. Please check your settings and try again.');
        }
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  // Fetch location automatically when the sheet is opened
  useEffect(() => {
    if (open) {
      getCurrentLocation();
    }
  }, [open, action]);

  const handleSubmit = async () => {
    if (!coords || submitting) return;
    setSubmitting(true);
    setErrorMsg('');

    try {
      if (action === 'check-in') {
        await attendanceService.checkIn(coords.latitude, coords.longitude, coords.accuracy);
      } else {
        await attendanceService.checkOut(coords.latitude, coords.longitude, coords.accuracy);
      }

      onSuccess();
      onClose();
    } catch (err) {
      const backendMsg = err.response?.data?.message || 'Something went wrong. Please try again.';

      if (backendMsg.toLowerCase().includes('already checked')) {
        // Auto-close sheet after 2 seconds on "Already checked in today"
        setStep('error');
        setErrorMsg(backendMsg);
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 2000);
      } else {
        setStep('error');
        setErrorMsg(backendMsg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Drawer
      anchor="bottom"
      open={open}
      onClose={submitting ? null : onClose}
      PaperProps={{
        sx: {
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          p: { xs: 3, sm: 4 },
          pb: { xs: 4, sm: 5 },
          maxWidth: 550,
          mx: 'auto',
          boxShadow: '0px -10px 40px rgba(0, 0, 0, 0.12)',
        },
      }}
    >
      {/* Visual drag handle pill */}
      <Box sx={{ width: 42, height: 4, bgcolor: 'divider', borderRadius: 2, mx: 'auto', mb: 3 }} />

      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: colors.navy }}>
          {actionLabel}
        </Typography>
        <IconButton onClick={onClose} disabled={submitting} size="small" sx={{ color: 'text.secondary' }}>
          <CloseRoundedIcon />
        </IconButton>
      </Stack>

      {/* Content States */}
      <Box sx={{ minHeight: 180, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        
        {/* STATE 1 - Fetching */}
        {step === 'fetching' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 2.5 }}>
            <CircularProgress size={44} thickness={4.5} sx={{ color: colors.amber }} />
            <Stack direction="row" spacing={1} alignItems="center" sx={{ color: 'text.secondary' }}>
              <MyLocationRoundedIcon sx={{ fontSize: 20, color: colors.amber }} />
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                Fetching your current location... Please wait.
              </Typography>
            </Stack>
          </Box>
        )}

        {/* STATE 2 - Location Resolved (Confirm step) */}
        {step === 'resolved' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
            <Stack direction="row" spacing={1.5} sx={{ bgcolor: colors.navySoft, p: 2, borderRadius: 2, border: `1px dashed ${colors.navy}` }}>
              <LocationOnRoundedIcon sx={{ color: colors.navy, fontSize: 24, mt: 0.25 }} />
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
                  YOUR LOCATION
                </Typography>
                <Typography variant="body2" sx={{ color: colors.ink, fontWeight: 500, lineHeight: 1.5 }}>
                  {address}
                </Typography>
                {coords && (
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5, fontFamily: 'monospace' }}>
                    Acc: {coords.accuracy.toFixed(1)}m | Lat: {coords.latitude.toFixed(5)}, Lng: {coords.longitude.toFixed(5)}
                  </Typography>
                )}
              </Box>
            </Stack>

            <Button
              variant="contained"
              fullWidth
              size="large"
              onClick={handleSubmit}
              disabled={submitting}
              sx={{
                bgcolor: colors.amber,
                color: colors.ink,
                fontWeight: 700,
                fontSize: 16,
                py: 1.5,
                '&:hover': {
                  bgcolor: colors.amberDeep,
                },
                boxShadow: `0px 4px 14px rgba(232, 163, 61, 0.25)`,
              }}
            >
              {submitting ? <CircularProgress size={24} color="inherit" /> : `Confirm ${actionLabel}`}
            </Button>
          </Box>
        )}

        {/* STATE 3 - Error */}
        {step === 'error' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 3 }}>
            <ErrorOutlineRoundedIcon sx={{ fontSize: 50, color: colors.danger }} />
            <Typography variant="body1" sx={{ color: colors.ink, fontWeight: 500, px: 2 }}>
              {errorMsg}
            </Typography>

            {!isPermanentlyDenied && (
              <Button
                variant="contained"
                onClick={getCurrentLocation}
                disabled={submitting}
                sx={{
                  bgcolor: colors.navy,
                  color: '#fff',
                  fontWeight: 600,
                  px: 4,
                  py: 1.25,
                  '&:hover': {
                    bgcolor: colors.navyDeep,
                  },
                }}
              >
                Try Again
              </Button>
            )}
          </Box>
        )}
      </Box>
    </Drawer>
  );
};

export default CheckInOutSheet;
