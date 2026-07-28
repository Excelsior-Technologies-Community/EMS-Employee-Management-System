import { Avatar, Box, Typography } from '@mui/material';
import { getAvatarGradient } from '../../theme/colors';

const DepartmentAvatar = ({ name, size = 32 }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
    <Avatar
      sx={{
        width: size, height: size, fontSize: size / 2.6, fontWeight: 700,
        background: getAvatarGradient(name || ''),
      }}
    >
      {(name || '?').charAt(0).toUpperCase()}
    </Avatar>
    <Typography sx={{ fontWeight: 600, fontSize: 14 }}>{name}</Typography>
  </Box>
);

export default DepartmentAvatar;
