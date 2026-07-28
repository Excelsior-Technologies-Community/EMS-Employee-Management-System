import { Button, CircularProgress } from '@mui/material';

/**
 * Wrapper around MUI Button that standardizes loading state across the app.
 * The label stays mounted (not swapped for a bare spinner) so button width
 * doesn't jump when a request is in flight.
 */
const CustomButton = ({
  children,
  loading = false,
  variant = 'contained',
  color = 'primary',
  fullWidth = false,
  disabled = false,
  startIcon,
  ...rest
}) => (
  <Button
    variant={variant}
    color={color}
    fullWidth={fullWidth}
    disabled={disabled || loading}
    startIcon={loading ? undefined : startIcon}
    {...rest}
  >
    {loading ? <CircularProgress size={20} color="inherit" /> : children}
  </Button>
);

export default CustomButton;
