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
  Zap,
  ArrowLeft,
} from 'lucide-react';

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease } },
};

const fadeRight = {
  hidden: { opacity: 0, x: -50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease } },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.8, ease } },
};

export default function HeroSection() {
  const { t } = useTranslation();
  const badge = stripEmoji(t('home.hero.badge'));

  return (
    <section className="hero-v2">
      {/* Grid pattern background */}
      <div className="hero-v2-grid-bg" aria-hidden="true" />

      {/* Large decorative circle */}
      <motion.div
        className="hero-v2-deco-circle"
        animate={{ rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
        aria-hidden="true"
      />

      {/* Floating accent dots */}
      <motion.div
        className="hero-v2-dot hero-v2-dot--1"
        animate={{ y: [0, -18, 0], opacity: [0.3, 0.7, 0.3] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        aria-hidden="true"
      />
      <motion.div
        className="hero-v2-dot hero-v2-dot--2"
        animate={{ y: [0, 14, 0], opacity: [0.2, 0.5, 0.2] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
        aria-hidden="true"
      />
      <motion.div
        className="hero-v2-dot hero-v2-dot--3"
        animate={{ x: [0, 10, 0], opacity: [0.25, 0.6, 0.25] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
        aria-hidden="true"
      />

      <div className="hero-v2-inner">
        {/* Left column: typography */}
        <motion.div
          className="hero-v2-text"
          variants={stagger}
          initial="hidden"
          animate="visible"
        >
          <motion.span className="hero-v2-badge" variants={fadeRight}>
            <Zap size={13} strokeWidth={2.5} />
            {badge}
          </motion.span>

          <motion.h1 className="hero-v2-title" variants={fadeUp}>
            {t('home.hero.title')}{' '}
            <span className="hero-v2-title-highlight">{t('home.hero.independenceClub')}</span>
          </motion.h1>

          <motion.p className="hero-v2-desc" variants={fadeUp}>
            {t('home.hero.subtitle')}
          </motion.p>

          <motion.div className="hero-v2-kpis" variants={fadeUp}>
            {[
              { v: stripEmoji(t('home.mvpModel')), icon: <Timer size={16} strokeWidth={2} /> },
              { v: stripEmoji(t('home.weeks')), icon: <Layers3 size={16} strokeWidth={2} /> },
              { v: stripEmoji(t('home.studentsCount')), icon: <PanelsTopLeft size={16} strokeWidth={2} /> },
            ].map((kpi, i) => (
              <div key={i} className="hero-v2-kpi">
                <span className="hero-v2-kpi-icon">{kpi.icon}</span>
                <span className="hero-v2-kpi-text">{kpi.v}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Right column: floating preview card */}
        <motion.div
          className="hero-v2-visual"
          variants={scaleIn}
          initial="hidden"
          animate="visible"
        >
          <div className="hero-v2-card">
            <div className="hero-v2-card-glow" aria-hidden="true" />
            <div className="hero-v2-card-header">
              <Sparkles size={20} strokeWidth={2} />
              <span>{stripEmoji(t('home.hero.independenceClub'))}</span>
            </div>
            {[
              { icon: <Timer size={18} />, label: stripEmoji(t('home.tools.model101010.title')), color: '#F4A261' },
              { icon: <Layers3 size={18} />, label: stripEmoji(t('home.tools.supportLadder.title')), color: '#2A9D8F' },
              { icon: <PanelsTopLeft size={18} />, label: stripEmoji(t('home.tools.silentCards.title')), color: '#E9C46A' },
              { icon: <Sparkles size={18} />, label: stripEmoji(t('home.tools.beautifulMistakes.title')), color: '#E76F51' },
            ].map((row, i) => (
              <motion.div
                key={i}
                className="hero-v2-card-row"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + i * 0.12, duration: 0.5 }}
              >
                <span className="hero-v2-card-row-dot" style={{ background: row.color }} />
                <span className="hero-v2-card-row-icon" style={{ color: row.color }}>{row.icon}</span>
                <span className="hero-v2-card-row-label">{row.label}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Curved divider */}
      <div className="hero-v2-curve" aria-hidden="true">
        <svg viewBox="0 0 1440 80" fill="none" preserveAspectRatio="none">
          <path d="M0 80V40C240 0 480 0 720 20C960 40 1200 60 1440 80H0Z" fill="var(--white)" />
        </svg>
      </div>
    </section>
  );
}
