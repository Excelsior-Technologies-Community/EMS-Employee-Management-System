import { Box, CircularProgress, Typography } from '@mui/material';

const Loader = ({ label = 'Loading...', minHeight = '40vh' }) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 1.5,
      minHeight,
    }}
  >
    <CircularProgress size={32} thickness={4} color="secondary" />
    <Typography variant="caption" color="text.secondary">{label}</Typography>
  </Box>
);

export default Loader;
