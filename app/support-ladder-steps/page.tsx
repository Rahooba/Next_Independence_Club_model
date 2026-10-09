'use client'

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import { useUser } from '@/hooks/useUser';
import { trackStudentActivity } from '@/lib/client/tracking';
import { playSound } from '@/lib/client/sounds';
import { computeStepsByStudent } from '@/lib/client/ladderProgress';
import { BrText } from '@/components/i18n/BrText';
import { supabase } from '@/lib/supabase';

const SupportLadderSteps = () => {
  const { t, dir } = useTranslation();
  const { user, profile } = useUser();

  const steps = [
    {
      number: '01',
      icon: '💪',
      title: t('supportLadderSteps.step1.title'),
      description: t('supportLadderSteps.step1.desc'),
      tip: t('supportLadderSteps.step1.tip'),
      time: t('supportLadderSteps.step1.time'),
      longDescription: t('supportLadderSteps.step1.longDesc'),
      color: '#2A9D8F',
      gradient: 'linear-gradient(135deg, #2A9D8F 0%, #21867a 100%)',
      lightBg: '#E8F5F3',
    },
    {
      number: '02',
      icon: '📚',
      title: t('supportLadderSteps.step2.title'),
      description: t('supportLadderSteps.step2.desc'),
      tip: t('supportLadderSteps.step2.tip'),
      time: t('supportLadderSteps.step2.time'),
      longDescription: t('supportLadderSteps.step2.longDesc'),
      color: '#E9C46A',
      gradient: 'linear-gradient(135deg, #E9C46A 0%, #d4a832 100%)',
      lightBg: '#FEF9EA',
    },
    {
      number: '03',
      icon: '👥',
      title: t('supportLadderSteps.step3.title'),
      description: t('supportLadderSteps.step3.desc'),
      tip: t('supportLadderSteps.step3.tip'),
      time: t('supportLadderSteps.step3.time'),
      longDescription: t('supportLadderSteps.step3.longDesc'),
      color: '#F4A261',
      gradient: 'linear-gradient(135deg, #F4A261 0%, #E76F51 100%)',
      lightBg: '#FEF2EC',
    },
    {
      number: '04',
      icon: '🔍',
      title: t('supportLadderSteps.step4.title'),
      description: t('supportLadderSteps.step4.desc'),
      tip: t('supportLadderSteps.step4.tip'),
      time: t('supportLadderSteps.step4.time'),
      longDescription: t('supportLadderSteps.step4.longDesc'),
      color: '#E76F51',
      gradient: 'linear-gradient(135deg, #E76F51 0%, #c0533c 100%)',
      lightBg: '#FEEEEA',
    },
    {
      number: '05',
      icon: '👩‍🏫',
      title: t('supportLadderSteps.step5.title'),
      description: t('supportLadderSteps.step5.desc'),
      tip: t('supportLadderSteps.step5.tip'),
      time: t('supportLadderSteps.step5.time'),
      longDescription: t('supportLadderSteps.step5.longDesc'),
      color: '#1E3A5F',
      gradient: 'linear-gradient(135deg, #1E3A5F 0%, #2A5F8F 100%)',
      lightBg: '#EAF0F8',
    },
  ];

  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [checkedSteps, setCheckedSteps] = useState<number[]>([]);
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );
  const [celebrateAll, setCelebrateAll] = useState(false);
  const interacted = useRef(false); // الاحتفال بس بعد ما الطالب يضغط بنفسه

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (interacted.current && checkedSteps.length === steps.length) {
      setCelebrateAll(true);
      playSound('celebrate');
      const t = setTimeout(() => setCelebrateAll(false), 4000);
      return () => clearTimeout(t);
    }
  }, [checkedSteps]);

  // استرجاع تقدّم الطالب السابق علشان يطابق اللي المعلم شايفه
  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data, error } = await supabase
        .from('student_activity_log')
        .select('student_id, action, activity_time')
        .eq('student_id', user.id)
        .eq('model', 'support_ladder')
        .like('action', '%الخطوة%');
      if (error) { console.error('[steps] load progress failed:', error.message); return; }
      const done = computeStepsByStudent((data || []) as any).get(user.id);
      if (done && done.size) {
        setCheckedSteps(Array.from(done).map(n => n - 1).filter(i => i >= 0 && i < 5));
      }
    })();
  }, [user]);

  const isMobile = windowWidth < 768;

  // Save the finished step so the teacher can see it on the dashboard
  const logStepDone = async (index: number, undo = false) => {
    if (!user) return; // not logged in → nothing to record
    const name = profile?.full_name || user.email?.split('@')[0] || 'غير محدد';
    await trackStudentActivity({
      studentId: user.id, studentName: name, model: 'support_ladder',
      action: `${undo ? 'ألغى' : 'أنهى'} الخطوة ${steps[index].number} في سلم الدعم`,
    });
  };

  const toggleCheck = (index: number) => {
    const willCheck = !checkedSteps.includes(index);
    setCheckedSteps(prev =>
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
    interacted.current = true;
    if (willCheck) playSound('step');
    logStepDone(index, !willCheck);
  };

  const progress = Math.round((checkedSteps.length / steps.length) * 100);

  return (
    <div style={{
      minHeight: '100vh',
      background: '#F0F4F8',
      fontFamily: 'system-ui, sans-serif',
      overflowX: 'hidden',
      direction: 'rtl',
    }}>

      {/* ===== HERO ===== */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55 }}
        style={{
          background: 'linear-gradient(135deg, #1E3A5F 0%, #2A5F8F 100%)',
          borderRadius: isMobile ? '0 0 28px 28px' : '0 0 40px 40px',
          padding: isMobile ? '36px 20px 44px' : '52px 32px 64px',
          textAlign: 'center',
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          marginBottom: isMobile ? 24 : 40,
        }}
      >
        {/* Animated dot pattern */}
        <motion.div
          style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.06) 1.5px, transparent 1.5px)',
            backgroundSize: '28px 28px',
          }}
          animate={{ backgroundPosition: ['0px 0px', '28px 28px'] }}
          transition={{ duration: 16, repeat: Infinity, ease: 'linear' }}
        />

        <motion.div
          animate={{ y: [0, -10, 0], rotate: [0, 5, -5, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          style={{ fontSize: isMobile ? '3.5rem' : '5rem', marginBottom: 16, display: 'inline-block' }}
        >
          🪜
        </motion.div>

        <h1 style={{ fontSize: isMobile ? '1.6rem' : '2.6rem', fontWeight: 'bold', marginBottom: 10 }}>
          {t('supportLadderSteps.hero.title')}
        </h1>
        <p style={{ fontSize: isMobile ? '0.88rem' : '1rem', opacity: 0.9, maxWidth: 500, margin: '0 auto', lineHeight: 1.7 }}>
          <BrText text={t('supportLadderSteps.hero.subtitle')} />
        </p>

        {/* Progress bar */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          style={{ marginTop: 24, maxWidth: 320, margin: '24px auto 0' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '0.82rem', opacity: 0.85 }}>
            <span>{t('supportLadderSteps.hero.progress')}</span>
            <span>{checkedSteps.length}/{steps.length} {t('supportLadderSteps.hero.stepsCount')}</span>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 20, height: 10, overflow: 'hidden' }}>
            <motion.div
              animate={{ width: `${progress}%` }}
              transition={{ type: 'spring', stiffness: 70, damping: 14 }}
              style={{
                height: '100%',
                background: 'linear-gradient(90deg, #F4A261, #2A9D8F)',
                borderRadius: 20,
              }}
            />
          </div>
        </motion.div>
      </motion.div>

      {/* ===== STEPS ===== */}
      <div style={{ maxWidth: 720, margin: '0 auto', padding: isMobile ? '0 14px 50px' : '0 24px 70px' }}>

        {steps.map((step, index) => {
          const isActive = activeStep === index;
          const isChecked = checkedSteps.includes(index);

          return (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, type: 'spring', stiffness: 90, damping: 15 }}
              style={{
                display: 'flex',
                gap: isMobile ? 12 : 18,
                marginBottom: isMobile ? 16 : 20,
                position: 'relative',
              }}
            >
              {/* Left: number + connector */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => toggleCheck(index)}
                  animate={isChecked ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ duration: 0.35 }}
                  style={{
                    width: isMobile ? 46 : 56,
                    height: isMobile ? 46 : 56,
                    borderRadius: '50%',
                    background: isChecked ? step.gradient : 'white',
                    border: `2.5px solid ${isChecked ? 'transparent' : step.color}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: isChecked
                      ? `0 4px 14px ${step.color}55`
                      : '0 2px 8px rgba(0,0,0,0.08)',
                    transition: 'all 0.3s ease',
                    flexShrink: 0,
                    zIndex: 1,
                  }}
                >
                  <AnimatePresence mode="wait">
                    {isChecked ? (
                      <motion.span
                        key="check"
                        initial={{ scale: 0, rotate: -90 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0 }}
                        style={{ color: 'white', fontSize: isMobile ? '1.2rem' : '1.5rem', fontWeight: 'bold' }}
                      >
                        ✓
                      </motion.span>
                    ) : (
                      <motion.span
                        key="icon"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        style={{ fontSize: isMobile ? '1.1rem' : '1.4rem' }}
                      >
                        {step.icon}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Connector line */}
                {index < steps.length - 1 && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: isMobile ? 24 : 32 }}
                    transition={{ delay: index * 0.1 + 0.3, duration: 0.4 }}
                    style={{
                      width: 2.5,
                      background: isChecked
                        ? `linear-gradient(180deg, ${step.color}, ${steps[index + 1].color})`
                        : '#DDE5EF',
                      borderRadius: 2,
                      transition: 'background 0.4s ease',
                    }}
                  />
                )}
              </div>

              {/* Right: Card */}
              <motion.div
                layout
                onClick={() => setActiveStep(isActive ? null : index)}
                whileHover={{ y: -2, boxShadow: `0 8px 28px ${step.color}22` }}
                style={{
                  flex: 1,
                  background: isChecked ? step.lightBg : 'white',
                  borderRadius: isMobile ? 16 : 20,
                  padding: isMobile ? '14px 16px' : '20px 24px',
                  cursor: 'pointer',
                  boxShadow: isChecked
                    ? `0 4px 16px ${step.color}22`
                    : '0 2px 12px rgba(0,0,0,0.06)',
                  border: `1.5px solid ${isChecked ? step.color + '50' : 'transparent'}`,
                  transition: 'all 0.3s ease',
                  marginBottom: 2,
                }}
              >
                {/* Step header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <span style={{
                    fontSize: '0.72rem', fontWeight: '800',
                    color: step.color,
                    background: step.lightBg,
                    border: `1px solid ${step.color}30`,
                    padding: '2px 9px',
                    borderRadius: 20,
                    letterSpacing: '0.03em',
                  }}>
                    {t('supportLadderSteps.step')} {step.number}
                  </span>
                  <span style={{
                    fontSize: '0.75rem', color: '#9CA3AF',
                    background: '#F5F7FA',
                    padding: '2px 9px',
                    borderRadius: 20,
                  }}>
                    {step.time}
                  </span>
                  <motion.span
                    animate={{ rotate: isActive ? 180 : 0 }}
                    transition={{ duration: 0.25 }}
                    style={{ marginRight: 'auto', color: '#9CA3AF', fontSize: '0.9rem' }}
                  >
                    ▾
                  </motion.span>
                </div>

                <h3 style={{
                  fontSize: isMobile ? '1rem' : '1.15rem',
                  color: isChecked ? step.color : '#1E3A5F',
                  marginBottom: 6,
                  fontWeight: '700',
                  transition: 'color 0.3s',
                }}>
                  {step.title}
                </h3>

                <p style={{ color: '#64748B', fontSize: isMobile ? '0.83rem' : '0.9rem', lineHeight: 1.65, margin: 0 }}>
                  {step.description}
                </p>

                {/* Expandable long description */}
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      style={{ overflow: 'hidden' }}
                    >
                      <div style={{
                        marginTop: 14,
                        paddingTop: 14,
                        borderTop: `1.5px dashed ${step.color}50`,
                        color: '#475569',
                        fontSize: isMobile ? '0.83rem' : '0.9rem',
                        lineHeight: 1.7,
                      }}>
                        {step.longDescription}
                      </div>
                      <div style={{
                        marginTop: 10,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        background: step.lightBg,
                        color: step.color,
                        padding: '5px 13px',
                        borderRadius: 20,
                        fontSize: '0.8rem',
                        fontWeight: '600',
                      }}>
                        💡 {step.tip}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Check button */}
                <motion.button
                  onClick={(e) => { e.stopPropagation(); toggleCheck(index); }}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    marginTop: 14,
                    background: isChecked ? step.gradient : '#F5F7FA',
                    border: `1.5px solid ${isChecked ? 'transparent' : '#DDE5EF'}`,
                    color: isChecked ? 'white' : '#64748B',
                    padding: '7px 18px',
                    borderRadius: 25,
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '0.82rem',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  {isChecked ? t('supportLadderSteps.checkedLabel') : t('supportLadderSteps.checkLabel')}
                </motion.button>
              </motion.div>
            </motion.div>
          );
        })}

        {/* ===== CELEBRATE ALL ===== */}
        <AnimatePresence>
          {celebrateAll && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 30 }}
              transition={{ type: 'spring', stiffness: 100 }}
              style={{
                background: 'linear-gradient(135deg, #2A9D8F, #1E3A5F)',
                borderRadius: 24,
                padding: isMobile ? '24px 20px' : '32px 36px',
                textAlign: 'center',
                color: 'white',
                marginTop: 16,
                boxShadow: '0 12px 36px rgba(42,157,143,0.4)',
              }}
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.6, repeat: 3 }}
                style={{ fontSize: isMobile ? '3rem' : '4rem', marginBottom: 12 }}
              >
                🎉
              </motion.div>
              <h2 style={{ fontSize: isMobile ? '1.3rem' : '1.8rem', marginBottom: 8 }}>
                {t('supportLadderSteps.celebrate.title')}
              </h2>
              <p style={{ opacity: 0.9, fontSize: isMobile ? '0.88rem' : '1rem' }}>
                {t('supportLadderSteps.celebrate.desc')}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ===== CTA if not all done ===== */}
        {checkedSteps.length < steps.length && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            style={{
              background: 'white',
              borderRadius: 20,
              padding: isMobile ? '18px 16px' : '24px 28px',
              marginTop: 24,
              boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              flexWrap: 'wrap',
            }}
          >
            <span style={{ fontSize: '1.8rem' }}>💡</span>
            <div style={{ flex: 1, minWidth: 160 }}>
              <p style={{ color: '#1E3A5F', fontWeight: '700', margin: '0 0 4px', fontSize: isMobile ? '0.9rem' : '1rem' }}>
                {t('supportLadderSteps.reminder.title')}
              </p>
              <p style={{ color: '#64748B', margin: 0, fontSize: isMobile ? '0.8rem' : '0.88rem', lineHeight: 1.5 }}>
                {t('supportLadderSteps.reminder.desc')}
              </p>
            </div>
            <div style={{
              background: '#F0F4F8',
              borderRadius: 14,
              padding: '8px 16px',
              color: '#1E3A5F',
              fontWeight: '700',
              fontSize: isMobile ? '0.82rem' : '0.9rem',
              whiteSpace: 'nowrap',
            }}>
              {checkedSteps.length}/{steps.length} {t('supportLadderSteps.hero.stepsCount')} ✓
            </div>
          </motion.div>
        )}
      </div>

      <style>{`
        * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
        body { overflow-x: hidden; margin: 0; }
        ::-webkit-scrollbar { width: 7px; }
        ::-webkit-scrollbar-track { background: #F0F4F8; }
        ::-webkit-scrollbar-thumb { background: linear-gradient(135deg, #2A9D8F, #1E3A5F); border-radius: 4px; }
      `}</style>
    </div>
  );
};

export default function Page() {
  return <SupportLadderSteps />;
}
