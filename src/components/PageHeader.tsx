import { Breadcrumbs, Link, Typography, Stack, Box } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { ChevronRight, Hop as Home } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: { label: string; path?: string }[];
  action?: React.ReactNode;
}

export default function PageHeader({ title, subtitle, breadcrumbs = [], action }: PageHeaderProps) {
  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2} sx={{ mb: 3 }}>
      <Box>
        {breadcrumbs.length > 0 && (
          <Breadcrumbs separator={<ChevronRight size={14} />} sx={{ mb: 0.5 }}>
            <Link component={RouterLink} to="/dashboard" color="inherit" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontSize: 13, textDecoration: 'none', '&:hover': { color: 'primary.main' } }}>
              <Home size={14} />
            </Link>
            {breadcrumbs.map((bc, i) =>
              bc.path ? (
                <Link key={i} component={RouterLink} to={bc.path} color="inherit" sx={{ fontSize: 13, textDecoration: 'none', '&:hover': { color: 'primary.main' } }}>
                  {bc.label}
                </Link>
              ) : (
                <Typography key={i} color="text.primary" sx={{ fontSize: 13, fontWeight: 500 }}>
                  {bc.label}
                </Typography>
              )
            )}
          </Breadcrumbs>
        )}
        <Typography variant="h5" sx={{ fontWeight: 700 }}>{title}</Typography>
        {subtitle && <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{subtitle}</Typography>}
      </Box>
      {action && <Box>{action}</Box>}
    </Stack>
  );
}
