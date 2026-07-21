'use client';

import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';

export default function LanguageSwitcher() {
  const { language, setLanguage } = useTranslation();

  const toggleLanguage = () => {
    setLanguage(language === 'ar' ? 'en' : 'ar');
  };

  return (
    <motion.button
      onClick={toggleLanguage}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      style={{
        background: language === 'en' ? '#F4A261' : '#1E3A5F',
        color: 'white',
        border: 'none',
        padding: '6px 14px',
        borderRadius: '20px',
        fontSize: '0.8rem',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        fontFamily: 'inherit',
      }}
      title={language === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'}
    >
      {language === 'ar' ? 'EN' : 'AR'}
    </motion.button>
  );
}
