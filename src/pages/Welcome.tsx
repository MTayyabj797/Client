import { Box, Button, Typography, Stack, Container } from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Store, ArrowRight, ShoppingBag, TrendingUp, Wallet } from 'lucide-react';
import { useThemeMode } from '@/contexts/ThemeContext';
import ThemeToggle from '@/components/ThemeToggle';

export default function Welcome() {
  const navigate = useNavigate();
  const { mode } = useThemeMode();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
        bgcolor: 'background.default',
        background:
          mode === 'light'
            ? 'radial-gradient(circle at 20% 20%, rgba(37,99,235,0.10), transparent 45%), radial-gradient(circle at 80% 80%, rgba(8,145,178,0.10), transparent 45%)'
            : 'radial-gradient(circle at 20% 20%, rgba(59,130,246,0.14), transparent 45%), radial-gradient(circle at 80% 80%, rgba(34,211,238,0.10), transparent 45%)',
      }}
    >
      <Box sx={{ position: 'absolute', top: 24, right: 24 }}>
        <ThemeToggle />
      </Box>

      <Container maxWidth="lg">
        <Stack direction={{ xs: 'column', md: 'row' }} alignItems="center" spacing={{ xs: 6, md: 10 }}>
          <Box sx={{ flex: 1, textAlign: { xs: 'center', md: 'left' } }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <Box
                sx={{
                  display: 'inline-flex',
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  borderRadius: 3,
                  p: 1.5,
                  mb: 3,
                }}
              >
                <Store size={36} />
              </Box>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
              <Typography variant="overline" color="primary" sx={{ letterSpacing: 2, fontWeight: 600 }}>
                JAVED ZAFFAR AND BROTHERS
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 800, mt: 0.5, letterSpacing: '-0.02em' }}>
                Welcome to <Box component="span" sx={{ color: 'primary.main' }}>Javed Zaffar and brothers</Box>
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ mt: 1.5, fontWeight: 400, maxWidth: 480, mx: { xs: 'auto', md: 0 } }}>
                Your complete business suite for customers, sales, inventory, cash, banks, and reports — all in one elegant dashboard.
              </Typography>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
              <Stack direction="row" spacing={3} sx={{ mt: 4, justifyContent: { xs: 'center', md: 'flex-start' } }}>
                {[
                  { icon: ShoppingBag, label: 'Sales & Inventory' },
                  { icon: TrendingUp, label: 'Live Reports' },
                  { icon: Wallet, label: 'Cash & Banks' },
                ].map((f) => (
                  <Stack key={f.label} direction="row" alignItems="center" spacing={1}>
                    <Box sx={{ color: 'primary.main', display: 'flex' }}><f.icon size={18} /></Box>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>{f.label}</Typography>
                  </Stack>
                ))}
              </Stack>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
              <Button
                variant="contained"
                size="large"
                endIcon={<ArrowRight size={20} />}
                onClick={() => navigate('/dashboard')}
                sx={{ mt: 5, borderRadius: 3, py: 1.5, px: 4, fontSize: 16, fontWeight: 600, boxShadow: '0 8px 24px rgba(37,99,235,0.3)' }}
              >
                Enter Shop
              </Button>
            </motion.div>
          </Box>

          <Box sx={{ flex: 1, display: { xs: 'none', md: 'block' } }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Box
                sx={{
                  position: 'relative',
                  borderRadius: 4,
                  p: 4,
                  bgcolor: 'background.paper',
                  boxShadow: '0 20px 60px rgba(15,23,42,0.12)',
                  overflow: 'hidden',
                }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    top: -40, right: -40,
                    width: 180, height: 180,
                    borderRadius: '50%',
                    bgcolor: 'rgba(37,99,235,0.08)',
                  }}
                />
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <Stack spacing={2}>
                    {[
                      { label: "Today's Sales", value: 'PKR 5,750', color: 'success.main' },
                      { label: 'Cash in Hand', value: 'PKR 25,750', color: 'primary.main' },
                      { label: 'Bank Balance', value: 'PKR 485,200', color: 'secondary.main' },
                      { label: 'Pending Receivables', value: 'PKR 26,800', color: 'warning.main' },
                    ].map((row, i) => (
                      <Box
                        key={row.label}
                        sx={{
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          p: 2, borderRadius: 2, bgcolor: 'action.hover',
                        }}
                      >
                        <Typography variant="body2" color="text.secondary">{row.label}</Typography>
                        <Typography sx={{ fontWeight: 700, color: row.color }}>{row.value}</Typography>
                      </Box>
                    ))}
                  </Stack>
                </motion.div>
              </Box>
            </motion.div>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}
