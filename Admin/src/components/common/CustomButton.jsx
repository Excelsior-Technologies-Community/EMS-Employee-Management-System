import { Button, CircularProgress } from '@mui/material';

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
