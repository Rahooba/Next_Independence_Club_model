'use client'

import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import { stripEmoji } from '@/lib/client/utils';
import { ease } from '@/lib/client/animation';
import {
  Timer,
  Layers3,
  PanelsTopLeft,
  Sparkles,
  ArrowRight,
  Layers,
} from 'lucide-react';

const models = [
  {
    key: 'model101010',
    icon: Timer,
    color: '#1E3A5F',
    bg: 'rgba(30,58,95,0.08)',
    step: '01',
  },
  {
    key: 'supportLadder',
    icon: Layers3,
    color: '#2A9D8F',
    bg: 'rgba(42,157,143,0.08)',
    step: '02',
  },
  {
    key: 'silentCards',
    icon: PanelsTopLeft,
    color: '#E9C46A',
    bg: 'rgba(233,196,106,0.08)',
    step: '03',
  },
  {
    key: 'beautifulMistakes',
    icon: Sparkles,
    color: '#E76F51',
    bg: 'rgba(231,111,81,0.08)',
    step: '04',
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease },
  }),
};

export default function ModelsExplainerSection() {
  const { t } = useTranslation();

  return (
    <section className="explainer-v2">
      <div className="explainer-v2-inner">
        {/* Header */}
        <motion.div
          className="explainer-v2-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="explainer-v2-header-icon">
            <Layers size={22} strokeWidth={2} />
          </div>
          <h2 className="explainer-v2-title">{stripEmoji(t('home.section.title'))}</h2>
          <p className="explainer-v2-subtitle">{t('home.section.subtitle')}</p>
        </motion.div>

        {/* Flow diagram */}
        <div className="explainer-v2-flow">
          {/* Connecting line (desktop only) */}
          <div className="explainer-v2-line" aria-hidden="true">
            <svg width="100%" height="2" viewBox="0 0 1000 2" preserveAspectRatio="none">
              <line x1="0" y1="1" x2="1000" y2="1" stroke="var(--border)" strokeWidth="2" strokeDasharray="8 6" />
            </svg>
          </div>

          {models.map((model, i) => {
            const Icon = model.icon;
            return (
              <motion.div
                key={i}
                className="explainer-v2-node"
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-40px' }}
              >
                {/* Step connector */}
                <div className="explainer-v2-connector">
                  <motion.div
                    className="explainer-v2-step"
                    style={{ background: model.color }}
                    whileHover={{ scale: 1.1 }}
                  >
                    <span>{model.step}</span>
                  </motion.div>
                  {i < models.length - 1 && (
                    <motion.div
                      className="explainer-v2-arrow"
                      animate={{ x: [0, 4, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut', delay: i * 0.3 }}
                    >
                      <ArrowRight size={16} strokeWidth={2} />
                    </motion.div>
                  )}
                </div>

                {/* Card */}
                <motion.div
                  className="explainer-v2-card"
                  whileHover={{ y: -4, boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }}
                >
                  <div className="explainer-v2-card-icon" style={{ background: model.bg, color: model.color }}>
                    <Icon size={24} strokeWidth={1.8} />
                  </div>
                  <h3 className="explainer-v2-card-title">
                    {t(`home.tools.${model.key}.title` as any)}
                  </h3>
                  <p className="explainer-v2-card-subtitle" style={{ color: model.color }}>
                    {t(`home.tools.${model.key}.subtitle` as any)}
                  </p>
                  <p className="explainer-v2-card-desc">
                    {t(`home.tools.${model.key}.desc` as any)}
                  </p>
                </motion.div>
              </motion.div>
            );
          })}
        </div>

        {/* Summary */}
        <motion.div
          className="explainer-v2-summary"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
        >
          <div className="explainer-v2-summary-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4" />
              <path d="M12 8h.01" />
            </svg>
          </div>
          <p>
            {t('home.section.subtitle')}
          </p>
        </motion.div>
      </div>
    </section>
  );
}
