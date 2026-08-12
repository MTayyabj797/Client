import { Box, Drawer, List, ListItemButton, ListItemIcon, ListItemText, IconButton, Typography, Stack, Divider } from '@mui/material';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { PanelLeftClose, PanelLeftOpen, Store, X } from 'lucide-react';
import { navItems } from '@/routes/navConfig';

const DRAWER_WIDTH = 256;

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

function NavList({ collapsed, onNavigate }: { collapsed: boolean; onNavigate?: () => void }) {
  const { pathname } = useLocation();
  return (
    <List sx={{ py: 1 }}>
      {navItems.map((item) => {
        const active = pathname === item.path || pathname.startsWith(item.path + '/');
        const Icon = item.icon;
        return (
          <ListItemButton
            key={item.path}
            href={item.path}
            onClick={onNavigate}
            sx={{
              mx: collapsed ? 0.75 : 1.25,
              my: 0.25,
              px: collapsed ? 1.5 : 2,
              py: 1.1,
              borderRadius: 2,
              minHeight: 44,
              justifyContent: collapsed ? 'center' : 'flex-start',
              bgcolor: active ? 'action.selected' : 'transparent',
              color: active ? 'primary.main' : 'text.secondary',
              fontWeight: active ? 600 : 500,
              '&:hover': { bgcolor: 'action.hover' },
              transition: 'all 0.2s',
            }}
          >
            <ListItemIcon sx={{ minWidth: collapsed ? 0 : 36, color: 'inherit', justifyContent: 'center' }}>
              <Icon size={20} strokeWidth={active ? 2.6 : 2} />
            </ListItemIcon>
            <AnimatePresence>
              {!collapsed && (
                <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} transition={{ duration: 0.15 }}>
                  <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: 14, fontWeight: 'inherit' }} />
                </motion.div>
              )}
            </AnimatePresence>
          </ListItemButton>
        );
      })}
    </List>
  );
}

function BrandHeader({ collapsed }: { collapsed: boolean }) {
  return (
    <Stack direction="row" alignItems="center" spacing={1.5} sx={{ px: collapsed ? 1.5 : 2.5, py: 2, minHeight: 64 }}>
      <Box sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', borderRadius: 2, p: 1, display: 'flex', flexShrink: 0 }}>
        <Store size={20} />
      </Box>
      <AnimatePresence>
        {!collapsed && (
          <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }}>
            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: 15, lineHeight: 1.1 }}>Shop Manager</Typography>
              <Typography variant="caption" color="text.secondary">Javed Nawaz and brothers</Typography>
            </Box>
          </motion.div>
        )}
      </AnimatePresence>
    </Stack>
  );
}

export default function Sidebar({ collapsed, onToggleCollapse, mobileOpen, onCloseMobile }: SidebarProps) {
  return (
    <Box
      component="nav"
      sx={{
        width: collapsed ? 72 : DRAWER_WIDTH,
        flexShrink: 0,
        borderRight: 1,
        borderColor: 'divider',
        bgcolor: 'background.paper',
        transition: 'width 0.25s cubic-bezier(0.4,0,0.2,1)',
        display: { xs: 'none', md: 'flex' },
        flexDirection: 'column',
        position: 'sticky',
        top: 0,
        height: '100vh',
      }}
    >
      <BrandHeader collapsed={collapsed} />
      <Divider />
      <Box sx={{ flex: 1, overflow: 'hidden' }}>
        <NavList collapsed={collapsed} />
      </Box>
      <Divider />
      <Box sx={{ p: collapsed ? 1 : 1.5, display: 'flex', justifyContent: collapsed ? 'center' : 'flex-end' }}>
        <IconButton onClick={onToggleCollapse} sx={{ border: 1, borderColor: 'divider' }}>
          {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
        </IconButton>
      </Box>
    </Box>
  );
}

export function MobileSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Drawer
      open={open}
      onClose={onClose}
      ModalProps={{ keepMounted: true }}
      PaperProps={{ sx: { width: DRAWER_WIDTH, borderRadius: 0 } }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ px: 2.5, py: 2, minHeight: 64 }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', borderRadius: 2, p: 1, display: 'flex' }}>
            <Store size={20} />
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 700, fontSize: 15, lineHeight: 1.1 }}>Shop Manager</Typography>
            <Typography variant="caption" color="text.secondary">Business Suite</Typography>
          </Box>
        </Stack>
        <IconButton onClick={onClose}><X size={20} /></IconButton>
      </Stack>
      <Divider />
      <NavList collapsed={false} onNavigate={onClose} />
    </Drawer>
  );
}

export { DRAWER_WIDTH };
