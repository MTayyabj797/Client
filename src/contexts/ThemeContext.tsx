import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme, CssBaseline } from '@mui/material';

type Mode = 'light' | 'dark';

interface ThemeContextValue {
  mode: Mode;
  toggleMode: () => void;
}

const ThemeModeContext = createContext<ThemeContextValue>({
  mode: 'light',
  toggleMode: () => {},
});

export const useThemeMode = () => useContext(ThemeModeContext);

const STORAGE_KEY = 'shop-ms-theme';

const getDesignTokens = (mode: Mode) => ({
  palette: {
    mode,
    primary: {
      main: mode === 'light' ? '#2563eb' : '#3b82f6',
      light: mode === 'light' ? '#60a5fa' : '#60a5fa',
      dark: mode === 'light' ? '#1d4ed8' : '#2563eb',
      contrastText: '#ffffff',
    },
    secondary: {
      main: mode === 'light' ? '#0891b2' : '#22d3ee',
      light: mode === 'light' ? '#67e8f9' : '#67e8f9',
      dark: mode === 'light' ? '#0e7490' : '#0891b2',
      contrastText: '#ffffff',
    },
    success: {
      main: '#16a34a',
      light: '#4ade80',
      dark: '#15803d',
      contrastText: '#ffffff',
    },
    warning: {
      main: '#d97706',
      light: '#fbbf24',
      dark: '#b45309',
      contrastText: '#ffffff',
    },
    error: {
      main: '#dc2626',
      light: '#f87171',
      dark: '#b91c1c',
      contrastText: '#ffffff',
    },
    background: {
      default: mode === 'light' ? '#f4f6fb' : '#0b1120',
      paper: mode === 'light' ? '#ffffff' : '#111827',
    },
    text: {
      primary: mode === 'light' ? '#0f172a' : '#e2e8f0',
      secondary: mode === 'light' ? '#64748b' : '#94a3b8',
    },
    divider: mode === 'light' ? '#e2e8f0' : '#1e293b',
    action: {
      hover: mode === 'light' ? 'rgba(15,23,42,0.06)' : 'rgba(148,163,184,0.08)',
      selected: mode === 'light' ? 'rgba(37,99,235,0.10)' : 'rgba(59,130,246,0.16)',
    },
  },
  shape: { borderRadius: 14 },
  typography: {
    fontFamily: "'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif",
    h4: { fontWeight: 700, letterSpacing: '-0.02em' },
    h5: { fontWeight: 700, letterSpacing: '-0.01em' },
    h6: { fontWeight: 600 },
    subtitle1: { fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
});

export function ThemeModeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<Mode>(() => {
    if (typeof window === 'undefined') return 'light';
    return (localStorage.getItem(STORAGE_KEY) as Mode) || 'light';
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, mode);
  }, [mode]);

  const toggleMode = () => setMode((prev) => (prev === 'light' ? 'dark' : 'light'));

  const theme = useMemo(() => {
    const tokens = getDesignTokens(mode);
    return createTheme({
      ...tokens,
      components: {
        MuiCssBaseline: {
          styleOverrides: {
            body: {
              scrollbarColor: mode === 'light' ? '#cbd5e1 transparent' : '#334155 transparent',
              '&::-webkit-scrollbar, & *::-webkit-scrollbar': { width: 8, height: 8 },
              '&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb': {
                backgroundColor: mode === 'light' ? '#cbd5e1' : '#334155',
                borderRadius: 8,
              },
            },
          },
        },
        MuiCard: {
          styleOverrides: {
            root: {
              backgroundImage: 'none',
              boxShadow:
                mode === 'light'
                  ? '0 1px 2px rgba(15,23,42,0.04), 0 4px 16px rgba(15,23,42,0.04)'
                  : '0 1px 2px rgba(0,0,0,0.3), 0 4px 16px rgba(0,0,0,0.25)',
            },
          },
        },
        MuiButton: { styleOverrides: { root: { borderRadius: 10 } } },
        MuiPaper: { styleOverrides: { root: { backgroundImage: 'none' } } },
        MuiTableCell: {
          styleOverrides: { root: { borderColor: mode === 'light' ? '#eef2f7' : '#1e293b' } },
        },
      },
    });
  }, [mode]);

  return (
    <ThemeModeContext.Provider value={{ mode, toggleMode }}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeModeContext.Provider>
  );
}
