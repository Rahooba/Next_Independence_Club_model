'use client'

import { useTranslation } from '@/hooks/useTranslation';

const Footer = () => {
  const { t } = useTranslation();
  return (
    <footer className="footer">
      <div className="container">
        <p>{t('footer.copyright')}</p>
        <p style={{ fontSize: '0.85rem', marginTop: '8px', opacity: 0.8 }}>
          {t('footer.description')}
        </p>
      </div>
    </footer>
  );
};

export default Footer;
