import { Box, Typography } from '@mui/material';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import { useNavigate } from 'react-router-dom';
import CustomButton from '../../components/common/CustomButton';
import { colors } from '../../theme/colors';

const Unauthorized = () => {
  const navigate = useNavigate();
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2, p: 3 }}>
      <Box sx={{ width: 72, height: 72, borderRadius: '50%', bgcolor: colors.dangerSoft, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <LockRoundedIcon sx={{ fontSize: 34, color: colors.danger }} />
      </Box>
      <Typography variant="h5">Access Denied</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', maxWidth: 320 }}>
        You don't have permission to view this page. Contact an Admin if you think this is a mistake.
      </Typography>
      <CustomButton onClick={() => navigate('/dashboard')}>Back to Dashboard</CustomButton>
    </Box>
  );
};

export default Unauthorized;
