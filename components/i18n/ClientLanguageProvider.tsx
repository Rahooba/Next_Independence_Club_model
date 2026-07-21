'use client';

import dynamic from 'next/dynamic';

const LanguageProvider = dynamic(() => import('@/components/i18n/LanguageProvider'), { ssr: false });

export default function ClientLanguageProvider({ children }: { children: React.ReactNode }) {
  return <LanguageProvider>{children}</LanguageProvider>;
}
