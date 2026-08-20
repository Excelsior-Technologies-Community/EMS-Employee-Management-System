import { Box, Toolbar } from '@mui/material';
import Navbar, { DRAWER_WIDTH } from './Navbar';

const MainLayout = ({ children }) => (
  <Box sx={{ display: 'flex' }}>
    <Navbar />
    <Box
      component="main"
      sx={{
        flexGrow: 1,
        width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
        minWidth: 0,
        minHeight: '100vh',
        bgcolor: 'background.default',
      }}
    >
      <Toolbar />
      <Box sx={{ p: { xs: 2.5, md: 4 }, maxWidth: 920, mx: 'auto' }}>{children}</Box>
    </Box>
  </Box>
);

export default MainLayout;
