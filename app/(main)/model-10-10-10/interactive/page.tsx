'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import Timer from '@/components/common/Timer';
import { supabase } from '@/lib/supabase';
import { useUser } from '@/hooks/useUser';
import { useTranslation } from '@/hooks/useTranslation';
import { ArrowLeft, ChevronLeft, ChevronRight, BarChart3, AlertTriangle, CheckCircle2, XCircle, RotateCcw } from 'lucide-react';
import { PhaseOneSvg, PhaseTwoSvg, PhaseThreeSvg, StudentsSvg, ConfidenceSvg } from '@/components/model10-svg';

import { ease } from '@/lib/client/animation';

const ROOM_SESSION_ID = '00000000-0000-0000-0000-000000000000';
const TIMER_STATE_ID = 'model-10-10-10';

function UsersIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <circle cx="7" cy="6" r="3" stroke="currentColor" strokeWidth="1.3" />
      <circle cx="14" cy="7" r="2.5" stroke="currentColor" strokeWidth="1.2" opacity="0.6" />
      <path d="M1 17c0-3 2.5-5.5 5.5-5.5S12 14 12 17" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M12.5 17c0-2.5 1.8-4.5 4-5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
    </svg>
  )
}

function UserIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="7" r="4" stroke="currentColor" strokeWidth="1.3" />
      <path d="M2 18c0-4 3.5-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}

function HelpIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none">
      <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.1" />
      <path d="M5 5.2a2 2 0 012.8 1.4c0 .8-1 1.1-1.4 1.5-.2.2-.3.4-.3.7" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
      <circle cx="7" cy="10.5" r="0.6" fill="currentColor" />
    </svg>
  )
}

function HelpIconLg({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="9" r="8" stroke="currentColor" strokeWidth="1.3" />
      <path d="M6.5 6.8a2.5 2.5 0 013.5 1.8c0 1-1.2 1.3-1.7 1.8-.3.3-.4.5-.4.9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="9" cy="13.5" r="0.7" fill="currentColor" />
    </svg>
  )
}

