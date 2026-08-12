import { AppBar, Toolbar, IconButton, Tooltip, Avatar, Badge, Box, Typography, Stack, useMediaQuery, useTheme } from '@mui/material';
import { Menu, Bell, Search, LogOut } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';
import Logo from '/public/Logo.webp';

interface TopAppBarProps {
  title: string;
  onOpenMobileSidebar: () => void;
}

export default function TopAppBar({ title, onOpenMobileSidebar }: TopAppBarProps) {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const { user, logout } = useAuth();

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: 'background.paper',
        color: 'text.primary',
        borderBottom: 1,
        borderColor: 'divider',
        backdropFilter: 'blur(8px)',
      }}
    >
      <Toolbar sx={{ gap: 1.5, minHeight: { xs: 60, md: 64 } }}>
        {!isDesktop && (
          <IconButton onClick={onOpenMobileSidebar} edge="start"><Menu size={22} /></IconButton>
        )}
        <Typography variant="h6" sx={{ fontWeight: 700, fontSize: { xs: 17, md: 19 }, display: { xs: 'none', sm: 'block' } }}>
          {title}
        </Typography>

        <Box sx={{ flex: 1 }} />

        {/* <Stack
          direction="row"
          alignItems="center"
          spacing={1}
          sx={{
            bgcolor: 'action.hover',
            borderRadius: 2,
            px: 2,
            py: 0.5,
            display: { xs: 'none', lg: 'flex' },
            minWidth: 240,
          }}
        >
          <Search size={18} color="#94a3b8" />
          <Box
            component="input"
            placeholder="Search…"
            sx={{
              border: 'none',
              outline: 'none',
              background: 'transparent',
              fontSize: 14,
              width: '100%',
              color: 'text.primary',
              '::placeholder': { color: '#94a3b8' },
            }}
          />
        </Stack> */}

        {/* <Tooltip title="Notifications">
          <IconButton>
            <Badge badgeContent={3} color="error"><Bell size={20} /></Badge>
          </IconButton>
        </Tooltip> */}

        <ThemeToggle />

        <Tooltip title={user?.name || 'Shop Admin'}>
          <Avatar sx={{ width: 34, height: 34, bgcolor: 'primary.main', fontWeight: 600, fontSize: 14 }}>{user?.name?.slice(0, 2).toUpperCase() || 'SA'}</Avatar>
        </Tooltip>
        {/* <Tooltip title={user?.name || 'Shop Admin'}>
          <Avatar
            src="/Logo.webp"
            alt="Javed Zaffar and Brothers"
            sx={{
              width: 34,
              height: 34,
              bgcolor: 'transparent',
            }}
          />
        </Tooltip> */}

        <Tooltip title="Logout">
          <IconButton onClick={() => { logout(); toast.success('Logged out successfully'); }} sx={{ border: 1, borderColor: 'divider' }}>
            <LogOut size={18} />
          </IconButton>
        </Tooltip>
      </Toolbar>
    </AppBar>
  );
}
