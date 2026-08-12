import { IconButton, Tooltip } from '@mui/material';
import { Sun, Moon } from 'lucide-react';
import { useThemeMode } from '@/contexts/ThemeContext';
import { motion } from 'framer-motion';

export default function ThemeToggle() {
  const { mode, toggleMode } = useThemeMode();
  return (
    <Tooltip title={mode === 'light' ? 'Switch to dark' : 'Switch to light'}>
      <IconButton onClick={toggleMode} sx={{ border: 1, borderColor: 'divider' }}>
        <motion.span key={mode} initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} transition={{ duration: 0.25 }} style={{ display: 'flex' }}>
          {mode === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </motion.span>
      </IconButton>
    </Tooltip>
  );
}
