import { Box, Card, Typography } from '@mui/material';
import { colors } from '../../theme/colors';

const ChartContainer = ({ title, children }) => (
  <Card
    sx={{
      p: 3,
      height: '100%',
      border: `1px solid ${colors.line}`,
      borderRadius: 3
    }}
  >
    <Typography
      variant="h6"
      sx={{
        fontWeight: 700,
        mb: 3,
        color: colors.navy
      }}
    >
      {title}
    </Typography>

    <Box
      sx={{
        minHeight: 300,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
      }}
    >
      {children}
    </Box>
  </Card>
);

export default ChartContainer;