import { Card, CardContent, Stack, Typography, Box, useTheme } from '@mui/material';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  trend?: { value: string; positive: boolean };
  delay?: number;
}

const colorMap = {
  primary: { bg: 'rgba(37,99,235,0.10)', fg: '#2563eb' },
  secondary: { bg: 'rgba(8,145,178,0.10)', fg: '#0891b2' },
  success: { bg: 'rgba(22,163,74,0.10)', fg: '#16a34a' },
  warning: { bg: 'rgba(217,119,6,0.10)', fg: '#d97706' },
  error: { bg: 'rgba(220,38,38,0.10)', fg: '#dc2626' },
  info: { bg: 'rgba(99,102,241,0.10)', fg: '#6366f1' },
};

export default function StatCard({ title, value, icon: Icon, color = 'primary', trend, delay = 0 }: StatCardProps) {
  const theme = useTheme();
  const c = colorMap[color];
  const trendColor = trend?.positive ? theme.palette.success.main : theme.palette.error.main;

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay }}>
      <Card sx={{ height: '100%' }}>
        <CardContent sx={{ p: 2.5 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, mb: 1 }}>
                {title}
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, lineHeight: 1.2 }} noWrap>
                {value}
              </Typography>
              {trend && (
                <Typography variant="caption" sx={{ color: trendColor, fontWeight: 600, mt: 0.5, display: 'block' }}>
                  {trend.positive ? '▲' : '▼'} {trend.value}
                </Typography>
              )}
            </Box>
            <Box
              sx={{
                bgcolor: c.bg,
                color: c.fg,
                borderRadius: 2,
                p: 1.25,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Icon size={24} strokeWidth={2.2} />
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </motion.div>
  );
}
