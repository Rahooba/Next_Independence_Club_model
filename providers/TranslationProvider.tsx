'use client';

import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import type { Language, TranslationKey } from '@/lib/i18n/types';
import { getTranslation } from '@/lib/i18n/translations';

const STORAGE_KEY = 'app_language';

interface TranslationContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
  dir: 'rtl' | 'ltr';
}

const TranslationContext = createContext<TranslationContextType>({
  language: 'ar',
  setLanguage: () => {},
  t: (_key: string) => _key,
  dir: 'rtl',
});

function HtmlLangUpdater() {
  const { dir, language } = useTranslation();

  useEffect(() => {
    document.documentElement.dir = dir;
    document.documentElement.lang = language;
  }, [dir, language]);

  return null;
}

export function TranslationProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('ar');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem(STORAGE_KEY) as Language | null;
    if (stored === 'en' || stored === 'ar') {
      setLanguageState(stored);
    }
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(STORAGE_KEY, lang);
  }, []);

  const t = useCallback(
    (key: TranslationKey, params?: Record<string, string | number>): string => {
      let text = getTranslation(key, language);
      if (params) {
        Object.entries(params).forEach(([k, v]) => {
          text = text.replace(`{${k}}`, String(v));
        });
      }
      return text;
    },
    [language]
  );

  const dir = language === 'ar' ? 'rtl' : 'ltr';

  return (
    <TranslationContext.Provider value={{ language, setLanguage, t, dir }}>
      {children}
      {mounted && <HtmlLangUpdater />}
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
}
