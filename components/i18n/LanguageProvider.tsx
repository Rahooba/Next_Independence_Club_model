'use client';

import { TranslationProvider } from '@/providers/TranslationProvider';

export default function LanguageProvider({ children }: { children: React.ReactNode }) {
  return <TranslationProvider>{children}</TranslationProvider>;
}
