import { useState } from 'react';
import { Box, Button, TextField, Typography, Stack, InputAdornment, IconButton, Link, Divider, Alert } from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Store, Lock, Mail, Eye, EyeOff, ArrowRight, KeyRound } from 'lucide-react';
import { useThemeMode } from '@/contexts/ThemeContext';
import ThemeToggle from '@/components/ThemeToggle';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';
import { getErrorMessage } from '@/utils/error';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { mode } = useThemeMode();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await login({ email, password });
      toast.success('Login successful');
      navigate('/dashboard');
    } catch (err) {
      const msg = getErrorMessage(err, 'Invalid email or password');
      setError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
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

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Box
          sx={{
            width: { xs: 360, sm: 420 },
            bgcolor: 'background.paper',
            borderRadius: 4,
            p: 4,
            boxShadow: '0 20px 60px rgba(15,23,42,0.12)',
          }}
        >
          <Stack alignItems="center" spacing={1.5} sx={{ mb: 4 }}>
            <Box sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', borderRadius: 3, p: 1.5, display: 'flex' }}>
              <Store size={36} />
            </Box>
            <Typography variant="overline" color="primary" sx={{ letterSpacing: 2, fontWeight: 600 }}>
              SHOP MANAGEMENT SYSTEM
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
              Welcome Back
            </Typography>
            <Typography variant="body2" color="text.secondary">Sign in to your account to continue</Typography>
          </Stack>

          {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

          <form onSubmit={handleSubmit}>
            <Stack spacing={2.5}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><Mail size={18} /></InputAdornment>,
                }}
              />
              <TextField
                fullWidth
                label="Password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><Lock size={18} /></InputAdornment>,
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword((p) => !p)} edge="end">
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              {/* <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Link href="#" onClick={(e) => { e.preventDefault(); toast('Please contact your administrator to reset your password.', { icon: '🔑' }); }} sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontSize: 13, textDecoration: 'none', cursor: 'pointer' }}>
                  <KeyRound size={14} /> Forgot password?
                </Link>
              </Box> */}

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={submitting}
                endIcon={<ArrowRight size={20} />}
                sx={{ borderRadius: 3, py: 1.5, fontSize: 16, fontWeight: 600, boxShadow: '0 8px 24px rgba(37,99,235,0.3)' }}
              >
                {submitting ? 'Signing in…' : 'Sign In'}
              </Button>
            </Stack>
          </form>

          <Divider sx={{ my: 3 }} />
          <Box sx={{ textAlign: 'center' }}>
            {/* <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>Demo Credentials</Typography> */}
            {/* <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: 12 }}>
              admin@fertilizershop.local / Admin@12345
            </Typography> */}
          </Box>
        </Box>
      </motion.div>
    </Box>
  );
}
