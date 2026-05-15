import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { styled, alpha, createTheme, ThemeProvider } from '@mui/material/styles';
import MuiDrawer from '@mui/material/Drawer';
import MuiAppBar from '@mui/material/AppBar';
import {
  Toolbar, List, CssBaseline, Typography, IconButton,
  ListItem, ListItemButton, ListItemIcon, ListItemText, Box, Button, InputBase, Stack,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import SearchIcon from '@mui/icons-material/Search';
import LogoutIcon from '@mui/icons-material/Logout';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AssessmentIcon from '@mui/icons-material/Assessment';
import PeopleIcon from '@mui/icons-material/People';
import ArticleIcon from '@mui/icons-material/Article';

const drawerWidth = 240;
const AMBER = '#fbbf24';

const dashTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: AMBER, contrastText: '#09090b' },
    background: { default: '#09090b', paper: '#0f0f12' },
    divider: '#27272a',
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: "'Manrope', system-ui, sans-serif",
    h3: { fontFamily: "'DM Serif Display', serif", fontWeight: 400, fontVariantNumeric: 'tabular-nums' },
    h4: { fontFamily: "'DM Serif Display', serif", fontWeight: 400, letterSpacing: '-0.01em' },
    h5: { fontFamily: "'DM Serif Display', serif", fontWeight: 400 },
    h6: { fontWeight: 700, letterSpacing: '-0.005em', fontSize: 14 },
    overline: { letterSpacing: '0.28em', fontWeight: 700, fontSize: 10 },
  },
  components: {
    MuiPaper: { styleOverrides: { root: { backgroundImage: 'none', border: '1px solid #1c1c20', boxShadow: 'none' } } },
    MuiChip: {
      styleOverrides: { root: { borderRadius: 999, height: 22, fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase' } },
    },
    MuiDataGrid: {
      styleOverrides: {
        root: { border: '1px solid #1c1c20', borderRadius: 12, fontSize: 13 },
        columnHeaders: { backgroundColor: '#15151a', borderBottom: '1px solid #27272a' },
        columnHeaderTitle: { fontSize: 10, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#71717a' },
        cell: { borderColor: '#1c1c20', '&:focus, &:focus-within': { outline: 'none' } },
        footerContainer: { borderTop: '1px solid #27272a', backgroundColor: '#15151a' },
      },
    },
    MuiLinearProgress: {
      styleOverrides: { root: { height: 4, borderRadius: 999, backgroundColor: '#1c1c20' }, bar: { backgroundColor: AMBER } },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: 'rgba(9, 9, 11, 0.78)',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          borderBottom: '1px solid #1c1c20',
        },
      },
    },
  },
});

const drawerPaper = {
  backgroundColor: '#0a0a0d',
  borderRight: '1px solid #1c1c20',
  backgroundImage: 'radial-gradient(400px circle at 0% 0%, rgba(251,191,36,0.06), transparent 60%)',
};

const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create('width', { easing: theme.transitions.easing.sharp, duration: theme.transitions.duration.enteringScreen }),
  overflowX: 'hidden',
  ...drawerPaper,
});

const closedMixin = (theme) => ({
  transition: theme.transitions.create('width', { easing: theme.transitions.easing.sharp, duration: theme.transitions.duration.leavingScreen }),
  overflowX: 'hidden',
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up('sm')]: { width: `calc(${theme.spacing(8)} + 1px)` },
  ...drawerPaper,
});

const AppBar = styled(MuiAppBar, { shouldForwardProp: (p) => p !== 'open' })(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin'], { easing: theme.transitions.easing.sharp, duration: theme.transitions.duration.leavingScreen }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], { easing: theme.transitions.easing.sharp, duration: theme.transitions.duration.enteringScreen }),
  }),
}));

const Drawer = styled(MuiDrawer, { shouldForwardProp: (p) => p !== 'open' })(({ theme, open }) => ({
  width: drawerWidth, flexShrink: 0, whiteSpace: 'nowrap', boxSizing: 'border-box',
  ...(open && { ...openedMixin(theme), '& .MuiDrawer-paper': openedMixin(theme) }),
  ...(!open && { ...closedMixin(theme), '& .MuiDrawer-paper': closedMixin(theme) }),
}));

const Logo = ({ compact }) => (
  <Stack direction="row" alignItems="center" spacing={1.3}>
    <Box sx={{
      width: 30, height: 30, borderRadius: 1.2, flexShrink: 0,
      bgcolor: 'primary.main', color: 'primary.contrastText',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'DM Serif Display', serif", fontSize: 19, lineHeight: 1,
    }}>C</Box>
    {!compact && (
      <Box sx={{ overflow: 'hidden' }}>
        <Typography sx={{ fontFamily: "'DM Serif Display', serif", fontSize: 18, lineHeight: 1.1, color: 'text.primary' }}>
          CineVault
        </Typography>
        <Typography variant="overline" color="primary" sx={{ fontSize: 8.5, letterSpacing: '.26em', lineHeight: 1 }}>
          Admin Console
        </Typography>
      </Box>
    )}
  </Stack>
);

