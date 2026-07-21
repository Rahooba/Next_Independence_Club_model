'use client'

import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';

export default function FooterHome() {
  const { t } = useTranslation();

  return (
    <motion.footer
      className="footer-v2"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
    >
      <p>{t('footer.hpIdeaEgypt')}</p>
    </motion.footer>
  );
}
