'use client'

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import {
  ArrowLeft, ArrowRight, MessageSquare, Eye, Hand,
  CircleCheck, CircleAlert, CircleX, Sparkles, Lightbulb,
  Shield, Users,
} from 'lucide-react';

const ease = [0.22, 1, 0.36, 1] as const;

const fadeUp = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } } as const;

export default function SilentCardsPage() {
  const { t } = useTranslation();

  const states = [
    {
      key: 'green', Icon: CircleCheck, color: '#22C55E',
      label: t('silentCards.green.label'),
      title: t('silentCards.green.title'),
      desc: t('silentCards.green.desc'),
    },
    {
      key: 'yellow', Icon: CircleAlert, color: '#EAB308',
      label: t('silentCards.yellow.label'),
      title: t('silentCards.yellow.title'),
      desc: t('silentCards.yellow.desc'),
    },
    {
      key: 'red', Icon: CircleX, color: '#EF4444',
      label: t('silentCards.red.label'),
      title: t('silentCards.red.title'),
      desc: t('silentCards.red.desc'),
    },
  ];

  return (
    <div className="sc-page">
      {/* ── Hero — Dark immersive with floating cards ── */}
      <section className="sc-hero">
        <div className="sc-hero-glow sc-hero-glow--amber" />
        <div className="sc-hero-glow sc-hero-glow--teal" />

        <div className="sc-hero-inner">
          <motion.div className="sc-hero-left" variants={stagger} initial="hidden" animate="show">
            <motion.div variants={fadeUp} className="sc-hero-badge">
              <MessageSquare size={13} /> {t('nav.silentCards')}
            </motion.div>

            <motion.h1 variants={fadeUp} className="sc-hero-title">
              {t('silentCards.hero.title').split(' ').slice(0, 2).join(' ')}{' '}
              <span>{t('silentCards.hero.title').split(' ').slice(2).join(' ')}</span>
            </motion.h1>

            <motion.p variants={fadeUp} className="sc-hero-desc">
              {t('silentCards.hero.subtitle')}
            </motion.p>

            <motion.div variants={fadeUp} className="sc-hero-actions">
              <Link href="/silent-cards/interactive" className="sc-hero-cta">
                {t('nav.useModelWithStudents')} <ArrowRight size={16} />
              </Link>
              <Link href="/home" className="sc-hero-ghost">
                <ArrowLeft size={16} /> {t('common.backToHome')}
              </Link>
            </motion.div>
          </motion.div>

          {/* Right — Floating card visualization */}
          <motion.div
            className="sc-hero-visual"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <motion.div
              className="sc-float-card sc-float-card--green"
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            >
              <div className="sc-float-card-icon" style={{ background: 'linear-gradient(135deg, #22C55E, #16A34A)' }}>
                <CircleCheck size={24} />
              </div>
              <span className="sc-float-card-label">{t('silentCards.green.label')}</span>
            </motion.div>

            <motion.div
              className="sc-float-card sc-float-card--yellow"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
            >
              <div className="sc-float-card-icon" style={{ background: 'linear-gradient(135deg, #EAB308, #CA8A04)' }}>
                <CircleAlert size={24} />
              </div>
              <span className="sc-float-card-label">{t('silentCards.yellow.label')}</span>
            </motion.div>

            <motion.div
              className="sc-float-card sc-float-card--red"
              animate={{ y: [0, -14, 0] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            >
              <div className="sc-float-card-icon" style={{ background: 'linear-gradient(135deg, #EF4444, #DC2626)' }}>
                <CircleX size={24} />
              </div>
              <span className="sc-float-card-label">{t('silentCards.red.label')}</span>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Main Content ── */}
      <div className="sc-main">

        {/* Section header */}
        <div className="sc-section-head">
          <div className="sc-section-icon" style={{ background: 'linear-gradient(135deg, #E9C46A, #D4A017)' }}>
            <Eye size={16} />
          </div>
          <h2 className="sc-section-title">{t('silentCards.hero.title')}</h2>
        </div>
        <p className="sc-section-sub">{t('silentCards.hero.subtitle')}</p>

        {/* Card States — Visual Identity */}
        <div className="sc-states-grid">
          {states.map((state, i) => (
            <motion.div
              key={state.key}
              className={`sc-state-card sc-state-card--${state.key}`}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: i * 0.1, ease }}
            >
              <div className="sc-state-icon">
                <state.Icon size={24} />
              </div>
              <span className="sc-state-badge">{state.label}</span>
              <h3 className="sc-state-title">{state.title}</h3>
              <p className="sc-state-desc">{state.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* CTA Section */}
        <motion.div
          className="sc-cta-section"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease }}
        >
          <div className="sc-cta-section-bg" />
          <div className="sc-cta-section-glow sc-cta-section-glow--1" />
          <div className="sc-cta-section-glow sc-cta-section-glow--2" />
          <div className="sc-cta-section-content">
            <h2 className="sc-cta-section-title">{t('nav.useModelWithStudents')}</h2>
            <p className="sc-cta-section-desc">{t('silentCards.hero.subtitle')}</p>
            <Link href="/silent-cards/interactive" className="sc-cta-section-btn">
              {t('nav.useModelWithStudents')} <ArrowRight size={16} />
            </Link>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
