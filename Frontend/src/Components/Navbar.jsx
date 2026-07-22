import { useState } from 'react';
import {
  AppBar, Toolbar, Typography, IconButton, Drawer, List,
  ListItem, ListItemButton, ListItemIcon, ListItemText, Box,
  Avatar, Tooltip, Divider, Chip
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import BusinessIcon from '@mui/icons-material/Business';
import WorkIcon from '@mui/icons-material/Work';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DRAWER_WIDTH = 240;

const roleColors = {
  admin: 'error',
  hr: 'warning',
  manager: 'info',
  employee: 'success',
};

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [];
  const role = user?.role?.toLowerCase();

  if (role === 'admin' || role === 'hr' || role === 'manager') {
    navItems.push({ label: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' });
    navItems.push({ label: 'Employees', icon: <PeopleIcon />, path: '/employees' });
    navItems.push({ label: 'Departments', icon: <BusinessIcon />, path: '/departments' });
  }

  if (role === 'admin') {
    navItems.push({ label: 'Roles', icon: <WorkIcon />, path: '/roles' });
  }

  if (role === 'employee') {
    navItems.push({ label: 'My Profile', icon: <PersonIcon />, path: `/profile/${user.id}` });
  }

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Logo */}
      <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white' }}>
        <Typography variant="h6" fontWeight="bold">EMS</Typography>
        <Typography variant="caption">Employee Management</Typography>
      </Box>

      {/* User Info */}
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36 }}>
          {user?.name?.charAt(0).toUpperCase()}
        </Avatar>
        <Box>
          <Typography variant="body2" fontWeight="bold" noWrap>{user?.name}</Typography>
          <Chip
            label={user?.role}
            color={roleColors[user?.role?.toLowerCase()] || 'default'}
            size="small"
            sx={{ height: 18, fontSize: '0.65rem' }}
          />
        </Box>
      </Box>

      <Divider />

      {/* Nav Links */}
      <List sx={{ flexGrow: 1, overflowY: 'auto' }}>
        {navItems.map((item) => (
          <ListItem key={item.path} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => { navigate(item.path); setMobileOpen(false); }}
              sx={{
                '&.Mui-selected': {
                  bgcolor: 'primary.light',
                  color: 'primary.contrastText',
                  '& .MuiListItemIcon-root': { color: 'primary.contrastText' },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider />

      {/* Logout */}
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={handleLogout}>
            <ListItemIcon sx={{ minWidth: 36 }}><LogoutIcon color="error" /></ListItemIcon>
            <ListItemText primary="Logout" sx={{ color: 'error.main' }} />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton color="inherit" edge="start" onClick={() => setMobileOpen(!mobileOpen)} sx={{ mr: 2, display: { sm: 'none' } }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1 }} fontWeight="bold">
            Employee Management System
          </Typography>
          <Tooltip title={user?.name || ''}>
            <Avatar sx={{ bgcolor: 'secondary.main', width: 36, height: 36, cursor: 'pointer' }}>
              {user?.name?.charAt(0).toUpperCase()}
            </Avatar>
          </Tooltip>
        </Toolbar>
      </AppBar>

      {/* Desktop Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            top: '64px',
            height: 'calc(100vh - 64px)',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
          },
        }}
        open
      >
        {drawerContent}
      </Drawer>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { width: DRAWER_WIDTH },
        }}
      >
        {drawerContent}
      </Drawer>
    </>
  );
};

export default Navbar;
