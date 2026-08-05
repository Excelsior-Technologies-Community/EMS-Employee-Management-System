import { Box, Card, Avatar, Typography, Chip, Divider } from '@mui/material';
import EmailRoundedIcon from '@mui/icons-material/EmailRounded';
import WorkRoundedIcon from '@mui/icons-material/WorkRounded';
import BusinessRoundedIcon from '@mui/icons-material/BusinessRounded';
import LockResetRoundedIcon from '@mui/icons-material/LockResetRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import CustomButton from '../../components/common/CustomButton';
import { useAuth } from '../../context/AuthContext';
import { useFetch } from '../../hooks/useFetch';
import { employeeService } from '../../services/employeeService';
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
  const { data: res } = useFetch(() => employeeService.getById(user.id), [user.id]);
  const employee = res?.data || user;
  const tone = roleTone[employee?.role_name?.toLowerCase() || employee?.role?.toLowerCase()] || roleTone.employee;

  return (
    <Box>
      <PageHeader
        title="My Profile"
        crumbs={[{ label: 'Dashboard', path: '/dashboard' }, { label: 'Profile' }]}
        action={
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <CustomButton
              variant="outlined"
              startIcon={<EditRoundedIcon fontSize="small" />}
              onClick={() => navigate('/profile/edit')}
            >
              Edit Profile
            </CustomButton>
            <CustomButton
              variant="outlined"
              startIcon={<LockResetRoundedIcon fontSize="small" />}
              onClick={() => navigate('/change-password')}
            >
              Change Password
            </CustomButton>
          </Box>
        }
      />

      <Card sx={{ p: 3.5, mb: 3, maxWidth: 520 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
          <Avatar sx={{ width: 72, height: 72, fontSize: 28, fontWeight: 700, fontFamily: '"Space Grotesk", sans-serif', background: getAvatarGradient(employee?.name || '') }}>
            {getInitials(employee?.name)}
          </Avatar>
          <Box>
            <Typography variant="h6">{employee?.name}</Typography>
            <Typography variant="body2" color="text.secondary">{employee?.email}</Typography>
            <Chip label={employee?.role_name || employee?.role} size="small" sx={{ mt: 1, color: tone.fg, bgcolor: tone.bg, fontWeight: 700 }} />
          </Box>
        </Box>
      </Card>

      <Card sx={{ p: 3.5, maxWidth: 520 }}>
        <Typography sx={{ fontWeight: 700, fontSize: 14, mb: 1 }}>Account Details</Typography>
        <Divider sx={{ mb: 0.5 }} />
        <InfoRow icon={<EmailRoundedIcon fontSize="small" />} label="Email" value={employee?.email} />
        <Divider sx={{ opacity: 0.5 }} />
        <InfoRow icon={<WorkRoundedIcon fontSize="small" />} label="Role" value={employee?.role_name || employee?.role} />
        <Divider sx={{ opacity: 0.5 }} />
        <InfoRow icon={<BusinessRoundedIcon fontSize="small" />} label="Department" value={employee?.department_name || employee?.department} />
      </Card>
    </Box>
  );
};

export default Profile;
