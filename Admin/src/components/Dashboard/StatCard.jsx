import { Box, Card, Typography } from '@mui/material';
import { colors } from '../../theme/colors';

const StatCard = ({ icon, label, value, tone }) => (
  <Card
    sx={{
      p: 2.75,
      height: '100%',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
      }
    }}
  >
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <Box
        sx={{
          width: 48,
          height: 48,
          borderRadius: 2.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: tone.bg,
          color: tone.fg,
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>

      <Box>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 800,
            lineHeight: 1.1,
            color: colors.ink
          }}
        >
          {value}
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            fontWeight: 500,
            mt: 0.25
          }}
        >
          {label}
        </Typography>
      </Box>
    </Box>
  </Card>
);

export default StatCard;