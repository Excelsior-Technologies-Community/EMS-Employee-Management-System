import { Box, Toolbar } from '@mui/material';
import Navbar from './Navbar';

const DRAWER_WIDTH = 240;

const Layout = ({ children }) => {
  return (
    <Box sx={{ display: 'flex' }}>
      <Navbar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
          minHeight: '100vh',
          bgcolor: 'grey.50',
        }}
      >
        <Toolbar /> {/* AppBar ki height ke liye spacer */}
        {children}
      </Box>
    </Box>
  );
};

export default Layout;
