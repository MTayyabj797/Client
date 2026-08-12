import { Box, Typography, Button, Stack } from '@mui/material';
import { motion } from 'framer-motion';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export default function ErrorState({ message = 'Failed to load data', onRetry }: ErrorStateProps) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}>
      <Stack alignItems="center" justifyContent="center" spacing={2} sx={{ py: 8, textAlign: 'center' }}>
        <Box sx={{ p: 2, bgcolor: 'error.main', borderRadius: '50%', opacity: 0.1 }}>
          <AlertCircle size={40} color="#dc2626" />
        </Box>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>Something went wrong</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{message}</Typography>
        </Box>
        {onRetry && (
          <Button variant="outlined" startIcon={<RefreshCw size={16} />} onClick={onRetry} sx={{ borderRadius: 2 }}>Retry</Button>
        )}
      </Stack>
    </motion.div>
  );
}
