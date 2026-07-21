'use client'

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import {
  ArrowLeft, ArrowRight, LifeBuoy, Zap, Clock,
  Lightbulb, BookOpen, Users, Search, GraduationCap,
  Printer, MessageCircle, Target, BarChart3, Trophy,
} from 'lucide-react';

const ease = [0.22, 1, 0.36, 1] as const;

const fadeUp = { hidden: { opacity: 0, y: 40 }, show: { opacity: 1, y: 0, transition: { duration: 0.7, ease } } };
const fadeRight = { hidden: { opacity: 0, x: 40 }, show: { opacity: 1, x: 0, transition: { duration: 0.7, ease } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };

export default function SupportLadderPage() {
  const { t } = useTranslation();
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);

  const steps = [
    {
      num: '01', Icon: Zap, title: t('supportLadder.step1.title'),
      description: t('supportLadder.step1.description'), color: '#4F46E5',
      tip: t('supportLadder.step1.tip'), time: t('supportLadder.step1.time'),
      longDesc: t('supportLadder.step1.longDesc'),
    },
    {
      num: '02', Icon: BookOpen, title: t('supportLadder.step2.title'),
      description: t('supportLadder.step2.description'), color: '#2A9D8F',
      tip: t('supportLadder.step2.tip'), time: t('supportLadder.step2.time'),
      longDesc: t('supportLadder.step2.longDesc'),
    },
    {
      num: '03', Icon: Users, title: t('supportLadder.step3.title'),
      description: t('supportLadder.step3.description'), color: '#E9C46A',
      tip: t('supportLadder.step3.tip'), time: t('supportLadder.step3.time'),
      longDesc: t('supportLadder.step3.longDesc'),
    },
    {
      num: '04', Icon: Search, title: t('supportLadder.step4.title'),
      description: t('supportLadder.step4.description'), color: '#F4A261',
      tip: t('supportLadder.step4.tip'), time: t('supportLadder.step4.time'),
      longDesc: t('supportLadder.step4.longDesc'),
    },
    {
      num: '05', Icon: GraduationCap, title: t('supportLadder.step5.title'),
      description: t('supportLadder.step5.description'), color: '#E76F51',
      tip: t('supportLadder.step5.tip'), time: t('supportLadder.step5.time'),
      longDesc: t('supportLadder.step5.longDesc'),
    },
  ];

  const tips = [
    { Icon: Printer, text: t('supportLadder.tips.item1'), color: '#4F46E5' },
    { Icon: MessageCircle, text: t('supportLadder.tips.item2'), color: '#2A9D8F' },
    { Icon: Lightbulb, text: t('supportLadder.tips.item3'), color: '#E9C46A' },
    { Icon: Target, text: t('supportLadder.tips.item4'), color: '#F4A261' },
    { Icon: BarChart3, text: t('supportLadder.tips.item5'), color: '#2A9D8F' },
    { Icon: Trophy, text: t('supportLadder.tips.item6'), color: '#E76F51' },
  ];

  return (
    <div className="sl-page">
      {/* Decorative Background */}
      <div className="sl-bg-deco">
        <div className="sl-bg-blob sl-bg-blob--1" />
        <div className="sl-bg-blob sl-bg-blob--2" />
        <div className="sl-bg-blob sl-bg-blob--3" />
        <div className="sl-bg-grid" />
      </div>

      {/* ── Hero — Split layout ── */}
      <section className="sl-hero">
        <div className="sl-hero-glow sl-hero-glow--teal" />
        <div className="sl-hero-glow sl-hero-glow--amber" />
        <div className="sl-hero-glow sl-hero-glow--indigo" />
        <div className="sl-hero-pattern" />

        <div className="sl-hero-inner">
          {/* Left — Content */}
          <motion.div className="sl-hero-left" variants={stagger} initial="hidden" animate="show">
            <motion.div variants={fadeUp} className="sl-hero-badge">
              <LifeBuoy size={13} /> {t('nav.supportLadder')}
            </motion.div>

            <motion.h1 variants={fadeUp} className="sl-hero-title">
              {t('supportLadder.hero.title').split(' ').slice(0, 2).join(' ')}{' '}
              <span>{t('supportLadder.hero.title').split(' ').slice(2).join(' ')}</span>
            </motion.h1>

            <motion.p variants={fadeUp} className="sl-hero-desc">
              {t('supportLadder.hero.subtitle')}
            </motion.p>

            <motion.div variants={fadeUp} className="sl-hero-actions">
              <Link href="/support-ladder/interactive" className="sl-hero-cta">
                {t('nav.useModelWithStudents')} <ArrowRight size={16} />
              </Link>
              <Link href="/home" className="sl-hero-ghost">
                <ArrowLeft size={16} /> {t('common.backToHome')}
              </Link>
            </motion.div>
          </motion.div>

          {/* Right — Ladder visualization */}
          <motion.div className="sl-hero-visual" variants={fadeRight} initial="hidden" animate="show">
            <div className="sl-ladder-vis">
              <div className="sl-ladder-vis-line" />
              {steps.map((s, i) => (
                <motion.div
                  key={i}
                  className="sl-ladder-vis-step"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.12, duration: 0.5, ease }}
                >
                  <div
                    className="sl-ladder-vis-dot"
                    style={{ background: `linear-gradient(135deg, ${s.color}, ${s.color}cc)` }}
                  >
                    <span className="sl-ladder-vis-dot-num">{s.num}</span>
                    <span className="sl-ladder-vis-dot-icon"><s.Icon size={16} strokeWidth={2} /></span>
                  </div>
                  <div className="sl-ladder-vis-label">{s.title}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Main Content ── */}
      <div className="sl-main">

        {/* Section header */}
        <div className="sl-section-head">
          <div className="sl-section-icon" style={{ background: 'linear-gradient(135deg, #4F46E5, #6366F1)' }}>
            <Zap size={18} />
          </div>
          <h2 className="sl-section-title">{t('supportLadder.hero.title')}</h2>
        </div>
        <p className="sl-section-sub">{t('supportLadder.hero.subtitle')}</p>

        {/* Staggered Steps Grid */}
        <div className="sl-steps-grid">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              className={`sl-step-card sl-step-card--${i + 1}`}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6, delay: i * 0.08, ease }}
              whileHover={{ y: -6 }}
              onClick={() => setActiveStep(activeStep === i ? null : i)}
              onMouseEnter={() => setHoveredStep(i)}
              onMouseLeave={() => setHoveredStep(null)}
            >
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: step.color }} />

              <div className="sl-step-card-head">
                <div className="sl-step-num" style={{ background: step.color }}>
                  {step.num}
                </div>
                <div>
                  <h3 className="sl-step-card-title">{step.title}</h3>
                </div>
              </div>

              <p className="sl-step-card-desc">{step.description}</p>

              <div className="sl-step-tags">
                <span className="sl-step-tag" style={{ color: step.color, background: step.color + '10' }}>
                  <Clock size={12} /> {step.time}
                </span>
                <AnimatePresence>
                  {hoveredStep === i && (
                    <motion.span
                      className="sl-step-tag"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      style={{ color: step.color, background: step.color + '10' }}
                    >
                      <Lightbulb size={12} /> {step.tip}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>

              <AnimatePresence>
                {activeStep === i && (
                  <motion.div
                    className="sl-step-expand"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {step.longDesc}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* CTA Section */}
        <motion.div
          className="sl-cta-section"
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease }}
        >
          <div className="sl-cta-section-bg" />
          <div className="sl-cta-section-glow sl-cta-section-glow--1" />
          <div className="sl-cta-section-glow sl-cta-section-glow--2" />
          <div className="sl-cta-section-content">
            <h2 className="sl-cta-section-title">{t('nav.useModelWithStudents')}</h2>
            <p className="sl-cta-section-desc">{t('supportLadder.hero.subtitle')}</p>
            <Link href="/support-ladder/interactive" className="sl-cta-section-btn">
              {t('nav.useModelWithStudents')} <ArrowRight size={16} />
            </Link>
          </div>
        </motion.div>

        {/* Tips Masonry */}
        <div className="sl-section-head">
          <div className="sl-section-icon" style={{ background: 'linear-gradient(135deg, #F4A261, #E76F51)' }}>
            <Lightbulb size={18} />
          </div>
          <h2 className="sl-section-title">{t('supportLadder.tips.title')}</h2>
        </div>

        <div className="sl-tips-masonry">
          {tips.map((tip, i) => (
            <motion.div
              key={i}
              className="sl-tip-m-card"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.06, ease }}
              whileHover={{ y: -4 }}
            >
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: tip.color }} />
              <div className="sl-tip-m-icon" style={{ background: tip.color }}>
                <tip.Icon size={20} strokeWidth={1.8} />
              </div>
              <p className="sl-tip-m-text">{tip.text}</p>
            </motion.div>
          ))}
        </div>

      </div>
    </div>
  );
}
