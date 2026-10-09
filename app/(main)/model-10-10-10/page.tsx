'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import { useUser } from '@/hooks/useUser';
import {
  ArrowRight, ArrowLeft, Sparkles, Clock, Zap, ShieldCheck,
  Timer, Monitor, Smartphone, MonitorCheck,
  ClipboardList, Users, Presentation,
  Ban, Target, GraduationCap,
  Brain, UserCheck, BellRing, Hand, MessageCircle, CheckSquare,
} from 'lucide-react';
import {
  SilentWorkSvg, PairWorkSvg, GroupDiscussSvg,
  StudentsSvg, TimerSvg,
  ConfidenceSvg, PhaseOneSvg, PhaseTwoSvg, PhaseThreeSvg,
} from '@/components/model10-svg';
import { ease, stagger, fadeUp, scaleUp } from '@/lib/client/animation';

function GridPatternSvg() {
  return (
    <svg className="m10-grid-bg" aria-hidden="true">
      <defs>
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.06" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />
    </svg>
  )
}

function FloatingDot({ x, y, size, delay }: { x: string; y: string; size: number; delay: number }) {
  return (
    <motion.div className="m10-float-dot"
      style={{ left: x, top: y, width: size, height: size }}
      animate={{ y: [-8, 8, -8], opacity: [0.15, 0.35, 0.15] }}
      transition={{ duration: 4 + delay, repeat: Infinity, ease: 'easeInOut', delay }}
    />
  )
}