export default function InteractivePage() {
  const { user, profile, isTeacher, isAdmin, loading: userLoading } = useUser();
  const { t } = useTranslation();
  const [phase, setPhase] = useState(1);
  const [helpRequests, setHelpRequests] = useState<any[]>([]);
  const [sessionPresence, setSessionPresence] = useState<any[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [phaseTransition, setPhaseTransition] = useState(false);
  const [transitionDirection, setTransitionDirection] = useState<'forward' | 'backward'>('forward');
  const [showInstructions, setShowInstructions] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [pausedElapsedMs, setPausedElapsedMs] = useState(0);
  const [activityStats, setActivityStats] = useState<{
    submissions_count: number;
    working_students_count: number;
    students_needing_help_count: number;
  } | null>(null);
  const [timerState, setTimerState] = useState<{
    id: string;
    is_running: boolean;
    started_at: string | null;
    phase: number;
    updated_at: string;
  } | null>(null);

  const isTeacherOrAdmin = isTeacher || isAdmin;

  useEffect(() => { const tm = setTimeout(() => setShowInstructions(false), 5000); return () => clearTimeout(tm); }, []);
  useEffect(() => { setIsMounted(true); }, []);

  useEffect(() => {
    if (!user || !profile) return;
    const upsertPresence = async () => {
      const { error } = await supabase.from('session_presence').upsert({
        session_id: ROOM_SESSION_ID, student_id: user.id,
        student_name: profile.full_name || user.email?.split('@')[0] || 'غير محدد',
        avatar_url: profile.avatar_url ?? null,
      }, { onConflict: 'session_id,student_id' });
      if (error) console.error('Error upserting presence:', error);
    };
    upsertPresence();
  }, [user, profile]);

  useEffect(() => {
    if (!user) return;
    const handleLeave = async () => {
      await supabase.from('session_presence').delete().eq('student_id', user.id).eq('session_id', ROOM_SESSION_ID);
    };
    window.addEventListener('beforeunload', handleLeave);
    return () => { window.removeEventListener('beforeunload', handleLeave); handleLeave(); };
  }, [user]);

  useEffect(() => {
    const fetchSessionPresence = async () => {
      const { data, error } = await supabase.from('session_presence').select('*').eq('session_id', ROOM_SESSION_ID);
      if (data && !error) setSessionPresence(data);
    };
    fetchSessionPresence();
    const channel = supabase.channel('session_presence_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'session_presence', filter: `session_id=eq.${ROOM_SESSION_ID}` }, () => fetchSessionPresence())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  useEffect(() => {
    const fetchHelpRequests = async () => {
      const { data, error } = await supabase.from('help_requests').select('*').eq('session_id', ROOM_SESSION_ID);
      if (data && !error) setHelpRequests(data);
    };
    fetchHelpRequests();
    const channel = supabase.channel('help_requests_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'help_requests', filter: `session_id=eq.${ROOM_SESSION_ID}` }, () => fetchHelpRequests())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  useEffect(() => {
    const fetchTimerState = async () => {
      const { data, error } = await supabase.from('timer_state').select('*').eq('id', TIMER_STATE_ID).maybeSingle();
      if (data && !error) setTimerState(data);
    };
    fetchTimerState();
    const channel = supabase.channel('timer')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'timer_state', filter: `id=eq.${TIMER_STATE_ID}` }, (payload) => {
        if (payload.new) setTimerState(payload.new as any);
      }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  useEffect(() => {
    const fetchActivityStats = async () => {
      const { data, error } = await supabase.from('activity_stats').select('*').eq('id', 'model-10-10-10').maybeSingle();
      if (error) setActivityStats({ submissions_count: 0, working_students_count: 0, students_needing_help_count: 0 });
      if (data && !error) setActivityStats({
        submissions_count: data.submissions_count || 0,
        working_students_count: data.working_students_count || 0,
        students_needing_help_count: data.students_needing_help_count || 0,
      });
    };
    fetchActivityStats();
    const channel = supabase.channel('activity_stats')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'activity_stats', filter: 'id=eq.model-10-10-10' }, (payload) => {
        if (payload.new) setActivityStats({
          submissions_count: (payload.new as any).submissions_count || 0,
          working_students_count: (payload.new as any).working_students_count || 0,
          students_needing_help_count: (payload.new as any).students_needing_help_count || 0,
        });
      }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  useEffect(() => { if (timerState?.phase && timerState.phase !== phase) setPhase(timerState.phase); }, [timerState?.phase]);

  const handleTimerStart = async () => {
    const now = new Date().toISOString();
    let elapsedMs = 0;
    if (timerState?.started_at) elapsedMs = Date.now() - new Date(timerState.started_at).getTime();
    if (!timerState?.is_running && pausedElapsedMs > 0) elapsedMs = pausedElapsedMs;
    const adjustedStartedAt = new Date(Date.now() - elapsedMs).toISOString();
    await supabase.from('timer_state').update({ is_running: true, started_at: adjustedStartedAt, updated_at: now }).eq('id', TIMER_STATE_ID);
  };

  const handleTimerPause = async () => {
    const now = new Date().toISOString();
    let elapsedMs = 0;
    if (timerState?.started_at) elapsedMs = Date.now() - new Date(timerState.started_at).getTime();
    setPausedElapsedMs(elapsedMs);
    await supabase.from('timer_state').update({ is_running: false, updated_at: now }).eq('id', TIMER_STATE_ID);
  };

  const handleTimerReset = async () => {
    const now = new Date().toISOString();
    setPausedElapsedMs(0);
    await supabase.from('timer_state').update({ is_running: false, started_at: null, phase: 1, updated_at: now }).eq('id', TIMER_STATE_ID);
  };

  const handleStartSession = async () => {
    await supabase.from('sessions').insert({ tool: 'model_10_10_10', is_active: true }).select().single();
    const now = new Date().toISOString();
    setPausedElapsedMs(0);
    await supabase.from('timer_state').upsert({ id: TIMER_STATE_ID, is_running: true, started_at: now, phase: 1, updated_at: now }, { onConflict: 'id' });
  };

  const handlePhaseComplete = async () => {
    setTransitionDirection('forward');
    setPhaseTransition(true);
    setTimeout(async () => {
      if (timerState && timerState.phase && timerState.phase < 3) {
        const newPhase = timerState.phase + 1;
        const now = new Date().toISOString();
        setPausedElapsedMs(0);
        await supabase.from('timer_state').update({ is_running: true, started_at: now, phase: newPhase, updated_at: now }).eq('id', TIMER_STATE_ID);
      } else {
        const now = new Date().toISOString();
        setPausedElapsedMs(0);
        await supabase.from('timer_state').update({ is_running: false, started_at: null, phase: 3, updated_at: now }).eq('id', TIMER_STATE_ID);
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 5000);
      }
      setPhaseTransition(false);
    }, 800);
  };

  const handlePreviousPhase = async () => {
    if (timerState?.phase && timerState.phase > 1) {
      setTransitionDirection('backward');
      setPhaseTransition(true);
      setTimeout(async () => {
        const newPhase = timerState.phase - 1;
        const now = new Date().toISOString();
        setPausedElapsedMs(0);
        await supabase.from('timer_state').update({ is_running: true, started_at: now, phase: newPhase, updated_at: now }).eq('id', TIMER_STATE_ID);
        setPhaseTransition(false);
      }, 800);
    }
  };

  const incrementSubmissions = async () => {
    if (!isTeacher && !isAdmin) return;
    const newValue = (activityStats?.submissions_count || 0) + 1;
    await supabase.from('activity_stats').upsert({ id: 'model-10-10-10', submissions_count: newValue, updated_at: new Date().toISOString() }, { onConflict: 'id' });
  };

  const decrementSubmissions = async () => {
    if (!isTeacher && !isAdmin) return;
    const newValue = Math.max((activityStats?.submissions_count || 0) - 1, 0);
    await supabase.from('activity_stats').upsert({ id: 'model-10-10-10', submissions_count: newValue, updated_at: new Date().toISOString() }, { onConflict: 'id' });
  };

  const incrementWorkingStudents = async () => {
    if (!isTeacher && !isAdmin) return;
    const newValue = (activityStats?.working_students_count || 0) + 1;
    await supabase.from('activity_stats').upsert({ id: 'model-10-10-10', working_students_count: newValue, updated_at: new Date().toISOString() }, { onConflict: 'id' });
  };

  const decrementWorkingStudents = async () => {
    if (!isTeacher && !isAdmin) return;
    const newValue = Math.max((activityStats?.working_students_count || 0) - 1, 0);
    await supabase.from('activity_stats').upsert({ id: 'model-10-10-10', working_students_count: newValue, updated_at: new Date().toISOString() }, { onConflict: 'id' });
  };

  const completedPercentage = (activityStats?.submissions_count || 0) > 0
    ? Math.round(((activityStats?.working_students_count || 0) / (activityStats?.submissions_count || 0)) * 100) : 0;

  const handleResetStudentHelp = async (studentId: string) => {
    const currentRecord = helpRequests.find(hr => hr.student_id === studentId);
    const currentCount = currentRecord?.count || 0;
    const { error } = await supabase.from('help_requests').update({ count: 0 }).eq('student_id', studentId).eq('session_id', ROOM_SESSION_ID);
    if (error) { console.error('Error resetting student help:', error); return; }
    if (currentCount > 0) {
      const now = new Date().toISOString();
      const { error: statsError } = await supabase.from('activity_stats').update({
        students_needing_help_count: Math.max(0, (activityStats?.students_needing_help_count || 0) - 1), updated_at: now,
      }).eq('id', 'model-10-10-10');
      if (statsError) console.error('Activity stats table not found, skipping update');
    }
  };

  const handleResetAllHelpRequests = async () => {
    const { error } = await supabase.from('help_requests').update({ count: 0 }).eq('session_id', ROOM_SESSION_ID);
    if (error) { console.error('Error resetting all help requests:', error); return; }
    const now = new Date().toISOString();
    const { error: statsError } = await supabase.from('activity_stats').update({ students_needing_help_count: 0, updated_at: now }).eq('id', 'model-10-10-10');
    if (statsError) console.error('Activity stats table not found, skipping update');
  };

  const myHelpRecord = helpRequests.find(hr => hr.student_id === user?.id);
  const myHelpCount = myHelpRecord?.count || 0;

  const handleRequestHelp = async () => {
    if (!user || !profile) return;
    const currentRecord = helpRequests.find(hr => hr.student_id === user.id);
    const currentCount = currentRecord?.count || 0;
    if (currentCount >= 4) return;
    const newCount = currentCount + 1;
    const { error } = await supabase.from('help_requests').upsert({
      session_id: ROOM_SESSION_ID, student_id: user.id,
      student_name: profile.full_name || user.email?.split('@')[0] || 'غير محدد', count: newCount,
    }, { onConflict: 'session_id,student_id' });
    if (error) { console.error('Error requesting help:', error); return; }
    const currentHelpCount = activityStats?.students_needing_help_count || 0;
    const { error: statsError } = await supabase.from('activity_stats').upsert({
      id: 'model-10-10-10', students_needing_help_count: currentHelpCount + 1, updated_at: new Date().toISOString()
    }, { onConflict: 'id' });
    if (statsError) console.error('Error updating help count:', JSON.stringify(statsError, null, 2));
    const studentName = profile.full_name || user.email?.split('@')[0] || 'غير محدد';
    await supabase.from('student_activity_log').insert({ student_id: user.id, student_name: studentName, action: 'طلب مساعدة في نموذج 10-10-10', model: 'model_10_10_10' });
    const { data: currentStats } = await supabase.from('student_stats').select('help_requests_count').eq('student_id', user.id).eq('model', 'model_10_10_10').maybeSingle();
    await supabase.from('student_stats').upsert({
      student_id: user.id, student_name: studentName, model: 'model_10_10_10',
      help_requests_count: (currentStats?.help_requests_count || 0) + 1,
      last_activity_at: new Date().toISOString()
    }, { onConflict: 'student_id,model' });
  };

  const getPhaseInfo = () => {
    switch (phase) {
      case 1: return {
        title: t('model101010.interactive.phase1.title'), color: '#4F46E5',
        gradient: 'linear-gradient(135deg, #312e81, #4F46E5)', Icon: PhaseOneSvg,
        rule: t('model101010.interactive.phase1.rule'),
        tips: [t('model101010.interactive.phase1.tip1'), t('model101010.interactive.phase1.tip2'), t('model101010.interactive.phase1.tip3')]
      };
      case 2: return {
        title: t('model101010.interactive.phase2.title'), color: '#2A9D8F',
        gradient: 'linear-gradient(135deg, #134e4a, #2A9D8F)', Icon: PhaseTwoSvg,
        rule: t('model101010.interactive.phase2.rule'),
        tips: [t('model101010.interactive.phase2.tip1'), t('model101010.interactive.phase2.tip2'), t('model101010.interactive.phase2.tip3')]
      };
      case 3: return {
        title: t('model101010.interactive.phase3.title'), color: '#F4A261',
        gradient: 'linear-gradient(135deg, #78350f, #F4A261)', Icon: PhaseThreeSvg,
        rule: t('model101010.interactive.phase3.rule'),
        tips: [t('model101010.interactive.phase3.tip1'), t('model101010.interactive.phase3.tip2'), t('model101010.interactive.phase3.tip3')]
      };
      default: return { title: '', color: '', gradient: '', Icon: PhaseOneSvg, rule: '', tips: [] };
    }
  };

  const currentPhase = getPhaseInfo();
  const totalHelpRequests = helpRequests.reduce((sum, hr) => sum + (hr.count || 0), 0);
  const uniqueStudentsWithHelp = new Set(helpRequests.map(hr => hr.student_id)).size;
  const phaseLabels = [t('model101010.phase1Phase'), t('model101010.phase2Phase'), t('model101010.phase3Phase')];
  const progressPct = Math.round((phase / 3) * 100);

  return (
    <div className="m10i-new">
      <div className="m10i-new-inner">

        {/* ── Back ── */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }} className="m10i-back2">
          <Link href="/model-10-10-10" className="m10i-back2-link">
            <ArrowLeft size={15} /> {t('nav.backToExplanation')}
          </Link>
        </motion.div>

        {/* ── TOP PROGRESS BAR ── */}
        <div className="m10i-topbar">
          <div className="m10i-topbar-track">
            <motion.div className="m10i-topbar-fill" animate={{ width: `${progressPct}%` }} transition={{ duration: 0.6, ease: 'easeOut' }} />
          </div>
          <div className="m10i-topbar-labels">
            {[1, 2, 3].map((p) => (
              <div key={p} className={`m10i-topbar-label ${phase >= p ? 'm10i-topbar-label--done' : ''} ${phase === p ? 'm10i-topbar-label--current' : ''}`}>
                <div className="m10i-topbar-num">{phase > p ? '✓' : p}</div>
                <span>{phaseLabels[p - 1]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── PHASE BANNER ── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={phase}
            className="m10i-banner"
            style={{ background: currentPhase.gradient }}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.4 }}
          >
            <div className="m10i-banner-glow" />
            <div className="m10i-banner-illust">
              <currentPhase.Icon size={64} color="rgba(255,255,255,0.15)" />
            </div>
            <div className="m10i-banner-content">
              <h1 className="m10i-banner-title">{currentPhase.title}</h1>
              <p className="m10i-banner-rule">{currentPhase.rule}</p>
              <div className="m10i-banner-tips">
                {currentPhase.tips.map((tip, i) => (
                  <motion.span key={i} className="m10i-banner-tip"
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.06 }}>
                    {tip}
                  </motion.span>
                ))}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* ── TRANSITION OVERLAY ── */}
        <AnimatePresence>
          {phaseTransition && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="m10i-overlay2">
              <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} className="m10i-overlay2-card">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8 }}>
                  <RotateCcw size={36} color="#6366F1" />
                </motion.div>
                <h3>{transitionDirection === 'forward' ? t('model101010.interactive.transitionForward') : t('model101010.interactive.transitionBackward')}</h3>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── INSTRUCTIONS TOAST ── */}
        <AnimatePresence>
          {showInstructions && (
            <motion.div initial={{ opacity: 0, x: 80 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 80 }}
              className="m10i-toast2" onClick={() => setShowInstructions(false)}>
              <HelpIconLg size={18} />
              <div>
                <div className="m10i-toast2-title">{t('model101010.interactive.quickTips')}</div>
                <div className="m10i-toast2-desc">{t('model101010.interactive.quickTipsDesc')}</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── TIMER + CONTROLS ROW ── */}
        <div className="m10i-main-row">
          <div className="m10i-timer-col">
            <Timer key={phase} duration={600} onComplete={handlePhaseComplete}
              label={`${currentPhase.title} — ${t('model101010.interactive.timerLabel')}`}
              isRunning={timerState?.is_running ?? false} startedAt={timerState?.started_at ?? null}
              onStart={handleTimerStart} onPause={handleTimerPause} onReset={handleTimerReset} isTeacherOrAdmin={isTeacherOrAdmin} />
          </div>

          {isTeacherOrAdmin && (
            <div className="m10i-controls2">
              <motion.button onClick={handlePhaseComplete} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="m10i-ctrl2 m10i-ctrl2--next">
                <ChevronLeft size={18} /> {t('model101010.interactive.next')}
              </motion.button>
              <motion.button onClick={handlePreviousPhase} disabled={phase === 1}
                whileHover={phase > 1 ? { scale: 1.03 } : {}} whileTap={phase > 1 ? { scale: 0.97 } : {}}
                className="m10i-ctrl2 m10i-ctrl2--prev" style={{ opacity: phase > 1 ? 1 : 0.35 }}>
                <ChevronRight size={18} /> {t('model101010.interactive.previous')}
              </motion.button>
              <motion.button onClick={handleResetAllHelpRequests} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="m10i-ctrl2 m10i-ctrl2--reset">
                <RotateCcw size={14} /> {t('model101010.interactive.resetCoupons')}
              </motion.button>
            </div>
          )}
        </div>

        {/* ── STUDENTS GRID ── */}
        <div className="m10i-room2-head">
          <UsersIcon size={20} />
          <h2>{t('model101010.interactive.roomTitle')}</h2>
          <span className="m10i-room2-count">{sessionPresence.length} {t('model101010.interactive.studentCount')}</span>
        </div>

        <div className="m10i-students2">
          {userLoading ? (
            <div className="m10i-empty2">{t('common.loading')}</div>
          ) : !user ? (
            <div className="m10i-empty2-card">
              <ConfidenceSvg size={56} color="#6366F1" />
              <h3>{t('model101010.interactive.loginToParticipate')}</h3>
              <Link href="/auth/login" className="m10i-login2">{t('nav.login')}</Link>
            </div>
          ) : sessionPresence.length === 0 ? (
            <div className="m10i-empty2-card">
              <StudentsSvg size={56} color="#6366F1" />
              <h3>{t('model101010.interactive.noStudents')}</h3>
              <p>{t('model101010.interactive.noStudentsDesc')}</p>
            </div>
          ) : (
            sessionPresence.map((sp) => {
              const helpRecord = helpRequests.find(hr => hr.student_id === sp.student_id);
              const helpCount = helpRecord?.count || 0;
              const isMyCard = sp.student_id === user?.id;
              const helpLevel = helpCount >= 4 ? 'danger' : helpCount > 0 ? 'warn' : 'ok';
              return (
                <motion.div key={sp.student_id}
                  className={`m10i-student2 m10i-student2--${helpLevel} ${isMyCard ? 'm10i-student2--mine' : ''}`}
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }} whileHover={{ y: -3 }}>
                  {isMyCard && <span className="m10i-you2">{t('common.you')}</span>}
                  <div className="m10i-avatar2">
                    {sp.avatar_url ? (
                      <img src={sp.avatar_url} alt="Avatar" className="m10i-avatar2-img" />
                    ) : (
                      <UserIcon size={22} />
                    )}
                  </div>
                  <div className="m10i-student2-info">
                    <h3 className="m10i-student2-name">{sp.student_name}</h3>
                    <div className={`m10i-help2 m10i-help2--${helpLevel}`}>
                      {helpCount >= 4 ? <XCircle size={12} /> : <HelpIcon size={12} />}
                      {helpCount} / 4
                    </div>
                  </div>
                  {isMyCard && !isTeacherOrAdmin && (
                    helpCount >= 4 ? (
                      <div className="m10i-student2-btn m10i-student2-btn--exhausted">{t('model101010.interactive.helpExhausted')}</div>
                    ) : (
                      <motion.button onClick={handleRequestHelp} whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}
                        className="m10i-student2-btn m10i-student2-btn--help">
                        <HelpIcon size={13} /> {t('model101010.interactive.requestHelp')}
                      </motion.button>
                    )
                  )}
                  {isTeacherOrAdmin && (
                    <motion.button onClick={() => handleResetStudentHelp(sp.student_id)} whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}
                      className="m10i-student2-btn m10i-student2-btn--renew">
                      <RotateCcw size={12} /> {t('model101010.interactive.renew')}
                    </motion.button>
                  )}
                </motion.div>
              )
            })
          )}
        </div>

        {/* ── STATS DASHBOARD ── */}
        {user && (
          <div className="m10i-dash">
            <div className="m10i-dash-head">
              <BarChart3 size={18} color="#6366F1" />
              <h3>{t('model101010.interactive.statsTitle')}</h3>
            </div>
            <div className="m10i-dash-grid">
              <div className="m10i-dash-card m10i-dash-card--help">
                <div className="m10i-dash-card-head">
                  <HelpIconLg size={20} />
                  <span>{t('model101010.interactive.stats.helpNeeded')}</span>
                </div>
                <div className="m10i-dash-val" style={{ color: '#E76F51' }}>{activityStats?.students_needing_help_count || 0}</div>
                <div className="m10i-dash-desc">{t('model101010.interactive.stats.helpNeededDesc')}</div>
              </div>
              <div className="m10i-dash-card m10i-dash-card--done">
                <div className="m10i-dash-card-head">
                  <CheckCircle2 size={20} />
                  <span>{t('model101010.interactive.stats.completed')}</span>
                </div>
                <div className="m10i-dash-val" style={{ color: '#2A9D8F' }}>{completedPercentage}%</div>
                <div className="m10i-dash-desc">{t('model101010.interactive.stats.completedDesc')}</div>
              </div>
              <div className="m10i-dash-card m10i-dash-card--work">
                <div className="m10i-dash-card-head">
                  <UsersIcon size={20} />
                  <span>{t('model101010.interactive.stats.working')}</span>
                </div>
                <div className="m10i-dash-val" style={{ color: '#F4A261' }}>{activityStats?.working_students_count || 0}</div>
                {isTeacherOrAdmin && (
                  <div className="m10i-dash-ctrl">
                    <button onClick={decrementWorkingStudents} className="m10i-dash-btn">-</button>
                    <input type="number" value={activityStats?.working_students_count || 0} min="0" className="m10i-dash-input"
                      onChange={async (e) => {
                        const v = parseInt(e.target.value) || 0;
                        await supabase.from('activity_stats').upsert({ id: 'model-10-10-10', working_students_count: v }, { onConflict: 'id' });
                      }} />
                    <button onClick={incrementWorkingStudents} className="m10i-dash-btn">+</button>
                  </div>
                )}
                <div className="m10i-dash-desc">{t('model101010.interactive.stats.workingDesc')}</div>
              </div>
              <div className="m10i-dash-card m10i-dash-card--sub">
                <div className="m10i-dash-card-head">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <rect x="3" y="3" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.3" />
                    <path d="M7 10L9 12L13 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>{t('model101010.interactive.stats.submissions')}</span>
                </div>
                <div className="m10i-dash-val" style={{ color: '#4F46E5' }}>{activityStats?.submissions_count || 0}</div>
                {isTeacherOrAdmin && (
                  <div className="m10i-dash-ctrl">
                    <button onClick={decrementSubmissions} className="m10i-dash-btn">-</button>
                    <input type="number" value={activityStats?.submissions_count || 0} min="0" className="m10i-dash-input"
                      onChange={async (e) => {
                        const v = parseInt(e.target.value) || 0;
                        await supabase.from('activity_stats').upsert({ id: 'model-10-10-10', submissions_count: v }, { onConflict: 'id' });
                      }} />
                    <button onClick={incrementSubmissions} className="m10i-dash-btn">+</button>
                  </div>
                )}
                <div className="m10i-dash-desc">{t('model101010.interactive.stats.submissionsDesc')}</div>
              </div>
            </div>

            {helpRequests.length > 0 && (
              <div className="m10i-reqs">
                <div className="m10i-reqs-head">
                  <AlertTriangle size={15} color="#F4A261" />
                  <h4>{t('model101010.interactive.stats.requestList')}</h4>
                </div>
                {helpRequests.map((hr) => (
                  <div key={hr.student_id} className="m10i-req-row">
                    <span className="m10i-req-name">{hr.student_name}</span>
                    <span className="m10i-req-count">{t('model101010.interactive.stats.requestCount', { count: hr.count })}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── CONFETTI ── */}
        <AnimatePresence>
          {showConfetti && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="m10i-confetti2">
              <motion.div initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.85, opacity: 0 }}
                transition={{ type: 'spring', damping: 20 }} className="m10i-confetti2-card">
                <motion.div animate={{ rotate: [0, 8, -8, 0], scale: [1, 1.15, 1] }} transition={{ duration: 0.5, repeat: 3 }}>
                  <CheckCircle2 size={56} color="#22C55E" />
                </motion.div>
                <h2>{t('model101010.interactive.confetti.title')}</h2>
                <p>{t('model101010.interactive.confetti.desc').split('<br/>').map((part: string, i: number) => i > 0 ? <><br key={i} />{part}</> : part)}</p>
                <Link href="/model-10-10-10" className="m10i-confetti2-btn">
                  <ArrowLeft size={18} /> {t('model101010.interactive.confetti.back')}
                </Link>
              </motion.div>
              {[...Array(40)].map((_, i) => (
                <motion.div key={i}
                  initial={{ x: '50%', y: '50%', scale: 0, rotate: 0 }}
                  animate={{ x: `${50 + (Math.random() - 0.5) * 180}%`, y: `${50 + (Math.random() - 0.5) * 100}%`, scale: 1, rotate: 360 * (Math.random() - 0.5) }}
                  transition={{ duration: 1, delay: Math.random() * 0.4 }}
                  style={{
                    position: 'absolute', width: 6 + Math.random() * 6, height: 6 + Math.random() * 6,
                    background: `hsl(${210 + Math.random() * 140}, 70%, ${50 + Math.random() * 15}%)`,
                    borderRadius: Math.random() > 0.5 ? '50%' : '2px', pointerEvents: 'none',
                  }}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  )
}
