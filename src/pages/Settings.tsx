import { useState, useEffect } from 'react';
import { Box, Card, CardContent, Grid, Stack, Typography, TextField, Button, Switch, FormControlLabel, MenuItem, Divider, Avatar, useTheme, alpha } from '@mui/material';
import { motion } from 'framer-motion';
import {
  User, Store, Palette, Globe, Coins, Bell, DatabaseBackup, Camera, Save,
} from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import ErrorState from '@/components/ErrorState';
import { useThemeMode } from '@/contexts/ThemeContext';
import { useSettings, useUpdateSettings } from '@/hooks/useDashboard';

const sections = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'shop', label: 'Shop Information', icon: Store },
  { id: 'theme', label: 'Theme', icon: Palette },
  // { id: 'language', label: 'Language', icon: Globe },
  { id: 'currency', label: 'Currency', icon: Coins },
  // { id: 'notifications', label: 'Notifications', icon: Bell },
  // { id: 'backup', label: 'Backup', icon: DatabaseBackup },
];

export default function Settings() {
  const theme = useTheme();
  const { mode, toggleMode } = useThemeMode();
  const { data: settings, isLoading, isError, refetch } = useSettings();
  const updateMut = useUpdateSettings();
  const [active, setActive] = useState('profile');
  const [notif, setNotif] = useState({ email: true, sms: false, lowStock: true, daily: true });
  const [shopForm, setShopForm] = useState({ shop_name: '', phone: '', address: '', currency: 'PKR', language: 'en' });

  useEffect(() => {
    if (settings) {
      setShopForm({
        shop_name: settings.shop_name || '',
        phone: settings.phone || '',
        address: settings.address || '',
        currency: settings.currency || 'PKR',
        language: settings.language || 'en',
      });
    }
  }, [settings]);

  const handleSaveShop = () => {
    updateMut.mutate(shopForm);
  };

  const renderSection = () => {
    switch (active) {
      case 'profile':
        return (
          <Stack spacing={3}>
            {/* <Stack direction="row" spacing={2} alignItems="center">
              <Avatar sx={{ width: 72, height: 72, bgcolor: 'primary.main', fontSize: 26 }}>SA</Avatar>
              <Button variant="outlined" startIcon={<Camera size={16} />} sx={{ borderRadius: 2 }}>Change Photo</Button>
            </Stack> */}
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}><TextField fullWidth label="Full Name" defaultValue="Shop Admin" /></Grid>
              <Grid item xs={12} sm={6}><TextField fullWidth label="Email" defaultValue="admin@fertilizershop.local" /></Grid>
              <Grid item xs={12} sm={6}><TextField fullWidth label="Phone" defaultValue={shopForm.phone} /></Grid>
              <Grid item xs={12} sm={6}><TextField fullWidth label="Role" defaultValue="Owner" disabled /></Grid>
            </Grid>
            <Button variant="contained" startIcon={<Save size={18} />} sx={{ borderRadius: 2, alignSelf: 'flex-start' }}>Save Changes</Button>
          </Stack>
        );
      case 'shop':
        return (
          <Stack spacing={2.5}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}><TextField fullWidth label="Shop Name" value={shopForm.shop_name} onChange={(e) => setShopForm({ ...shopForm, shop_name: e.target.value })} /></Grid>
              <Grid item xs={12} sm={6}><TextField fullWidth label="Phone" value={shopForm.phone} onChange={(e) => setShopForm({ ...shopForm, phone: e.target.value })} /></Grid>
              <Grid item xs={12}><TextField fullWidth label="Address" value={shopForm.address} onChange={(e) => setShopForm({ ...shopForm, address: e.target.value })} /></Grid>
              <Grid item xs={12} sm={6}><TextField select fullWidth label="Currency" value={shopForm.currency} onChange={(e) => setShopForm({ ...shopForm, currency: e.target.value })}><MenuItem value="PKR">PKR - Pakistani Rupee</MenuItem><MenuItem value="USD">USD - US Dollar</MenuItem><MenuItem value="EUR">EUR - Euro</MenuItem><MenuItem value="SAR">SAR - Saudi Riyal</MenuItem></TextField></Grid>
              <Grid item xs={12} sm={6}><TextField select fullWidth label="Language" value={shopForm.language} onChange={(e) => setShopForm({ ...shopForm, language: e.target.value })}><MenuItem value="en">English</MenuItem><MenuItem value="ur">Urdu</MenuItem><MenuItem value="ar">Arabic</MenuItem></TextField></Grid>
            </Grid>
            <Button variant="contained" startIcon={<Save size={18} />} onClick={handleSaveShop} disabled={updateMut.isPending} sx={{ borderRadius: 2, alignSelf: 'flex-start' }}>{updateMut.isPending ? 'Saving…' : 'Save Shop Info'}</Button>
          </Stack>
        );
      case 'theme':
        return (
          <Stack spacing={2}>
            <Typography variant="body2" color="text.secondary">Choose your preferred appearance. Your selection is remembered across sessions.</Typography>
            <Grid container spacing={2}>
              {['light', 'dark'].map((m) => (
                <Grid item xs={6} sm={4} key={m}>
                  <Box onClick={() => { if ((m === 'light' && mode === 'dark') || (m === 'dark' && mode === 'light')) toggleMode(); }} sx={{ cursor: 'pointer', border: 2, borderColor: mode === m ? 'primary.main' : 'divider', borderRadius: 3, p: 2, transition: 'all 0.2s', '&:hover': { borderColor: 'primary.light' } }}>
                    <Box sx={{ height: 60, borderRadius: 2, mb: 1.5, bgcolor: m === 'light' ? '#f4f6fb' : '#0b1120', border: 1, borderColor: 'divider', display: 'flex', alignItems: 'flex-end', p: 1, gap: 0.5 }}>
                      <Box sx={{ width: 20, height: 8, borderRadius: 1, bgcolor: m === 'light' ? '#2563eb' : '#3b82f6' }} />
                      <Box sx={{ flex: 1, height: 8, borderRadius: 1, bgcolor: m === 'light' ? '#e2e8f0' : '#1e293b' }} />
                    </Box>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography sx={{ fontWeight: 600, textTransform: 'capitalize' }}>{m} Mode</Typography>
                      {mode === m && <Box sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: 'primary.main' }} />}
                    </Stack>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Stack>
        );
      case 'language':
        return (
          <Stack spacing={2}>
            <TextField select fullWidth label="Display Language" value={shopForm.language} onChange={(e) => setShopForm({ ...shopForm, language: e.target.value })} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}>
              {['English', 'Urdu', 'Arabic', 'Hindi'].map((l) => <MenuItem key={l} value={l.toLowerCase().slice(0, 2)}>{l}</MenuItem>)}
            </TextField>
            <Button variant="contained" startIcon={<Save size={18} />} onClick={handleSaveShop} sx={{ borderRadius: 2, alignSelf: 'flex-start' }}>Save Language</Button>
          </Stack>
        );
      case 'currency':
        return (
          <Stack spacing={2}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}><TextField select fullWidth label="Currency" value={shopForm.currency} onChange={(e) => setShopForm({ ...shopForm, currency: e.target.value })}><MenuItem value="PKR">PKR - Pakistani Rupee</MenuItem><MenuItem value="USD">USD - US Dollar</MenuItem><MenuItem value="EUR">EUR - Euro</MenuItem><MenuItem value="SAR">SAR - Saudi Riyal</MenuItem></TextField></Grid>
              <Grid item xs={12} sm={6}><TextField select fullWidth label="Date Format" defaultValue="DD-MM-YYYY"><MenuItem value="DD-MM-YYYY">DD-MM-YYYY</MenuItem><MenuItem value="MM-DD-YYYY">MM-DD-YYYY</MenuItem><MenuItem value="YYYY-MM-DD">YYYY-MM-DD</MenuItem></TextField></Grid>
            </Grid>
            <Button variant="contained" startIcon={<Save size={18} />} onClick={handleSaveShop} sx={{ borderRadius: 2, alignSelf: 'flex-start' }}>Save Settings</Button>
          </Stack>
        );
      case 'notifications':
        return (
          <Stack spacing={1}>
            <FormControlLabel control={<Switch checked={notif.email} onChange={(e) => setNotif({ ...notif, email: e.target.checked })} />} label="Email Notifications" />
            <FormControlLabel control={<Switch checked={notif.sms} onChange={(e) => setNotif({ ...notif, sms: e.target.checked })} />} label="SMS Notifications" />
            <FormControlLabel control={<Switch checked={notif.lowStock} onChange={(e) => setNotif({ ...notif, lowStock: e.target.checked })} />} label="Low Stock Alerts" />
            <FormControlLabel control={<Switch checked={notif.daily} onChange={(e) => setNotif({ ...notif, daily: e.target.checked })} />} label="Daily Summary Report" />
            <Button variant="contained" startIcon={<Save size={18} />} sx={{ borderRadius: 2, alignSelf: 'flex-start', mt: 2 }}>Save Preferences</Button>
          </Stack>
        );
      case 'backup':
        return (
          <Stack spacing={2}>
            <Card variant="outlined" sx={{ p: 3, textAlign: 'center', borderStyle: 'dashed' }}>
              <DatabaseBackup size={40} color="#94a3b8" style={{ margin: '0 auto 12px' }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>Cloud Backup</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 2 }}>Automatic daily backup of your business data. Connect a cloud storage to enable.</Typography>
              <Button variant="outlined" disabled sx={{ borderRadius: 2 }}>Connect Storage (Coming Soon)</Button>
            </Card>
            <Stack direction="row" spacing={1.5}>
              <Button variant="outlined" disabled sx={{ borderRadius: 2 }}>Download Backup</Button>
              <Button variant="outlined" disabled sx={{ borderRadius: 2 }}>Restore Backup</Button>
            </Stack>
          </Stack>
        );
      default:
        return null;
    }
  };

  if (isLoading) return (
    <Box>
      <PageHeader title="Settings" subtitle="Manage your profile, shop, and preferences" breadcrumbs={[{ label: 'Settings' }]} />
      <LoadingSkeleton rows={6} />
    </Box>
  );

  if (isError) return (
    <Box>
      <PageHeader title="Settings" subtitle="Manage your profile, shop, and preferences" breadcrumbs={[{ label: 'Settings' }]} />
      <ErrorState message="Failed to load settings" onRetry={() => refetch()} />
    </Box>
  );

  return (
    <Box>
      <PageHeader title="Settings" subtitle="Manage your profile, shop, and preferences" breadcrumbs={[{ label: 'Settings' }]} />

      <Grid container spacing={2.5}>
        <Grid item xs={12} md={3}>
          <Card sx={{ position: { md: 'sticky' }, top: 84 }}>
            <CardContent sx={{ p: 1.5 }}>
              <Stack spacing={0.5}>
                {sections.map((s) => {
                  const Icon = s.icon;
                  const isActive = active === s.id;
                  return (
                    <Box key={s.id} onClick={() => setActive(s.id)} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, borderRadius: 2, cursor: 'pointer', bgcolor: isActive ? 'action.selected' : 'transparent', color: isActive ? 'primary.main' : 'text.secondary', fontWeight: isActive ? 600 : 500, '&:hover': { bgcolor: 'action.hover' }, transition: 'all 0.15s' }}>
                      <Icon size={18} />
                      <Typography sx={{ fontSize: 14, fontWeight: 'inherit' }}>{s.label}</Typography>
                    </Box>
                  );
                })}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={9}>
          <motion.div key={active} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <Card>
              <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
                <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 3 }}>
                  {(() => { const s = sections.find((x) => x.id === active)!; const Icon = s.icon; return <Box sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main', borderRadius: 2, p: 1.25, display: 'flex' }}><Icon size={22} /></Box>; })()}
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>{sections.find((x) => x.id === active)?.label}</Typography>
                </Stack>
                <Divider sx={{ mb: 3 }} />
                {renderSection()}
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>
    </Box>
  );
}
