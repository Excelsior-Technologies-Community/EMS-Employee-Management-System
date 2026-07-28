import { Box, Card, Avatar, Typography, Chip, Divider } from '@mui/material';
import EmailRoundedIcon from '@mui/icons-material/EmailRounded';
import WorkRoundedIcon from '@mui/icons-material/WorkRounded';
import BusinessRoundedIcon from '@mui/icons-material/BusinessRounded';
import LockResetRoundedIcon from '@mui/icons-material/LockResetRounded';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import CustomButton from '../../components/common/CustomButton';
import { useAuth } from '../../context/AuthContext';
import { colors, getAvatarGradient, roleTone } from '../../theme/colors';
import { getInitials } from '../../utils/validators';

const InfoRow = ({ icon, label, value }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1.75 }}>
    <Box sx={{ width: 38, height: 38, borderRadius: 2, bgcolor: colors.navySoft, color: colors.navy, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      {icon}
    </Box>
    <Box sx={{ minWidth: 0 }}>
      <Typography variant="caption" color="text.secondary">{label}</Typography>
      <Typography sx={{ fontWeight: 600, fontSize: 14.5 }}>{value || '—'}</Typography>
    </Box>
  </Box>
);

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const tone = roleTone[user?.role?.toLowerCase()] || roleTone.employee;

  return (
    <Box>
      <PageHeader
        title="My Profile"
        crumbs={[{ label: 'Dashboard', path: '/dashboard' }, { label: 'Profile' }]}
        action={
          <CustomButton
            variant="outlined"
            startIcon={<LockResetRoundedIcon fontSize="small" />}
            onClick={() => navigate('/change-password')}
          >
            Change Password
          </CustomButton>
        }
      />

      <Card sx={{ p: 3.5, mb: 3, maxWidth: 520 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
          <Avatar sx={{ width: 72, height: 72, fontSize: 28, fontWeight: 700, fontFamily: '"Space Grotesk", sans-serif', background: getAvatarGradient(user?.name || '') }}>
            {getInitials(user?.name)}
          </Avatar>
          <Box>
            <Typography variant="h6">{user?.name}</Typography>
            <Typography variant="body2" color="text.secondary">{user?.email}</Typography>
            <Chip label={user?.role} size="small" sx={{ mt: 1, color: tone.fg, bgcolor: tone.bg, fontWeight: 700 }} />
          </Box>
        </Box>
      </Card>

      <Card sx={{ p: 3.5, maxWidth: 520 }}>
        <Typography sx={{ fontWeight: 700, fontSize: 14, mb: 1 }}>Account Details</Typography>
        <Divider sx={{ mb: 0.5 }} />
        <InfoRow icon={<EmailRoundedIcon fontSize="small" />} label="Email" value={user?.email} />
        <Divider sx={{ opacity: 0.5 }} />
        <InfoRow icon={<WorkRoundedIcon fontSize="small" />} label="Role" value={user?.role} />
        <Divider sx={{ opacity: 0.5 }} />
        <InfoRow icon={<BusinessRoundedIcon fontSize="small" />} label="Department" value={user?.department} />
      </Card>
    </Box>
  );
};

export default Profile;
