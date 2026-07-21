'use client';

import dynamic from 'next/dynamic';

const ThemeProvider = dynamic(() => import('@/providers/ThemeProvider').then(m => ({ default: m.ThemeProvider })), { ssr: false });

export default function ClientThemeProvider({ children }: { children: React.ReactNode }) {
  return <ThemeProvider>{children}</ThemeProvider>;
}
