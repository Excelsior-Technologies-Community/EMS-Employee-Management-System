import { Box, Card, Divider, Typography, Alert } from '@mui/material';
import EmailRoundedIcon from '@mui/icons-material/EmailRounded';
import WorkRoundedIcon from '@mui/icons-material/WorkRounded';
import BusinessRoundedIcon from '@mui/icons-material/BusinessRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import { useNavigate } from 'react-router-dom';
import Loader from '../../components/common/Loader';
import CustomButton from '../../components/common/CustomButton';
import ProfileCard from '../../components/common/ProfileCard';
import { useAuth } from '../../context/AuthContext';
import { useFetch } from '../../hooks/useFetch';
import { profileService } from '../../services/profileService';
import { colors } from '../../theme/colors';

const InfoRow = ({ icon, label, value }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1.75 }}>
    <Box
      sx={{
        width: 38, height: 38, borderRadius: 2, bgcolor: colors.navySoft,
        color: colors.navy, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}
    >
      {icon}
    </Box>
    <Box sx={{ minWidth: 0 }}>
      <Typography variant="caption" color="text.secondary">{label}</Typography>
      <Typography sx={{ fontWeight: 600, fontSize: 14.5 }}>{value || '—'}</Typography>
    </Box>
  </Box>
);

const MyProfile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: employee, loading, error } = useFetch(
    () => profileService.getProfile(user.id),
    [user.id]
  );

  if (loading) return <Loader label="Loading your profile..." />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h5">My Profile</Typography>
        <CustomButton
          variant="outlined"
          startIcon={<EditRoundedIcon fontSize="small" />}
          onClick={() => navigate('/profile/edit')}
        >
          Edit Profile
        </CustomButton>
      </Box>

      <Card sx={{ p: 3.5, mb: 3 }}>
        <ProfileCard
          name={employee?.name}
          email={employee?.email}
          role={employee?.role_name}
          department={employee?.department_name}
        />
      </Card>

      <Card sx={{ p: 3.5 }}>
        <Typography sx={{ fontWeight: 700, fontSize: 14, mb: 1 }}>Employment Details</Typography>
        <Divider sx={{ mb: 0.5 }} />
        <InfoRow icon={<EmailRoundedIcon fontSize="small" />} label="Email" value={employee?.email} />
        <Divider sx={{ opacity: 0.5 }} />
        <InfoRow icon={<WorkRoundedIcon fontSize="small" />} label="Role" value={employee?.role_name} />
        <Divider sx={{ opacity: 0.5 }} />
        <InfoRow icon={<BusinessRoundedIcon fontSize="small" />} label="Department" value={employee?.department_name} />
      </Card>
    </Box>
  );
};

export default MyProfile;
