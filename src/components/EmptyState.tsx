import { Stack, Typography, Button, Box } from '@mui/material';
import { motion } from 'framer-motion';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({ title = 'No data yet', message = 'When records are added they will appear here.', actionLabel, onAction }: EmptyStateProps) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}>
      <Stack alignItems="center" justifyContent="center" spacing={2} sx={{ py: 8, textAlign: 'center' }}>
        <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: '50%' }}>
          <Inbox size={40} color="#94a3b8" />
        </Box>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>{title}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{message}</Typography>
        </Box>
        {actionLabel && onAction && (
          <Button variant="contained" onClick={onAction} sx={{ borderRadius: 2, mt: 1 }}>{actionLabel}</Button>
        )}
      </Stack>
    </motion.div>
  );
}
