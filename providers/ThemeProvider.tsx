'use client';

import { useState, useEffect, useCallback, createContext, useContext } from 'react';

export type Theme = 'light' | 'dark';

export interface ThemeTokens {
  bg: string;
  surface: string;
  card: string;
  sidebar: string;
  border: string;
  primary: string;
  primaryHover: string;
  primaryText: string;
  secondaryText: string;
  mutedText: string;
  hover: string;
  navActive: string;
  navActiveBg: string;
  shadow: string;
  chartBg: string;
  searchBg: string;
  searchBorder: string;
  searchFocusBorder: string;
  skeleton: string;
  codeBg: string;
  codeBorder: string;
  kpiBg: string;
  success: string;
  warning: string;
  danger: string;
  info: string;
}

const lightTokens: ThemeTokens = {
  bg: '#F8FAFC',
  surface: '#FFFFFF',
  card: '#FFFFFF',
  sidebar: '#FFFFFF',
  border: '#E2E8F0',
  primary: '#4F46E5',
  primaryHover: '#4338CA',
  primaryText: '#1E293B',
  secondaryText: '#64748B',
  mutedText: '#94A3B8',
  hover: '#F8FAFC',
  navActive: 'rgba(79,70,229,0.08)',
  navActiveBg: '#4F46E5',
  shadow: '0 1px 3px rgba(0,0,0,0.04)',
  chartBg: '#FFFFFF',
  searchBg: '#F8FAFC',
  searchBorder: '#E2E8F0',
  searchFocusBorder: '#4F46E5',
  skeleton: '#F1F5F9',
  codeBg: '#F1F5F9',
  codeBorder: '#E2E8F0',
  kpiBg: '#F8FAFC',
  success: '#16A34A',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#0EA5E9',
};

const darkTokens: ThemeTokens = {
  bg: '#0F172A',
  surface: '#111827',
  card: '#1E293B',
  sidebar: '#111827',
  border: '#334155',
  primary: '#6366F1',
  primaryHover: '#818CF8',
  primaryText: '#F8FAFC',
  secondaryText: '#CBD5E1',
  mutedText: '#94A3B8',
  hover: '#1E293B',
  navActive: 'rgba(99,102,241,0.15)',
  navActiveBg: '#6366F1',
  shadow: '0 1px 3px rgba(0,0,0,0.3)',
  chartBg: '#1E293B',
  searchBg: '#1E293B',
  searchBorder: '#334155',
  searchFocusBorder: '#6366F1',
  skeleton: '#334155',
  codeBg: '#1E293B',
  codeBorder: '#334155',
  kpiBg: '#1E293B',
  success: '#22C55E',
  warning: '#FACC15',
  danger: '#EF4444',
  info: '#38BDF8',
};

interface ThemeContextType {
  theme: Theme;
  tokens: ThemeTokens;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const STORAGE_KEY = 'app_theme';

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  tokens: lightTokens,
  toggleTheme: () => {},
  setTheme: () => {},
});

function getInitialTheme(): Theme {
  if (typeof document === 'undefined') return 'light';
  const attr = document.documentElement.getAttribute('data-theme');
  if (attr === 'dark') return 'dark';
  const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
  if (stored === 'dark' || stored === 'light') return stored;
  if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) return 'dark';
  return 'light';
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme());

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setThemeState(prev => prev === 'light' ? 'dark' : 'light');
  }, []);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
  }, []);

  const tokens = theme === 'dark' ? darkTokens : lightTokens;

  return (
    <ThemeContext.Provider value={{ theme, tokens, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
