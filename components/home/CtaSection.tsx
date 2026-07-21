'use client'

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import { stripEmoji } from '@/lib/client/utils';
import { Rocket, ArrowLeft } from 'lucide-react';

export default function CtaSection() {
  const { t } = useTranslation();

  return (
    <section className="cta-v2">
      {/* Background decorative SVG */}
      <div className="cta-v2-deco" aria-hidden="true">
        <svg viewBox="0 0 600 600" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="300" cy="300" r="250" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
          <circle cx="300" cy="300" r="180" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
          <circle cx="300" cy="300" r="110" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
          <line x1="300" y1="50" x2="300" y2="550" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
          <line x1="50" y1="300" x2="550" y2="300" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
        </svg>
      </div>

      <div className="cta-v2-inner">
        <motion.div
          className="cta-v2-content"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          viewport={{ once: true, margin: '-80px' }}
        >
          <motion.div
            className="cta-v2-icon"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Rocket size={32} strokeWidth={1.6} />
          </motion.div>

          <h2 className="cta-v2-title">{t('home.cta.title')}</h2>
          <p className="cta-v2-desc">{t('home.cta.description')}</p>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}>
            <Link href="/model-10-10-10" className="cta-v2-btn">
              <span>{stripEmoji(t('home.cta.button'))}</span>
              <ArrowLeft size={18} strokeWidth={2.5} />
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
