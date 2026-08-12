import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Box } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar, { MobileSidebar } from '@/layouts/Sidebar';
import TopAppBar from '@/layouts/TopAppBar';
import { navItems } from '@/routes/navConfig';

const COLLAPSE_KEY = 'shop-ms-sidebar-collapsed';

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState<boolean>(() => localStorage.getItem(COLLAPSE_KEY) === 'true');
  const [mobileOpen, setMobileOpen] = useState(false);
  const { pathname } = useLocation();

  const current = navItems.find((n) => pathname.startsWith(n.path));
  const title = current?.label || 'Dashboard';

  const toggleCollapse = () => {
    setCollapsed((prev) => {
      localStorage.setItem(COLLAPSE_KEY, String(!prev));
      return !prev;
    });
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Sidebar collapsed={collapsed} onToggleCollapse={toggleCollapse} mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />
      <MobileSidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />

      <Box component="main" sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <TopAppBar title={title} onOpenMobileSidebar={() => setMobileOpen(true)} />
        <Box sx={{ flex: 1, p: { xs: 2, md: 3 }, maxWidth: 1400, width: '100%', mx: 'auto' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </Box>
      </Box>
    </Box>
  );
}
