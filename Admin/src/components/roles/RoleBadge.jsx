import { Chip } from '@mui/material';
import { roleTone } from '../../theme/colors';

const RoleBadge = ({ role, size = 'small' }) => {
  const tone = roleTone[role?.toLowerCase()] || roleTone.employee;
  return (
    <Chip
      label={role || '—'}
      size={size}
      sx={{ color: tone.fg, bgcolor: tone.bg, fontSize: 11.5, height: 22 }}
    />
  );
};

export default RoleBadge;
