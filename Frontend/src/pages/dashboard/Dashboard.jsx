import { Box, Card, Typography, Grid, Chip } from '@mui/material';
import BadgeRoundedIcon from '@mui/icons-material/BadgeRounded';
import BusinessRoundedIcon from '@mui/icons-material/BusinessRounded';
import LockResetRoundedIcon from '@mui/icons-material/LockResetRounded';
import FingerprintRoundedIcon from '@mui/icons-material/FingerprintRounded';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme/colors';

const QuickLink = ({ icon, title, subtitle, onClick }) => (
  <Card
    onClick={onClick}
    sx={{
      p: 2.5, cursor: 'pointer', height: '100%',
      transition: 'transform 0.15s ease, border-color 0.15s ease',
      '&:hover': { transform: 'translateY(-2px)', borderColor: colors.amber },
    }}
  >
    <Box
      sx={{
        width: 42, height: 42, borderRadius: 2, display: 'flex', alignItems: 'center',
        justifyContent: 'center', bgcolor: colors.navySoft, color: colors.navy, mb: 1.5,
      }}
    >
      {icon}
    </Box>
    <Typography sx={{ fontWeight: 700, fontSize: 15 }}>{title}</Typography>
    <Typography variant="body2" color="text.secondary">{subtitle}</Typography>
  </Card>
);

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="overline" color="secondary.dark">{greeting.toUpperCase()}</Typography>
        <Typography variant="h4" sx={{ mt: 0.5 }}>{user?.name || 'there'} 👋</Typography>
        <Chip
          label={user?.role}
          size="small"
          sx={{ mt: 1, bgcolor: colors.successSoft, color: colors.success, fontWeight: 700 }}
        />
      </Box>

      <Grid container spacing={2.5}>
        <Grid size={{xs:12 , sm:6, md:3}}>
          <QuickLink
            icon={<FingerprintRoundedIcon />}
            title="Attendance"
            subtitle="Check in & Check out"
            onClick={() => navigate('/attendance')}
          />
        </Grid>
        <Grid size={{xs:12 , sm:6, md:3}}>
          <QuickLink
            icon={<BadgeRoundedIcon />}
            title="My Profile"
            subtitle="View your details"
            onClick={() => navigate('/profile')}
          />
        </Grid>
         <Grid size={{xs:12 , sm:6, md:3}}>
          <QuickLink
            icon={<BusinessRoundedIcon />}
            title="Edit Profile"
            subtitle="Update name & email"
            onClick={() => navigate('/profile/edit')}
          />
        </Grid>
         <Grid size={{xs:12 , sm:6, md:3}}>
          <QuickLink
            icon={<LockResetRoundedIcon />}
            title="Change Password"
            subtitle="Keep your account secure"
            onClick={() => navigate('/change-password')}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
