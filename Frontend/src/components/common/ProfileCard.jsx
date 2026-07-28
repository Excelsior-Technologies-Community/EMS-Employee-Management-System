import { Avatar, Box, Chip, Typography } from '@mui/material';
import { colors, getAvatarGradient } from '../../theme/colors';
import { getInitials } from '../../utils/validators';

const roleTone = {
  admin: { fg: colors.danger, bg: colors.dangerSoft },
  hr: { fg: colors.amberDeep, bg: colors.amberSoft },
  manager: { fg: colors.info, bg: colors.infoSoft },
  employee: { fg: colors.success, bg: colors.successSoft },
};

const ProfileCard = ({ name, email, role, department, size = 72 }) => {
  const tone = roleTone[role?.toLowerCase()] || roleTone.employee;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
      <Avatar
        sx={{
          width: size,
          height: size,
          fontSize: size / 2.4,
          fontWeight: 700,
          fontFamily: '"Space Grotesk", sans-serif',
          background: getAvatarGradient(name),
          border: '3px solid rgba(255,255,255,0.5)',
        }}
      >
        {getInitials(name)}
      </Avatar>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="h6" noWrap sx={{ lineHeight: 1.2 }}>
          {name}
        </Typography>
        <Typography variant="body2" color="text.secondary" noWrap>
          {email}
        </Typography>
        <Box sx={{ display: 'flex', gap: 0.75, mt: 0.75, flexWrap: 'wrap' }}>
          {role && (
            <Chip
              label={role}
              size="small"
              sx={{
                color: tone.fg,
                bgcolor: tone.bg,
                fontWeight: 700,
                fontSize: 11,
                height: 22,
              }}
            />
          )}
          {department && (
            <Chip
              label={department}
              size="small"
              variant="outlined"
              sx={{ fontSize: 11, height: 22 }}
            />
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default ProfileCard;
