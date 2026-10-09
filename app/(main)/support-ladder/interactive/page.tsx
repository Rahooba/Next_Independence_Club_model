'use client'

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useUser } from '@/hooks/useUser';
import { useTranslation } from '@/hooks/useTranslation';
import { trackStudentActivity } from '@/lib/client/tracking';
import { BrText } from '@/components/i18n/BrText';
import { playSound, unlockAudio } from '@/lib/client/sounds';
import { computeStepsByStudent, TOTAL_LADDER_STEPS } from '@/lib/client/ladderProgress';
import {
  ArrowLeft, LifeBuoy, QrCode, Smartphone,
  Copy, Download, UserRound, Ticket, RefreshCcw,
  Trash2, Lock, CheckCircle, Bell, BellRing,
} from 'lucide-react';

const QR_PAGE_PATH = '/support-ladder-steps';
const ease = [0.22, 1, 0.36, 1] as const;

export default function SupportLadderInteractivePage() {
  const { user, profile, loading: userLoading } = useUser();
  const { t, dir } = useTranslation();
  const [helpCoupons, setHelpCoupons] = useState<any[]>([]);
  const [couponLogs, setCouponLogs] = useState<any[]>([]);
  const [showQR, setShowQR] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const locale = dir === 'rtl' ? 'ar-SA' : 'en-US';

  useEffect(() => { setIsMounted(true); }, []);

  // ── تقدّم الخطوات + إشعارات صوتية للمعلم ──
  const [stepsByStudent, setStepsByStudent] = useState<Map<string, Set<number>>>(new Map());
  const [toasts, setToasts] = useState<{ id: number; text: string; kind: 'step' | 'coupon' }[]>([]);
  const [soundOn, setSoundOn] = useState(false);
  const roleRef = useRef<string | undefined>(undefined);
  const toastId = useRef(0);
  useEffect(() => { roleRef.current = profile?.role; }, [profile?.role]);

  const pushToast = (text: string, kind: 'step' | 'coupon') => {
    const id = ++toastId.current;
    setToasts(prev => [...prev.slice(-3), { id, text, kind }]);
    setTimeout(() => setToasts(prev => prev.filter(x => x.id !== id)), 5000);
  };

  const enableSound = () => {
    unlockAudio();
    setSoundOn(true);
    playSound('notify');
  };

  // أول لمسة في الصفحة تفتح الصوت تلقائياً (المتصفح بيمنعه قبل كده)
  useEffect(() => {
    if (profile?.role !== 'teacher') return;
    const unlock = () => { if (unlockAudio()) setSoundOn(true); };
    window.addEventListener('pointerdown', unlock, { once: true });
    return () => window.removeEventListener('pointerdown', unlock);
  }, [profile?.role]);

  useEffect(() => {
    if (!user || !profile) return;
    const isTeacher = profile.role === 'teacher';
    const fetchSteps = async () => {
      let q = supabase.from('student_activity_log')
        .select('student_id, action, activity_time')
        .eq('model', 'support_ladder').like('action', '%الخطوة%');
      if (!isTeacher) q = q.eq('student_id', user.id);
      const { data, error } = await q;
      if (error) { console.error('[ladder] load steps failed:', error.message); return; }
      setStepsByStudent(computeStepsByStudent((data || []) as any));
    };
    fetchSteps();

    const ch = supabase.channel('ladder_activity_live')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'student_activity_log' }, (payload: any) => {
        const row = payload?.new;
        if (!row || row.model !== 'support_ladder') return;
        const action: string = row.action || '';
        if (action.includes('الخطوة')) fetchSteps();
        if (roleRef.current !== 'teacher') return; // الصوت للمعلم بس
        if (action.startsWith('أنهى الخطوة')) {
          const n = action.match(/الخطوة\s*(\d+)/)?.[1];
          playSound('step');
          pushToast(`${row.student_name} خلّص الخطوة ${n ? parseInt(n, 10) : ''} من ${TOTAL_LADDER_STEPS}`, 'step');
        } else if (action.includes('استخدم كوبون')) {
          playSound('coupon');
          pushToast(`${row.student_name} استخدم كوبون مساعدة 🎟️`, 'coupon');
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [user, profile]);

  useEffect(() => {
    if (!user || !profile) return;
    const sync = async () => {
      const { data: existing } = await supabase.from('help_coupons').select('*').eq('student_id', user.id).maybeSingle();
      if (!existing) {
        await supabase.from('help_coupons').insert({
          student_id: user.id,
          student_name: profile.full_name || user.email?.split('@')[0] || 'غير محدد',
          avatar_url: profile.avatar_url || null,
          coupons_remaining: 3, coupons_used: 0,
        });
      } else if (existing.avatar_url !== profile.avatar_url || existing.student_name !== (profile.full_name || user.email?.split('@')[0] || 'غير محدد')) {
        await supabase.from('help_coupons').update({
          student_name: profile.full_name || user.email?.split('@')[0] || 'غير محدد',
          avatar_url: profile.avatar_url || null,
        }).eq('student_id', user.id);
      }
    };
    const ensureStats = async () => {
      // الطالب يظهر عند المعلم أول ما يدخل النموذج
      if (profile.role === 'teacher' || profile.role === 'admin') return;
      await trackStudentActivity({
        studentId: user.id,
        studentName: profile.full_name || user.email?.split('@')[0] || 'غير محدد',
        model: 'support_ladder',
        action: 'دخل نموذج سلم الدعم',
        onlyIfNew: true,
      });
    };
    sync().then(ensureStats).catch((e) => console.error('sync failed:', e));
  }, [user, profile]);

  const canSeeAll = profile?.role === 'teacher' || profile?.role === 'admin';

  useEffect(() => {
    if (!user || !profile) return;
    const fetch = async () => {
      // الطالب يشوف لوحة كوبوناته هو بس، والمعلم يشوف الكل
      let q = supabase.from('help_coupons').select('*');
      if (!canSeeAll) q = q.eq('student_id', user.id);
      const { data } = await q;
      if (data) setHelpCoupons(data);
    };
    fetch();
    const ch = supabase.channel('help_coupons_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'help_coupons' }, () => fetch())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [user, profile, canSeeAll]);

  useEffect(() => {
    if (profile?.role !== 'teacher') return; // سجل الكوبونات للمعلم بس
    const fetch = async () => {
      const { data } = await supabase.from('coupon_logs').select('*').order('created_at', { ascending: false });
      if (data) setCouponLogs(data);
    };
    fetch();
    const ch = supabase.channel('coupon_logs_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'coupon_logs' }, () => fetch())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [profile?.role]);

  const qrUrl = typeof window !== 'undefined' ? `${window.location.origin}${QR_PAGE_PATH}` : `https://yourapp.com${QR_PAGE_PATH}`;
  const qrImg = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(qrUrl)}&color=0F172A&bgcolor=FFFFFF&qzone=2`;

  const useCoupon = async (sid: string) => {
    if (!user) return;
    const c = helpCoupons.find(x => x.student_id === sid);
    if (!c || c.coupons_remaining <= 0) return;
    const rem = c.coupons_remaining - 1;
    playSound('coupon');
    try {
      await supabase.from('help_coupons').update({ coupons_remaining: rem, coupons_used: c.coupons_used + 1, updated_at: new Date().toISOString() }).eq('student_id', sid);
      await supabase.from('coupon_logs').insert({ student_id: sid, student_name: c.student_name, action: 'استخدم كوبون', coupons_remaining: rem });
      await trackStudentActivity({
        studentId: sid, studentName: c.student_name, model: 'support_ladder',
        action: 'استخدم كوبون مساعدة في سلم الدعم', increment: 'coupons_used',
      });
    } catch (err) {
      console.error('useCoupon chain failed:', err);
    }
  };

  const resetCoupon = async (sid: string) => {
    if (!user) return;
    await supabase.from('help_coupons').update({ coupons_remaining: 3, coupons_used: 0, updated_at: new Date().toISOString() }).eq('student_id', sid);
  };

  const resetAll = async () => {
    await supabase.from('help_coupons').update({ coupons_remaining: 3, coupons_used: 0, updated_at: new Date().toISOString() }).neq('student_id', '00000000-0000-0000-0000-000000000000');
  };

  const resetLogs = async () => {
    await supabase.from('coupon_logs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  };

  const copyLink = () => {
    navigator.clipboard.writeText(qrUrl).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };

  const containerV = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
  const itemV = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease } } };

  // Total tokens left for current user
  const visibleCoupons = helpCoupons.filter(c => canSeeAll || c.student_id === user?.id);
  const myCoupon = helpCoupons.find(c => c.student_id === user?.id);
  const myRemaining = myCoupon?.coupons_remaining ?? 0;

  return (
    <div className="sl-i-wrap">
      {/* Decorative blobs */}
      <div className="sl-bg-deco">
        <div className="sl-bg-blob sl-bg-blob--1" />
        <div className="sl-bg-blob sl-bg-blob--2" />
      </div>

      {/* Hero */}
      <div className="sl-i-hero">
        <div className="sl-hero-pattern" />
        <div className="sl-hero-glow sl-hero-glow--teal" />
        <div className="sl-hero-glow sl-hero-glow--amber" />

        <div className="sl-i-back">
          <Link href="/support-ladder" className="sl-i-back-link">
            <ArrowLeft size={14} /> {t('supportLadder.interactive.backToExplanation')}
          </Link>
        </div>

        <motion.div className="sl-i-hero-inner" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <motion.div
            className="sl-i-hero-icon-wrap"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            <LifeBuoy size={32} />
          </motion.div>
          <h1 className="sl-i-hero-title">{t('supportLadder.interactive.hero.title')}</h1>
          <p className="sl-i-hero-desc"><BrText text={t('supportLadder.interactive.hero.subtitle')} /></p>
        </motion.div>
      </div>

      {/* Main */}
      <div className="sl-i-main">

        {/* QR Button */}
        {profile?.role === 'teacher' && (
          <div className="sl-i-qr-pill">
            <motion.button className="sl-i-qr-btn" onClick={() => setShowQR(true)} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
              <QrCode size={18} /> {t('supportLadder.interactive.qrButton')}
            </motion.button>
          </div>
        )}

        {/* تفعيل الإشعارات الصوتية — للمعلم */}
        {profile?.role === 'teacher' && (
          <div style={{ display: 'flex', justifyContent: 'center', margin: '10px 0' }}>
            <motion.button
              onClick={enableSound}
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 18px', borderRadius: 24,
                border: '1.5px solid ' + (soundOn ? '#2A9D8F' : '#F4A261'),
                background: soundOn ? 'rgba(42,157,143,0.12)' : 'rgba(244,162,97,0.14)',
                color: soundOn ? '#2A9D8F' : '#E76F51', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer',
              }}
            >
              {soundOn ? <BellRing size={16} /> : <Bell size={16} />}
              {soundOn ? 'الإشعارات الصوتية مفعّلة (اضغطي للتجربة)' : 'اضغطي لتفعيل الإشعارات الصوتية'}
            </motion.button>
          </div>
        )}

        {/* Token Counter — floating glass card (only for logged-in users) */}
        {user && (
          <motion.div
            className="sl-i-token-bar"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5, ease }}
          >
            <div className="sl-i-token-card">
              <div>
                <div className="sl-i-token-label">{t('supportLadder.interactive.remaining')}</div>
                <div className="sl-i-token-count">{myRemaining} / 3</div>
              </div>
              <div className="sl-i-token-dots">
                {[1, 2, 3].map(i => (
                  <motion.div
                    key={i}
                    className={`sl-i-token-dot ${i <= myRemaining ? 'sl-i-token-dot--full' : 'sl-i-token-dot--empty'}`}
                    animate={i <= myRemaining ? { scale: [1, 1.2, 1] } : {}}
                    transition={{ delay: i * 0.1, duration: 0.4 }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Students Grid */}
        <motion.div className="sl-i-students-grid" variants={containerV} initial="hidden" animate="show">
          {userLoading ? (
            <div style={{ textAlign: 'center', gridColumn: '1 / -1', padding: '48px', color: 'var(--text-muted)' }}>{t('common.loading')}</div>
          ) : !user ? (
            <div className="sl-i-login-card">
              <div className="sl-i-login-icon"><Lock size={24} /></div>
              <h3 className="sl-i-login-title">{t('supportLadder.interactive.loginToParticipate')}</h3>
              <Link href="/auth/login" className="sl-i-login-link">{t('nav.login')}</Link>
            </div>
          ) : visibleCoupons.length === 0 ? (
            <div style={{ textAlign: 'center', gridColumn: '1 / -1', padding: '48px', color: 'var(--text-muted)' }}>{t('supportLadder.interactive.noStudents')}</div>
          ) : (
            visibleCoupons.map((coupon) => {
              const isMine = coupon.student_id === user.id;
              return (
                <motion.div key={coupon.student_id} variants={itemV}>
                  <div className={`sl-i-student-card ${isMine ? 'sl-i-student-card--mine' : ''}`}>
                    <div className="sl-i-student-head">
                      {coupon.avatar_url ? (
                        <img src={coupon.avatar_url} alt="" className="sl-i-student-avatar" />
                      ) : (
                        <div className="sl-i-student-avatar-ph"><UserRound size={20} /></div>
                      )}
                      <div className="sl-i-student-name">
                        {isMine && <span className="sl-i-student-you">{t('common.you')}</span>}
                        {coupon.student_name}
                      </div>
                    </div>

                    <div className="sl-i-student-tokens">
                      {[1, 2, 3].map(i => (
                        <div key={i} className={`sl-i-student-token ${i <= coupon.coupons_remaining ? 'sl-i-student-token--active' : 'sl-i-student-token--used'}`}>
                          <Ticket size={18} strokeWidth={1.8} />
                        </div>
                      ))}
                    </div>

                    {(profile?.role === 'teacher' || isMine) && (() => {
                      const done = stepsByStudent.get(coupon.student_id)?.size ?? 0;
                      return (
                        <div style={{ margin: '10px 0 4px', textAlign: 'center' }}>
                          <div style={{ fontSize: '0.78rem', fontWeight: 700, marginBottom: 6, color: done === TOTAL_LADDER_STEPS ? '#2A9D8F' : 'var(--text-muted)' }}>
                            الخطوات: {done} / {TOTAL_LADDER_STEPS} {done === TOTAL_LADDER_STEPS ? '✅' : ''}
                          </div>
                          <div style={{ display: 'flex', gap: 5, justifyContent: 'center' }}>
                            {Array.from({ length: TOTAL_LADDER_STEPS }, (_, k) => (
                              <span key={k} style={{
                                width: 18, height: 6, borderRadius: 4,
                                background: stepsByStudent.get(coupon.student_id)?.has(k + 1) ? '#2A9D8F' : 'rgba(148,163,184,0.35)',
                                transition: 'background 0.3s',
                              }} />
                            ))}
                          </div>
                        </div>
                      );
                    })()}

                    <div className="sl-i-student-actions">
                      {isMine && (
                        <button className="sl-i-student-btn sl-i-student-btn--use" onClick={() => useCoupon(coupon.student_id)} disabled={coupon.coupons_remaining === 0}>
                          {t('supportLadder.interactive.useCoupon')}
                        </button>
                      )}
                      {profile?.role === 'teacher' && (
                        <button className="sl-i-student-btn sl-i-student-btn--renew" onClick={() => resetCoupon(coupon.student_id)}>
                          <RefreshCcw size={13} /> {t('supportLadder.interactive.renew')}
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </motion.div>

        {/* Log — teachers only */}
        {profile?.role === 'teacher' && (
          <motion.div className="sl-i-log-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.5, ease }}>
            <div className="sl-i-log-head">
              <div className="sl-i-log-head-icon"><Ticket size={16} /></div>
              <h3>{t('supportLadder.interactive.logTitle')}</h3>
            </div>

            {couponLogs.length === 0 ? (
              <div className="sl-i-log-empty">{t('supportLadder.interactive.logEmpty')}</div>
            ) : (
              couponLogs.map((log, i) => (
                <motion.div key={log.id || i} className="sl-i-log-row" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
                  <div className="sl-i-log-avatar"><UserRound size={14} /></div>
                  <div className="sl-i-log-info">
                    <div className="sl-i-log-name">{log.student_name}</div>
                    <div className="sl-i-log-action">{t('supportLadder.interactive.logUsedCoupon')}</div>
                  </div>
                  <div className="sl-i-log-meta">
                    <span className="sl-i-log-time">{new Date(log.created_at).toLocaleTimeString(locale)}</span>
                    <span className={`sl-i-log-badge ${log.coupons_remaining === 0 ? 'sl-i-log-badge--empty' : 'sl-i-log-badge--ok'}`}>
                      {t('supportLadder.interactive.logRemaining')} {log.coupons_remaining}
                    </span>
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
        )}

        {/* Actions */}
        <div className="sl-i-actions">
          {user && profile?.role === 'teacher' && (
            <motion.button className="sl-i-act-btn sl-i-act-btn--danger" onClick={resetAll} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
              <RefreshCcw size={15} /> {t('supportLadder.interactive.resetAllCoupons')}
            </motion.button>
          )}
          {user && profile?.role === 'teacher' && (
            <motion.button className="sl-i-act-btn sl-i-act-btn--teal" onClick={resetLogs} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
              <Trash2 size={15} /> {t('supportLadder.interactive.resetAllLogs')}
            </motion.button>
          )}
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
            <Link href="/support-ladder" className="sl-i-act-link">
              <ArrowLeft size={15} /> {t('supportLadder.interactive.backToExplanation')}
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Toasts للمعلم */}
      <div style={{ position: 'fixed', top: 80, insetInlineEnd: 16, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8, pointerEvents: 'none' }}>
        <AnimatePresence>
          {toasts.map(tt => (
            <motion.div
              key={tt.id}
              initial={{ opacity: 0, x: 30, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 30 }}
              style={{
                background: tt.kind === 'coupon' ? '#E76F51' : '#2A9D8F', color: 'white',
                padding: '10px 16px', borderRadius: 14, fontWeight: 700, fontSize: '0.88rem',
                boxShadow: '0 8px 24px rgba(0,0,0,0.18)', maxWidth: 280,
              }}
            >
              {tt.text}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* QR Modal */}
      <AnimatePresence>
        {showQR && profile?.role === 'teacher' && (
          <motion.div className="sl-i-modal-bg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowQR(false)}>
            <motion.div
              className="sl-i-modal"
              initial={{ scale: 0.85, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', stiffness: 110, damping: 16 }}
              onClick={e => e.stopPropagation()}
            >
              <button className="sl-i-modal-x" onClick={() => setShowQR(false)}>
                <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>&times;</span>
              </button>

              <motion.div className="sl-i-modal-icon" animate={{ y: [0, -6, 0] }} transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}>
                <Smartphone size={26} />
              </motion.div>

              <h2 className="sl-i-modal-title">{t('supportLadder.interactive.qrTitle')}</h2>
              <p className="sl-i-modal-desc">{t('supportLadder.interactive.qrDesc')}</p>

              <motion.div className="sl-i-modal-qr-wrap" initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15, type: 'spring' }}>
                <img src={qrImg} alt="QR Code" style={{ width: 200, height: 200, display: 'block', borderRadius: 10 }} />
              </motion.div>

              <div className="sl-i-modal-url">{qrUrl}</div>

              <div className="sl-i-modal-btns">
                <button className={`sl-i-modal-btn sl-i-modal-btn--copy ${copied ? 'copied' : ''}`} onClick={copyLink}>
                  {copied ? <CheckCircle size={15} /> : <Copy size={15} />}
                  {copied ? t('supportLadder.interactive.copied') : t('supportLadder.interactive.copyLink')}
                </button>
                <a href={qrImg} download="support-ladder-qr.png" className="sl-i-modal-btn sl-i-modal-btn--dl">
                  <Download size={15} /> {t('supportLadder.interactive.downloadImage')}
                </a>
              </div>

              <p className="sl-i-modal-hint">{t('supportLadder.interactive.qrHint')}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
