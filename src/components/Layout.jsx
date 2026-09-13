import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar, Toolbar, Typography, Box, IconButton, Drawer, List, ListItem,
  ListItemButton, ListItemIcon, ListItemText, Divider, Avatar, Chip, Button,
  useMediaQuery, useTheme, Container, Stack, Paper,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import MiscellaneousServicesIcon from '@mui/icons-material/MiscellaneousServices';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import LogoutIcon from '@mui/icons-material/Logout';
import ScienceIcon from '@mui/icons-material/Science';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import SchoolIcon from '@mui/icons-material/School';
import HistoryIcon from '@mui/icons-material/History';
import TuneIcon from '@mui/icons-material/Tune';
import { useAuth } from '../hooks/useAuth';

const DRAWER_WIDTH = 260;

const studentNav = [
  { label: 'Campus Services', icon: <SchoolIcon />, path: '/student' },
  { label: 'Queue History', icon: <HistoryIcon />, path: '/student/history' },
  { label: 'Interactive Simulator', icon: <ScienceIcon />, path: '/demo' },
];

const adminNav = [
  { label: 'Queue Controller', icon: <DashboardIcon />, path: '/admin' },
  { label: 'Services Catalog', icon: <MiscellaneousServicesIcon />, path: '/admin/services' },
  { label: 'Counter Stations', icon: <PointOfSaleIcon />, path: '/admin/counters' },
  { label: 'Data Setup', icon: <TuneIcon />, path: '/admin/data-setup' },
];

