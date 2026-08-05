import { useState } from 'react';
import {
  AppBar, Toolbar, Typography, IconButton, Drawer, Box,
  Avatar, Tooltip, Divider, List, ListItemButton, ListItemIcon, ListItemText,
  Menu, MenuItem,
} from '@mui/material';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import BadgeRoundedIcon from '@mui/icons-material/BadgeRounded';
import LockResetRoundedIcon from '@mui/icons-material/LockResetRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { colors, getAvatarGradient } from '../theme/colors';
import { getInitials } from '../utils/validators';

export const DRAWER_WIDTH = 232;

const navItems = [
  { label: 'Dashboard', icon: <DashboardRoundedIcon />, path: '/dashboard' },
  { label: 'My Profile', icon: <BadgeRoundedIcon />, path: '/profile' },
  { label: 'Change Password', icon: <LockResetRoundedIcon />, path: '/change-password' },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Toolbar />
      <Box sx={{ px: 2.5, py: 3 }}>
        <Typography
          sx={{ fontFamily: '"Space Grotesk", sans-serif', fontWeight: 700, fontSize: 19, color: colors.navy }}
        >
          EMS
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Employee Portal
        </Typography>
      </Box>

      <Divider />

      <List sx={{ flexGrow: 1, px: 1.25, py: 1.5 }}>
        {navItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <ListItemButton
              key={item.path}
              selected={active}
              onClick={() => { navigate(item.path); setMobileOpen(false); }}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                position: 'relative',
                pl: 2,
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  left: 0,
                  top: 8,
                  bottom: 8,
                  width: 3,
                  borderRadius: 3,
                  bgcolor: active ? colors.amber : 'transparent',
                },
                '&.Mui-selected': {
                  bgcolor: colors.navySoft,
                  color: colors.navy,
                  '& .MuiListItemIcon-root': { color: colors.navy },
                  '&:hover': { bgcolor: colors.navySoft },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 38, color: colors.inkSoft }}>{item.icon}</ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{ fontSize: 14.5, fontWeight: active ? 700 : 500 }}
              />
            </ListItemButton>
          );
        })}
      </List>

      <Divider />

      <Box sx={{ p: 1.25 }}>
        <ListItemButton onClick={handleLogout} sx={{ borderRadius: 2 }}>
          <ListItemIcon sx={{ minWidth: 38, color: colors.danger }}>
            <LogoutRoundedIcon />
          </ListItemIcon>
          <ListItemText
            primary="Logout"
            primaryTypographyProps={{ fontSize: 14.5, fontWeight: 600, color: colors.danger }}
          />
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          bgcolor: colors.surface,
          color: colors.ink,
          borderBottom: `1px solid ${colors.line}`,
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar sx={{ gap: 1.5 }}>
          <IconButton edge="start" onClick={() => setMobileOpen(!mobileOpen)} sx={{ display: { sm: 'none' } }}>
            <MenuRoundedIcon />
          </IconButton>
          <Typography sx={{ flexGrow: 1, fontWeight: 600, fontSize: 15 }}>
            {navItems.find((n) => n.path === location.pathname)?.label || 'Employee Portal'}
          </Typography>
          <Tooltip title="Account">
            <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} size="small" sx={{ p: 0 }}>
              <Avatar
                sx={{
                  width: 36, height: 36, fontSize: 14, fontWeight: 700,
                  background: getAvatarGradient(user?.name || ''),
                }}
              >
                {getInitials(user?.name)}
              </Avatar>
            </IconButton>
          </Tooltip>

          <Menu
            anchorEl={anchorEl}
            open={!!anchorEl}
            onClose={() => setAnchorEl(null)}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <Box sx={{ px: 2, py: 1.25, minWidth: 180 }}>
              <Typography sx={{ fontWeight: 700, fontSize: 14 }} noWrap>
                {user?.name}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap>
                {user?.email}
              </Typography>
            </Box>
            <Divider />
            <MenuItem onClick={() => { setAnchorEl(null); navigate('/profile'); }}>
              <ListItemIcon>
                <PersonRoundedIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>My Profile</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => { setAnchorEl(null); navigate('/change-password'); }}>
              <ListItemIcon>
                <LockResetRoundedIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Reset Password</ListItemText>
            </MenuItem>
            <Divider />
            <MenuItem onClick={() => { setAnchorEl(null); handleLogout(); }} sx={{ color: 'error.main' }}>
              <ListItemIcon>
                <LogoutRoundedIcon fontSize="small" color="error" />
              </ListItemIcon>
              <ListItemText>Logout</ListItemText>
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            borderRight: `1px solid ${colors.line}`,
          },
        }}
        open
      >
        {drawerContent}
      </Drawer>

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{ display: { xs: 'block', sm: 'none' }, '& .MuiDrawer-paper': { width: DRAWER_WIDTH } }}
      >
        {drawerContent}
      </Drawer>
    </>
  );
};

export default Navbar;
