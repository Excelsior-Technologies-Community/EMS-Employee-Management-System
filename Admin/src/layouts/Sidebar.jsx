import {
  Box, Typography, Divider, List, ListItemButton, ListItemIcon, ListItemText,
} from '@mui/material';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import GroupRoundedIcon from '@mui/icons-material/GroupRounded';
import ApartmentRoundedIcon from '@mui/icons-material/ApartmentRounded';
import AdminPanelSettingsRoundedIcon from '@mui/icons-material/AdminPanelSettingsRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';

export const DRAWER_WIDTH = 240;

// Every entry declares which roles can see it — single source of truth for the menu.
const NAV_ITEMS = [
  { label: 'Dashboard', icon: <DashboardRoundedIcon />, path: '/dashboard', roles: ['Admin', 'HR', 'Manager'] },
  { label: 'Employees', icon: <GroupRoundedIcon />, path: '/employees', roles: ['Admin', 'HR', 'Manager'] },
  { label: 'Departments', icon: <ApartmentRoundedIcon />, path: '/departments', roles: ['Admin'] },
  { label: 'Roles', icon: <AdminPanelSettingsRoundedIcon />, path: '/roles', roles: ['Admin'] },
  { label: 'Profile', icon: <PersonRoundedIcon />, path: '/profile', roles: ['Admin', 'HR', 'Manager'] },
];

const Sidebar = ({ onNavigate }) => {
  const { user, hasRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const items = NAV_ITEMS.filter((item) => hasRole(...item.roles));

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ px: 2.5, py: 3 }}>
        <Typography sx={{ fontFamily: '"Space Grotesk", sans-serif', fontWeight: 700, fontSize: 19, color: colors.navy }}>
          EMS
        </Typography>
        <Typography variant="caption" color="text.secondary">Admin Panel</Typography>
      </Box>

      <Divider />

      <List sx={{ flexGrow: 1, px: 1.25, py: 1.5 }}>
        {items.map((item) => {
          const active = location.pathname.startsWith(item.path);
          return (
            <ListItemButton
              key={item.path}
              selected={active}
              onClick={() => { navigate(item.path); onNavigate?.(); }}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                position: 'relative',
                pl: 2,
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  left: 0, top: 8, bottom: 8, width: 3, borderRadius: 3,
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

      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="caption" color="text.secondary">
          Signed in as <strong>{user?.role}</strong>
        </Typography>
      </Box>
    </Box>
  );
};

export default Sidebar;