export default function Model101010Page() {
  const { t } = useTranslation();
  const { profile } = useUser();
  const modelCtaLabel = profile?.role === 'student' ? t('nav.joinModelWithTeacher') : t('nav.useModelWithStudents');

  const phases = [
    {
      num: 1, accent: '#4F46E5', gradient: 'linear-gradient(135deg, #312e81, #4F46E5)',
      Illustration: PhaseOneSvg, IllustrationLg: SilentWorkSvg,
      title: t('model101010.phase1.title'), phase: t('model101010.phase1Phase'),
      rule: t('model101010.phase1.rule'), task: t('model101010.phase1.task'),
      teacherRole: t('model101010.phase1.teacherRole'), goal: t('model101010.phase1.goal'),
      metaIcon: ShieldCheck,
    },
    {
      num: 2, accent: '#2A9D8F', gradient: 'linear-gradient(135deg, #134e4a, #2A9D8F)',
      Illustration: PhaseTwoSvg, IllustrationLg: PairWorkSvg,
      title: t('model101010.phase2.title'), phase: t('model101010.phase2Phase'),
      rule: t('model101010.phase2.rule'), task: t('model101010.phase2.task'),
      teacherRole: t('model101010.phase2.teacherRole'), goal: t('model101010.phase2.goal'),
      metaIcon: Ban,
    },
    {
      num: 3, accent: '#F4A261', gradient: 'linear-gradient(135deg, #78350f, #F4A261)',
      Illustration: PhaseThreeSvg, IllustrationLg: GroupDiscussSvg,
      title: t('model101010.phase3.title'), phase: t('model101010.phase3Phase'),
      rule: t('model101010.phase3.rule'), task: t('model101010.phase3.task'),
      teacherRole: t('model101010.phase3.teacherRole'), goal: t('model101010.phase3.goal'),
      metaIcon: Target,
    },
  ];

  const benefits = [
    { Icon: UserCheck, title: t('model101010.impact.struggling.title'), desc: t('model101010.impact.struggling.desc'), accent: '#2A9D8F', gradient: 'linear-gradient(135deg, rgba(42,157,143,0.10), rgba(42,157,143,0.03))' },
    { Icon: Users, title: t('model101010.impact.shy.title'), desc: t('model101010.impact.shy.desc'), accent: '#F4A261', gradient: 'linear-gradient(135deg, rgba(244,162,97,0.10), rgba(244,162,97,0.03))' },
    { Icon: Brain, title: t('model101010.impact.gifted.title'), desc: t('model101010.impact.gifted.desc'), accent: '#E76F51', gradient: 'linear-gradient(135deg, rgba(231,111,81,0.10), rgba(231,111,81,0.03))' },
    { Icon: CheckSquare, title: t('model101010.impact.teacher.title'), desc: t('model101010.impact.teacher.desc'), accent: '#4F46E5', gradient: 'linear-gradient(135deg, rgba(79,70,229,0.10), rgba(79,70,229,0.03))' },
  ];

  const implItems = [
    { text: t('model101010.implementation.item1'), Icon: Timer },
    { text: t('model101010.implementation.item2'), Icon: BellRing },
    { text: t('model101010.implementation.item3'), Icon: Hand },
    { text: t('model101010.implementation.item4'), Icon: MessageCircle },
    { text: t('model101010.implementation.item5'), Icon: Presentation },
  ];

  const tools = [
    { text: t('model101010.tools.item1'), Icon: Timer },
    { text: t('model101010.tools.item2'), Icon: Monitor },
    { text: t('model101010.tools.item3'), Icon: Smartphone },
    { text: t('model101010.tools.item4'), Icon: MonitorCheck },
  ];

  return (
    <div className="m10-new">
      <GridPatternSvg />

      <FloatingDot x="5%" y="15%" size={80} delay={0} />
      <FloatingDot x="85%" y="25%" size={50} delay={1.2} />
      <FloatingDot x="15%" y="65%" size={60} delay={0.6} />
      <FloatingDot x="75%" y="80%" size={40} delay={2} />

      <div className="m10-new-inner">

     

        {/* ── HERO — Split layout ── */}
        <motion.section className="m10-hero2" variants={stagger} initial="hidden" animate="show">
          <div className="m10-hero2-left">
            <motion.div variants={fadeUp} className="m10-hero2-badge">
              <Sparkles size={13} /> {t('model101010.title')}
            </motion.div>
            <motion.h1 variants={fadeUp} className="m10-hero2-title">{t('model101010.title')}</motion.h1>
            <motion.p variants={fadeUp} className="m10-hero2-desc">{t('model101010.infoDesc')}</motion.p>
            <motion.div variants={fadeUp} className="m10-hero2-phases">
              {phases.map((p) => (
                <div key={p.num} className="m10-hero2-phase" style={{ borderColor: p.accent + '33' }}>
                  <div className="m10-hero2-phase-dot" style={{ background: p.accent }} />
                  <span>{p.phase}</span>
                </div>
              ))}
            </motion.div>
            <motion.div variants={fadeUp}>
              <Link href="/model-10-10-10/interactive" className="m10-hero2-cta">
                {modelCtaLabel} <ArrowRight size={16} />
              </Link>
            </motion.div>
          </div>

          <motion.div className="m10-hero2-right" variants={scaleUp}>
            <div className="m10-hero2-visual">
              <div className="m10-hero2-ring m10-hero2-ring--1" />
              <div className="m10-hero2-ring m10-hero2-ring--2" />
              <div className="m10-hero2-ring m10-hero2-ring--3" />
              <div className="m10-hero2-center">
                <TimerSvg size={100} color="#F4A261" />
              </div>
              <motion.div className="m10-hero2-orbit" style={{ animationDuration: '12s' }}>
                <div className="m10-hero2-orbit-item" style={{ background: '#4F46E5' }}><PhaseOneSvg size={28} color="#fff" /></div>
              </motion.div>
              <motion.div className="m10-hero2-orbit m10-hero2-orbit--2" style={{ animationDuration: '18s' }}>
                <div className="m10-hero2-orbit-item" style={{ background: '#2A9D8F' }}><PhaseTwoSvg size={28} color="#fff" /></div>
              </motion.div>
              <motion.div className="m10-hero2-orbit m10-hero2-orbit--3" style={{ animationDuration: '24s' }}>
                <div className="m10-hero2-orbit-item" style={{ background: '#F4A261' }}><PhaseThreeSvg size={28} color="#fff" /></div>
              </motion.div>
            </div>
          </motion.div>
        </motion.section>

        {/* ── PHASE CARDS — Premium bento grid ── */}
        <div className="m10-bento-label">
          <Clock size={16} />
          <span>{t('model101010.title')}</span>
        </div>

        <div className="m10-bento">
          {phases.map((p, i) => (
            <motion.div
              key={p.num}
              className="m10-bento-card"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6, delay: i * 0.12, ease }}
              whileHover={{ y: -6, boxShadow: `0 20px 48px ${p.accent}15` }}
            >
              {/* Gradient header */}
              <div className="m10-bento-header" style={{ background: p.gradient }}>
                <div className="m10-bento-header-num">0{p.num}</div>
                <div className="m10-bento-header-illust">
                  <p.Illustration size={56} color="rgba(255,255,255,0.85)" />
                </div>
              </div>

              <div className="m10-bento-body">
                <h3 className="m10-bento-title">{p.title}</h3>

                {/* Meta rows with lucide icons in circular containers */}
                <div className="m10-bento-meta">
                  <div className="m10-bento-meta-row">
                    <div className="m10-bento-meta-icon-circle" style={{ color: p.accent, background: p.accent + '10' }}>
                      <ShieldCheck size={14} strokeWidth={2} />
                    </div>
                    <div className="m10-bento-meta-text">
                      <span className="m10-bento-meta-label">{t('common.rule')}</span>
                      <span className="m10-bento-meta-val">{p.rule}</span>
                    </div>
                  </div>
                  <div className="m10-bento-meta-row">
                    <div className="m10-bento-meta-icon-circle" style={{ color: p.accent, background: p.accent + '10' }}>
                      <ClipboardList size={14} strokeWidth={2} />
                    </div>
                    <div className="m10-bento-meta-text">
                      <span className="m10-bento-meta-label">{t('common.task')}</span>
                      <span className="m10-bento-meta-val">{p.task}</span>
                    </div>
                  </div>
                  <div className="m10-bento-meta-row">
                    <div className="m10-bento-meta-icon-circle" style={{ color: p.accent, background: p.accent + '10' }}>
                      <GraduationCap size={14} strokeWidth={2} />
                    </div>
                    <div className="m10-bento-meta-text">
                      <span className="m10-bento-meta-label">{t('common.teacherRole')}</span>
                      <span className="m10-bento-meta-val">{p.teacherRole}</span>
                    </div>
                  </div>
                  <div className="m10-bento-meta-row">
                    <div className="m10-bento-meta-icon-circle" style={{ color: p.accent, background: p.accent + '10' }}>
                      <Target size={14} strokeWidth={2} />
                    </div>
                    <div className="m10-bento-meta-text">
                      <span className="m10-bento-meta-label">{t('common.goal')}</span>
                      <span className="m10-bento-meta-val">{p.goal}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Subtle background watermark */}
              <div className="m10-bento-watermark">
                <p.IllustrationLg size={100} color={p.accent} />
              </div>
            </motion.div>
          ))}
        </div>

        {/* ── BENEFITS — Premium gradient cards ── */}
        <div className="m10-impact-label">
          <Zap size={16} />
          <span>{t('model101010.impact.title')}</span>
        </div>
        <p className="m10-impact-sub">{t('model101010.impact.subtitle')}</p>

        <div className="m10-benefits">
          {benefits.map((b, i) => (
            <motion.div
              key={i}
              className="m10-benefits-card"
              style={{ background: b.gradient }}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: i * 0.08, ease }}
              whileHover={{ y: -8, boxShadow: `0 24px 48px ${b.accent}15` }}
            >
              <div className="m10-benefits-icon" style={{ color: b.accent, background: b.accent + '14' }}>
                <b.Icon size={26} strokeWidth={1.6} />
              </div>
              <h3 className="m10-benefits-title">{b.title}</h3>
              <p className="m10-benefits-desc">{b.desc}</p>
              <div className="m10-benefits-accent" style={{ background: b.accent }} />
            </motion.div>
          ))}
        </div>

        {/* ── CTA — Full-width band ── */}
        <motion.div
          className="m10-cta2"
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease }}
        >
          <div className="m10-cta2-bg" />
          <div className="m10-cta2-content">
            <h2>{modelCtaLabel}</h2>
            <p>{t('model101010.infoDesc')}</p>
            <Link href="/model-10-10-10/interactive" className="m10-cta2-btn">
              {modelCtaLabel} <ArrowRight size={16} />
            </Link>
          </div>
          <div className="m10-cta2-illust">
            <StudentsSvg size={120} color="rgba(255,255,255,0.15)" />
          </div>
        </motion.div>

        {/* ── IMPLEMENTATION — Premium checklist ── */}
        <div className="m10-impl2-wrap">
          <motion.div
            className="m10-impl2-head"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease }}
          >
            <ShieldCheck size={20} color="#22C55E" />
            <h3>{t('model101010.implementation.title')}</h3>
          </motion.div>

          <div className="m10-impl2">
            {implItems.map(({ text, Icon }, i) => (
              <motion.div
                key={i}
                className="m10-impl2-item"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.06, ease }}
                whileHover={{ x: 4 }}
              >
                <div className="m10-impl2-icon">
                  <Icon size={20} strokeWidth={1.8} />
                </div>
                <span className="m10-impl2-text">{text}</span>
                <div className="m10-impl2-check">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <circle cx="10" cy="10" r="9" stroke="#22C55E" strokeWidth="1.5" opacity="0.25" />
                    <path d="M7 10L9.5 12.5L13.5 7.5" stroke="#22C55E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ── TOOLS — Horizontal scroll chips ── */}
        <motion.div
          className="m10-tools2"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease }}
        >
          <div className="m10-tools2-head">
            <Zap size={16} color="#6366F1" />
            <h3>{t('model101010.tools.title')}</h3>
          </div>
          <div className="m10-tools2-row">
            {tools.map(({ text, Icon }, i) => (
              <motion.div
                key={i}
                className="m10-tools2-chip"
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                whileHover={{ y: -3, scale: 1.05 }}
              >
                <Icon size={18} strokeWidth={1.8} className="m10-tools2-chip-icon" />
                {text}
              </motion.div>
            ))}
          </div>
        </motion.div>

      </div>
    </div>
  )
}