export default function Layout({ children }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { staffUser, isAdmin, signOut, studentUser, studentName, studentId, studentSignOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const navItems = isAdmin ? adminNav : studentNav;

  const handleNav = (path) => {
    navigate(path);
    if (isMobile) setDrawerOpen(false);
  };

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: '#ffffff' }}>
      {/* Logo */}
      <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer' }} onClick={() => handleNav('/')}>
        <Avatar
          sx={{
            width: 34,
            height: 34,
            bgcolor: '#2563eb',
            color: 'white',
            fontWeight: 800,
            fontSize: '0.82rem',
            boxShadow: '0 2px 8px rgba(37, 99, 235, 0.3)',
          }}
        >
          CQ
        </Avatar>
        <Box>
          <Typography variant="subtitle2" fontWeight={800} color="#0f172a" sx={{ fontSize: '0.95rem', letterSpacing: '-0.01em', lineHeight: 1.2 }}>
            CampusQueue
          </Typography>
          <Typography variant="caption" color="#64748b" sx={{ fontSize: '0.7rem', fontWeight: 500 }}>
            Smart Queue System
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ borderColor: 'rgba(226, 232, 240, 0.8)' }} />

      {/* Nav Items */}
      <List sx={{ flex: 1, px: 1.5, py: 2 }}>
        {navItems.map((item) => {
          const isSelected = location.pathname === item.path;
          return (
            <ListItem key={item.path} disablePadding sx={{ mb: 0.8 }}>
              <ListItemButton
                onClick={() => handleNav(item.path)}
                selected={isSelected}
                sx={{
                  borderRadius: 2,
                  py: 1,
                  px: 1.5,
                  transition: 'all 0.15s ease-in-out',
                  color: isSelected ? '#2563eb' : '#475569',
                  bgcolor: isSelected ? 'rgba(37, 99, 235, 0.08)' : 'transparent',
                  '&.Mui-selected': {
                    bgcolor: 'rgba(37, 99, 235, 0.08)',
                    color: '#2563eb',
                    '& .MuiListItemIcon-root': { color: '#2563eb' },
                    '&:hover': { bgcolor: 'rgba(37, 99, 235, 0.12)' },
                  },
                  '&:hover': {
                    bgcolor: 'rgba(37, 99, 235, 0.04)',
                    color: '#2563eb',
                    '& .MuiListItemIcon-root': { color: '#2563eb' },
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 36, color: isSelected ? '#2563eb' : '#64748b' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography sx={{ fontWeight: isSelected ? 700 : 600, fontSize: '0.85rem' }}>
                      {item.label}
                    </Typography>
                  }
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Divider sx={{ borderColor: 'rgba(226, 232, 240, 0.8)' }} />

      {/* Footer Info / Staff Control */}
      {isAdmin && (
        <Box sx={{ p: 2 }}>
          <Paper
            elevation={0}
            sx={{
              p: 1.5,
              borderRadius: 2.5,
              bgcolor: '#f8fafc',
              border: '1px solid rgba(226, 232, 240, 0.8)',
              mb: 1.5,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
              <Avatar sx={{ width: 32, height: 32, bgcolor: '#7c3aed', fontSize: '0.8rem' }}>
                <AdminPanelSettingsIcon sx={{ fontSize: '1rem' }} />
              </Avatar>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a', fontSize: '0.82rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {staffUser?.displayName || 'Staff Controller'}
                </Typography>
                <Chip label="Staff Admin" size="small" sx={{ height: 18, fontSize: '0.62rem', fontWeight: 700, bgcolor: 'rgba(124, 58, 237, 0.1)', color: '#7c3aed' }} />
              </Box>
            </Box>
          </Paper>
          <Button
            fullWidth
            variant="outlined"
            size="small"
            startIcon={<LogoutIcon sx={{ fontSize: '0.85rem !important' }} />}
            onClick={async () => {
              await signOut();
              navigate('/', { replace: true });
            }}
            sx={{
              borderRadius: 2,
              py: 0.7,
              borderColor: '#cbd5e1',
              color: '#64748b',
              fontWeight: 600,
              fontSize: '0.78rem',
              textTransform: 'none',
              '&:hover': { bgcolor: 'rgba(0,0,0,0.03)', color: '#0f172a', borderColor: '#94a3b8' },
            }}
          >
            Staff Log Out
          </Button>
        </Box>
      )}

      {studentUser && !isAdmin && (
        <Box sx={{ p: 2 }}>
          <Paper
            elevation={0}
            sx={{
              p: 1.5,
              borderRadius: 2.5,
              bgcolor: '#f8fafc',
              border: '1px solid rgba(226, 232, 240, 0.8)',
              mb: 1.5,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
              <Avatar sx={{ width: 32, height: 32, bgcolor: '#2563eb', fontSize: '0.8rem' }}>
                <SchoolIcon sx={{ fontSize: '1rem' }} />
              </Avatar>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a', fontSize: '0.82rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {studentName || 'Student'}
                </Typography>
                <Chip label={`ID: ${studentId || 'N/A'}`} size="small" sx={{ height: 18, fontSize: '0.62rem', fontWeight: 700, bgcolor: 'rgba(37, 99, 235, 0.1)', color: '#2563eb' }} />
              </Box>
            </Box>
          </Paper>
          <Button
            fullWidth
            variant="outlined"
            size="small"
            startIcon={<LogoutIcon sx={{ fontSize: '0.85rem !important' }} />}
            onClick={async () => {
              await studentSignOut();
              navigate('/', { replace: true });
            }}
            sx={{
              borderRadius: 2,
              py: 0.7,
              borderColor: '#cbd5e1',
              color: '#64748b',
              fontWeight: 600,
              fontSize: '0.78rem',
              textTransform: 'none',
              '&:hover': { bgcolor: 'rgba(0,0,0,0.03)', color: '#0f172a', borderColor: '#94a3b8' },
            }}
          >
            Student Log Out
          </Button>
        </Box>
      )}
    </Box>
  );

  const standaloneRoutes = ['/', '/login', '/student/login', '/admin/login', '/demo'];
  const isStandalonePage = standaloneRoutes.includes(location.pathname);

  if (isStandalonePage) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        {children}
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Mobile Drawer */}
      {isMobile ? (
        <Drawer
          variant="temporary"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{ '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' } }}
        >
          {drawerContent}
        </Drawer>
      ) : (
        <Drawer
          variant="permanent"
          sx={{
            width: DRAWER_WIDTH,
            flexShrink: 0,
            '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box', borderRight: '1px solid', borderColor: 'divider' },
          }}
        >
          {drawerContent}
        </Drawer>
      )}

      {/* Main Content */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Mobile App Bar */}
        {isMobile && (
          <AppBar position="sticky" color="inherit" elevation={0} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
            <Toolbar>
              <IconButton edge="start" onClick={() => setDrawerOpen(true)} sx={{ mr: 1 }}>
                <MenuIcon />
              </IconButton>
              <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 700 }}>
                CampusQueue
              </Typography>
            </Toolbar>
          </AppBar>
        )}

        {/* Page Content */}
        <Box sx={{ flex: 1, overflow: 'auto' }}>
          <Box sx={{ maxWidth: '1500px', mx: 'auto', px: { xs: 2, sm: 3, md: 4, lg: 5 }, py: { xs: 2.5, md: 4 } }}>
            {children}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
