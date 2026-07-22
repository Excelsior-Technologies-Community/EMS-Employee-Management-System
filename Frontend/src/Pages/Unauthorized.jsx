import { Box, Typography, Button } from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Unauthorized = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const goBack = () => {
    if (user?.role === 'Employee') navigate(`/profile/${user.id}`);
    else navigate('/dashboard');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 2
      }}
    >
      <LockIcon sx={{ fontSize: 80, color: 'error.main' }} />
      <Typography variant="h4" fontWeight="bold">Access Denied</Typography>
      <Typography variant="body1" color="text.secondary">
        Aapke paas is page ka access nahi hai.
      </Typography>
      <Button variant="contained" onClick={goBack}>Wapis Jayen</Button>
    </Box>
  );
};

export default Unauthorized;
