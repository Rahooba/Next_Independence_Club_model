'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import { supabase } from '@/lib/supabase';
import { useUser } from '@/hooks/useUser';
import {
  ArrowRight,
  Sparkles,
  Target,
  ClipboardList,
  MessageCircle,
  Trophy,
  Star,
  ThumbsUp,
  ThumbsDown,
  Shield,
  Send,
  CheckCircle2,
  ArrowLeft,
} from 'lucide-react';

const ease = [0.22, 1, 0.36, 1] as const;
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const fadeUp = { hidden: { opacity: 0, y: 40 }, show: { opacity: 1, y: 0, transition: { duration: 0.7, ease } } };
const scaleUp = { hidden: { opacity: 0, scale: 0.85 }, show: { opacity: 1, scale: 1, transition: { duration: 0.6, ease } } };

const stepIcons = [Target, ClipboardList, MessageCircle, Trophy];
const stepColors = ['#E76F51', '#E9C46A', '#2A9D8F', '#1E3A5F'];
const stepBgs = ['var(--bm-step-bg-1)', 'var(--bm-step-bg-2)', 'var(--bm-step-bg-3)', 'var(--bm-step-bg-4)'];

const BeautifulMistakes = () => {
  const { t, dir } = useTranslation();
  const { user, profile } = useUser();
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );
  const [surveySuccess, setSurveySuccess] = useState(false);

  const [q1Rating, setQ1Rating] = useState<number>(0);
  const [q2Benefited, setQ2Benefited] = useState<boolean | null>(null);
  const [q3FearLevel, setQ3FearLevel] = useState<number>(0);
  const [q4Comment, setQ4Comment] = useState<string>('');
  const [surveySubmitted, setSurveySubmitted] = useState<boolean>(false);
  const [surveyMessage, setSurveyMessage] = useState<string>('');
  const [surveyLoading, setSurveyLoading] = useState<boolean>(false);

  useEffect(() => {
    const onResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    if (user) {
      checkSurveySubmission();
    }
  }, [user]);

  const checkSurveySubmission = async () => {
    if (!user) return;
    const today = new Date().toISOString().split('T')[0];
    const { data } = await supabase
      .from('beautiful_mistakes_survey')
      .select('id')
      .eq('student_id', user.id)
      .eq('submitted_date', today)
      .maybeSingle();
    if (data) {
      setSurveySubmitted(true);
    }
  };

  const handleSurveySubmit = async () => {
    if (!user) {
      setSurveySuccess(false);
      setSurveyMessage(t('beautifulMistakes.survey.loginRequired'));
      return;
    }

    if (q1Rating === 0 || q2Benefited === null || q3FearLevel === 0) {
      setSurveySuccess(false);
      setSurveyMessage(t('beautifulMistakes.survey.requiredFields'));
      return;
    }

    setSurveyLoading(true);
    setSurveySuccess(false);
    setSurveyMessage('');

    const today = new Date().toISOString().split('T')[0];

    const { error } = await supabase
      .from('beautiful_mistakes_survey')
      .insert({
        student_id: user.id,
        student_name: profile?.full_name || user.email?.split('@')[0] || 'مجهول',
        q1_rating: q1Rating,
        q2_benefited: q2Benefited,
        q3_fear_level: q3FearLevel,
        q4_comment: q4Comment,
        submitted_date: today,
      });

    setSurveyLoading(false);

    if (error) {
      setSurveySuccess(false);
      if (error.code === '23505') {
        setSurveyMessage(t('beautifulMistakes.survey.alreadySubmitted'));
      } else {
        setSurveyMessage(t('beautifulMistakes.survey.error'));
      }
    } else {
      setSurveySubmitted(true);
      setSurveySuccess(true);
      setSurveyMessage(t('beautifulMistakes.survey.success'));
    }
  };

  const isMobile = windowWidth < 768;
  const isTablet = windowWidth >= 768 && windowWidth < 1024;

  const surveyProgress = ((q1Rating > 0 ? 1 : 0) + (q2Benefited !== null ? 1 : 0) + (q3FearLevel > 0 ? 1 : 0) + (q4Comment ? 1 : 0)) / 4;

  const steps = [
    {
      number: '01',
      icon: Target,
      title: t('beautifulMistakes.step1.title'),
      desc: t('beautifulMistakes.step1.desc'),
      color: stepColors[0],
      bg: stepBgs[0],
    },
    {
      number: '02',
      icon: ClipboardList,
      title: t('beautifulMistakes.step2.title'),
      desc: t('beautifulMistakes.step2.desc'),
      color: stepColors[1],
      bg: stepBgs[1],
    },
    {
      number: '03',
      icon: MessageCircle,
      title: t('beautifulMistakes.step3.title'),
      desc: t('beautifulMistakes.step3.desc'),
      color: stepColors[2],
      bg: stepBgs[2],
    },
    {
      number: '04',
      icon: Trophy,
      title: t('beautifulMistakes.step4.title'),
      desc: t('beautifulMistakes.step4.desc'),
      color: stepColors[3],
      bg: stepBgs[3],
    },
  ];

  return (
    <div className="bm-page" style={{ direction: dir }}>
      {/* Grid Background */}
      <svg className="bm-grid-bg" width="100%" height="100%">
        <defs>
          <pattern id="bm-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(0,0,0,0.03)" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#bm-grid)" />
      </svg>

      {/* Floating Dots */}
      {[
        { x: '8%', y: '15%', size: 80, color: '#E76F51', delay: 0 },
        { x: '85%', y: '25%', size: 60, color: '#2A9D8F', delay: 1.5 },
        { x: '12%', y: '65%', size: 50, color: '#F4A261', delay: 3 },
        { x: '78%', y: '75%', size: 70, color: '#1E3A5F', delay: 2 },
        { x: '50%', y: '10%', size: 40, color: '#E9C46A', delay: 4 },
      ].map((dot, i) => (
        <motion.div
          key={i}
          className="bm-float-dot"
          style={{ left: dot.x, top: dot.y, width: dot.size, height: dot.size, background: `radial-gradient(circle, ${dot.color}12, transparent)` }}
          animate={{ y: [-10, 10, -10], opacity: [0.15, 0.35, 0.15] }}
          transition={{ duration: 6, delay: dot.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}

      <div className="bm-inner">
        {/* Back */}
        <motion.div
          initial={{ opacity: 0, x: dir === 'rtl' ? 20 : -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease }}
          style={{ paddingTop: 20, marginBottom: -20 }}
        >
          <Link href="/home" className="bm-back">
            {dir === 'rtl' ? <ArrowRight size={14} strokeWidth={2} /> : <ArrowLeft size={14} strokeWidth={2} />}
            {t('common.backToHome')}
          </Link>
        </motion.div>

        {/* ─── HERO ─── */}
        <div className="bm-hero">
          <motion.div variants={stagger} initial="hidden" animate="show">
            <motion.div variants={fadeUp} className="bm-hero-badge">
              <Sparkles size={13} strokeWidth={2.5} />
              {t('beautifulMistakes.hero.title').substring(0, 20)}
            </motion.div>

            <motion.h1 variants={fadeUp} className="bm-hero-title">
              {t('beautifulMistakes.hero.title')}
            </motion.h1>

            <motion.p variants={fadeUp} className="bm-hero-desc">
              {t('beautifulMistakes.hero.subtitle')}
            </motion.p>

            <motion.div variants={fadeUp} className="bm-hero-phases">
              {['Learning', 'Growth', 'Reflection', 'Confidence'].map((label, i) => (
                <div key={label} className="bm-hero-phase">
                  <span className="bm-hero-phase-dot" style={{ background: stepColors[i] }} />
                  {label}
                </div>
              ))}
            </motion.div>

            <motion.div variants={fadeUp}>
              <Link href="/beautiful-mistakes/interactive" className="bm-hero-cta">
                {t('nav.useModelWithStudents')}
                {dir === 'rtl' ? <ArrowLeft size={16} strokeWidth={2.5} /> : <ArrowRight size={16} strokeWidth={2.5} />}
              </Link>
            </motion.div>
          </motion.div>

          {/* Visual */}
          <motion.div
            variants={scaleUp}
            initial="hidden"
            animate="show"
            className="bm-hero-visual"
          >
            <div className="bm-hero-visual-ring bm-hero-visual-ring--1" />
            <div className="bm-hero-visual-ring bm-hero-visual-ring--2" />
            <div className="bm-hero-visual-ring bm-hero-visual-ring--3" />

            <div className="bm-hero-visual-center">
              <Sparkles size={32} strokeWidth={1.5} />
            </div>

            {/* Orbit 1 */}
            <div className="bm-hero-orbit bm-hero-orbit--1">
              <div className="bm-hero-orbit-item bm-hero-orbit-item--top" style={{ background: '#E76F51' }}>
                <Target size={16} strokeWidth={2} />
              </div>
              <div className="bm-hero-orbit-item bm-hero-orbit-item--right" style={{ background: '#2A9D8F' }}>
                <MessageCircle size={16} strokeWidth={2} />
              </div>
            </div>

            {/* Orbit 2 */}
            <div className="bm-hero-orbit bm-hero-orbit--2">
              <div className="bm-hero-orbit-item bm-hero-orbit-item--bottom" style={{ background: '#F4A261' }}>
                <ClipboardList size={16} strokeWidth={2} />
              </div>
              <div className="bm-hero-orbit-item bm-hero-orbit-item--left" style={{ background: '#1E3A5F' }}>
                <Trophy size={16} strokeWidth={2} />
              </div>
            </div>

            {/* Orbit 3 */}
            <div className="bm-hero-orbit bm-hero-orbit--3">
              <div className="bm-hero-orbit-item bm-hero-orbit-item--top" style={{ background: '#E9C46A' }}>
                <Sparkles size={14} strokeWidth={2} />
              </div>
            </div>
          </motion.div>
        </div>

        {/* ─── HOW IT WORKS ─── */}
        <section className="bm-journey">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, ease }}
            className="bm-journey-head"
          >
            <div className="bm-section-label">
              <span>01</span> How It Works
            </div>
            <h2 className="bm-journey-title">{t('beautifulMistakes.hero.title')}</h2>
            <p className="bm-journey-sub">{t('beautifulMistakes.hero.subtitle')}</p>
          </motion.div>

          <div className="bm-journey-track">
            {!isMobile && <div className="bm-journey-connector" />}
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ delay: i * 0.1, duration: 0.5, ease }}
                  whileHover={{ y: -6 }}
                  className="bm-journey-step"
                >
                  <div
                    className="bm-journey-num"
                    style={{ background: `linear-gradient(135deg, ${step.color}, ${step.color}cc)`, borderColor: step.color }}
                  >
                    <Icon size={22} strokeWidth={2} />
                  </div>
                  <h3 className="bm-journey-step-title">{step.title}</h3>
                  <p className="bm-journey-step-desc">{step.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* ─── CTA BAND ─── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, ease }}
          className="bm-cta-band"
        >
          <div className="bm-cta-band-bg" />
          <div className="bm-cta-band-content">
            {/* if the data-theme is dark , the color will be white */}
            
            <h2 className="bm-cta-band-title">
  {t('beautifulMistakes.hero.title')}