const DashLayout = () => {
  const [open, setOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  const firstName = localStorage.getItem('firstName') || 'User';
  const userType = localStorage.getItem('type') || '';

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('firstName');
    localStorage.removeItem('type');
    navigate('/auth/signin');
  };

  const allNavItems = [
    { label: 'Dashboard', to: '/dashboard', icon: <DashboardIcon /> },
    { label: 'Reports', to: '/dashboard/reports', icon: <AssessmentIcon /> },
    { label: 'Articles', to: '/dashboard/articles', icon: <ArticleIcon /> },
    { label: 'Users', to: '/dashboard/users', icon: <PeopleIcon />, adminOnly: true },
  ];

  // Enhancement 1: editors cannot see the Users nav item
  const navItems = allNavItems.filter((item) => {
    if (item.adminOnly && userType === 'editor') return false;
    return true;
  });

  const currentLabel = navItems.find((n) => n.to === location.pathname)?.label || 'Dashboard';

  return (
    <ThemeProvider theme={dashTheme}>
      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
        <CssBaseline />
        <AppBar position="fixed" open={open} elevation={0}>
          <Toolbar sx={{ gap: 2 }}>
            <IconButton color="inherit" onClick={() => setOpen(true)} edge="start" sx={{ ...(open && { display: 'none' }) }}>
              <MenuIcon />
            </IconButton>
            <Stack direction="row" alignItems="baseline" spacing={1.2} sx={{ flexGrow: 1 }}>
              <Typography variant="overline" color="text.secondary">CineVault</Typography>
              <Typography variant="overline" color="primary">/</Typography>
              <Typography variant="overline" sx={{ color: 'text.primary' }}>{currentLabel}</Typography>
            </Stack>
            <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
              Welcome, {firstName}
            </Typography>
            <Box sx={{ position: 'relative', display: { xs: 'none', sm: 'block' } }}>
              <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', pl: 1.5, pointerEvents: 'none', color: 'text.secondary' }}>
                <SearchIcon fontSize="small" />
              </Box>
              <InputBase placeholder="Search the vault…" sx={{
                pl: 5, pr: 2, py: 0.7, borderRadius: 2, bgcolor: 'background.paper',
                border: '1px solid', borderColor: 'divider', fontSize: 13, width: 240,
                transition: 'border-color .2s, width .2s',
                '&:hover': { borderColor: alpha(AMBER, 0.35) },
                '&:focus-within': { borderColor: 'primary.main', width: 280 },
              }} />
            </Box>
            <Button color="inherit" variant="outlined" onClick={handleLogout}
              startIcon={<LogoutIcon sx={{ fontSize: 16 }} />}
              sx={{
                borderColor: 'divider', color: 'text.secondary',
                textTransform: 'none', fontSize: 12, letterSpacing: '.06em', fontWeight: 600,
                '&:hover': { borderColor: 'primary.main', color: 'primary.main', bgcolor: alpha(AMBER, 0.05) },
              }}>
              Logout
            </Button>
          </Toolbar>
        </AppBar>

        <Drawer variant="permanent" open={open}>
          <Toolbar sx={{ justifyContent: open ? 'space-between' : 'center', px: open ? 2 : 1, minHeight: 64 }}>
            <Logo compact={!open} />
            {open && (
              <IconButton onClick={() => setOpen(false)} size="small" sx={{ color: 'text.secondary' }}>
                <ChevronLeftIcon />
              </IconButton>
            )}
          </Toolbar>

          {open && (
            <Typography variant="overline" color="text.secondary" sx={{ px: 3, pt: 2, pb: 0.5, display: 'block' }}>
              Console
            </Typography>
          )}

          <List sx={{ px: 1, pt: open ? 0.5 : 1 }}>
            {navItems.map((item) => {
              const active = location.pathname === item.to;
              return (
                <ListItem key={item.to} disablePadding sx={{ display: 'block', mb: 0.4 }}>
                  <ListItemButton
                    component={Link}
                    to={item.to}
                    selected={active}
                    sx={{
                      minHeight: 44, borderRadius: 1.5, position: 'relative',
                      justifyContent: open ? 'initial' : 'center',
                      px: open ? 2 : 2.5,
                      '&::before': active ? {
                        content: '""', position: 'absolute', left: -4, top: 10, bottom: 10,
                        width: 2, bgcolor: 'primary.main', borderRadius: 2,
                      } : {},
                      '&.Mui-selected': {
                        bgcolor: alpha(AMBER, 0.08), color: 'primary.main',
                        '&:hover': { bgcolor: alpha(AMBER, 0.12) },
                      },
                      '&:hover': { bgcolor: alpha(AMBER, 0.04) },
                    }}
                  >
                    <ListItemIcon sx={{
                      minWidth: 0, mr: open ? 2 : 'auto', justifyContent: 'center',
                      color: active ? 'primary.main' : 'text.secondary',
                    }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText primary={item.label}
                      sx={{ opacity: open ? 1 : 0, '& .MuiTypography-root': { fontSize: 13, fontWeight: active ? 700 : 500 } }} />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
        </Drawer>

        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <Toolbar />
          <Outlet />
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default DashLayout;