</h2>

<p className="bm-cta-band-subtitle">
  {t('beautifulMistakes.hero.subtitle')}
</p>
            <Link href="/beautiful-mistakes/interactive" className="bm-cta-btn">
              {t('nav.useModelWithStudents')}
              {dir === 'rtl' ? <ArrowLeft size={16} strokeWidth={2.5} /> : <ArrowRight size={16} strokeWidth={2.5} />}
            </Link>
          </div>
          <div className="bm-cta-illust" />
        </motion.div>

        {/* ─── SURVEY ─── */}
        {user && (
          <section className="bm-survey">
            <div className="bm-survey-inner">
              {/* Left */}
              <motion.div
                initial={{ opacity: 0, x: dir === 'rtl' ? 30 : -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.6, ease }}
                className="bm-survey-left"
              >
                <div className="bm-section-label">
                  <span>02</span> Feedback
                </div>
                <h2>{t('beautifulMistakes.survey.title')}</h2>
                <p>{t('beautifulMistakes.hero.subtitle')}</p>

                <div className="bm-survey-trust">
                  <div className="bm-survey-trust-icon">
                    <Shield size={16} strokeWidth={2} />
                  </div>
                  <div className="bm-survey-trust-text">
                    Your feedback is anonymous and helps us improve the learning experience.
                  </div>
                </div>
              </motion.div>

              {/* Right - Survey Form */}
              <motion.div
                initial={{ opacity: 0, x: dir === 'rtl' ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.6, ease, delay: 0.1 }}
              >
                <div className="bm-survey-card">
                  {surveySubmitted ? (
                    <div className="bm-survey-success">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                        className="bm-survey-success-icon"
                      >
                        <CheckCircle2 size={32} strokeWidth={1.5} />
                      </motion.div>
                      <h3>{t('beautifulMistakes.survey.success')}</h3>
                      <p>Thank you for sharing your experience with us.</p>
                    </div>
                  ) : (
                    <>
                      {/* Progress */}
                      <div className="bm-survey-progress">
                        <div className="bm-survey-progress-bar">
                          <div className="bm-survey-progress-fill" style={{ width: `${surveyProgress * 100}%` }} />
                        </div>
                        <div className="bm-survey-progress-text">{Math.round(surveyProgress * 100)}%</div>
                      </div>

                      {/* Q1: Rating */}
                      <div className="bm-survey-q">
                        <label className="bm-survey-label">{t('beautifulMistakes.survey.q1')}</label>
                        <div className="bm-stars">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <motion.button
                              key={star}
                              type="button"
                              onClick={() => setQ1Rating(star)}
                              whileHover={{ scale: 1.2 }}
                              whileTap={{ scale: 0.9 }}
                              className={`bm-star ${q1Rating >= star ? 'bm-star--active' : ''}`}
                            >
                              <Star size={28} strokeWidth={1.5} fill={q1Rating >= star ? 'currentColor' : 'none'} />
                            </motion.button>
                          ))}
                        </div>
                      </div>

                      {/* Q2: Benefited */}
                      <div className="bm-survey-q">
                        <label className="bm-survey-label">{t('beautifulMistakes.survey.q2')}</label>
                        <div className="bm-segmented">
                          <motion.button
                            type="button"
                            onClick={() => setQ2Benefited(true)}
                            whileTap={{ scale: 0.97 }}
                            className={`bm-segmented-btn ${q2Benefited === true ? 'bm-segmented-btn--active' : ''}`}
                          >
                            <ThumbsUp size={16} strokeWidth={2} />
                            {t('beautifulMistakes.survey.yes')}
                          </motion.button>
                          <motion.button
                            type="button"
                            onClick={() => setQ2Benefited(false)}
                            whileTap={{ scale: 0.97 }}
                            className={`bm-segmented-btn ${q2Benefited === false ? 'bm-segmented-btn--active' : ''}`}
                          >
                            <ThumbsDown size={16} strokeWidth={2} />
                            {t('beautifulMistakes.survey.no')}
                          </motion.button>
                        </div>
                      </div>

                      {/* Q3: Fear Level */}
                      <div className="bm-survey-q">
                        <label className="bm-survey-label">{t('beautifulMistakes.survey.q3')}</label>
                        <div className="bm-chips">
                          {[1, 2, 3, 4, 5].map((level) => (
                            <motion.button
                              key={level}
                              type="button"
                              onClick={() => setQ3FearLevel(level)}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className={`bm-chip ${q3FearLevel === level ? 'bm-chip--active' : ''}`}
                            >
                              {level} {level === 1 ? t('beautifulMistakes.survey.notAfraid') : level === 5 ? t('beautifulMistakes.survey.veryAfraid') : ''}
                            </motion.button>
                          ))}
                        </div>
                      </div>

                      {/* Q4: Comment */}
                      <div className="bm-survey-q">
                        <label className="bm-survey-label">{t('beautifulMistakes.survey.q4')}</label>
                        <textarea
                          value={q4Comment}
                          dir={dir}
                          onChange={(e) => setQ4Comment(e.target.value)}
                          placeholder={t('beautifulMistakes.survey.placeholder')}
                          className="bm-textarea"
                        />
                      </div>

                      {/* Message */}
                      {surveyMessage && (
                        <div className={`bm-survey-msg ${surveySuccess ? 'bm-survey-msg--success' : 'bm-survey-msg--error'}`}>
                          {surveyMessage}
                        </div>
                      )}

                      {/* Submit */}
                      <motion.button
                        type="button"
                        onClick={handleSurveySubmit}
                        disabled={surveyLoading}
                        whileHover={{ scale: surveyLoading ? 1 : 1.01 }}
                        whileTap={{ scale: surveyLoading ? 1 : 0.98 }}
                        className="bm-submit"
                      >
                        {surveyLoading ? (
                          t('beautifulMistakes.survey.sending')
                        ) : (
                          <>
                            <Send size={16} strokeWidth={2} />
                            {t('beautifulMistakes.survey.submit')}
                          </>
                        )}
                      </motion.button>
                    </>
                  )}
                </div>
              </motion.div>
            </div>
          </section>
        )}
      </div>

      <style>{`* { box-sizing: border-box; } body { overflow-x: hidden; margin: 0; }`}</style>
    </div>
  );
};

export default function Page() {
  return <BeautifulMistakes />;
}
