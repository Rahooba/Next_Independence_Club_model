'use client'

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useUser } from '@/hooks/useUser';
import { useTranslation } from '@/hooks/useTranslation';
import { BrText } from '@/components/i18n/BrText';
import { playSound } from '@/lib/client/sounds';
import { trackStudentActivity } from '@/lib/client/tracking';
import {
  ArrowLeft, MessageSquare, QrCode, UserRound,
  RefreshCcw, Trash2, Lock, CheckCircle, CircleAlert,
  CircleX, Clock, Send,
} from 'lucide-react';

const ease = [0.22, 1, 0.36, 1] as const;

const CARD_OPTIONS = [
  { key: 'green', Icon: CheckCircle, color: '#22C55E', bg: 'var(--sc-card-green-bg)' },
  { key: 'yellow', Icon: CircleAlert, color: '#EAB308', bg: 'var(--sc-card-yellow-bg)' },
  { key: 'red', Icon: CircleX, color: '#EF4444', bg: 'var(--sc-card-red-bg)' },
] as const;

export default function SilentCardsInteractivePage() {
  const { user, profile, loading: userLoading } = useUser();
  const { t } = useTranslation();
  const [silentCards, setSilentCards] = useState<any[]>([]);
  const [teacherMessage, setTeacherMessage] = useState('');
  const [teacherType, setTeacherType] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const roleRef = useRef<string | undefined>(undefined);
  useEffect(() => { roleRef.current = profile?.role; }, [profile?.role]);

  useEffect(() => { setIsMounted(true); }, []);

  // Auto-insert user into silent_cards if not exists
  useEffect(() => {
    if (!user || !profile) return;
    const insertCardIfNotExists = async () => {
      const { data: existing } = await supabase
        .from('silent_cards')
        .select('student_id')
        .eq('student_id', user.id)
        .maybeSingle();
      if (!existing) {
        await supabase.from('silent_cards').insert({
          student_id: user.id,
          student_name: profile.full_name || user.email?.split('@')[0] || 'غير محدد',
          avatar_url: profile.avatar_url || null,
          selected_card: null,
        });
      }
    };
    const ensureStats = async () => {
      // الطالب يظهر عند المعلم أول ما يدخل النموذج
      if (profile.role === 'teacher' || profile.role === 'admin') return;
      await trackStudentActivity({
        studentId: user.id,
        studentName: profile.full_name || user.email?.split('@')[0] || 'غير محدد',
        model: 'silent_cards',
        action: 'دخل نموذج البطاقات الصامتة',
        onlyIfNew: true,
      });
    };
    insertCardIfNotExists().then(ensureStats).catch((e) => console.error('join failed:', e));
  }, [user, profile]);

  // Fetch ALL silent_cards and subscribe to realtime
  useEffect(() => {
    const fetchSilentCards = async () => {
      const { data, error } = await supabase.from('silent_cards').select('*');
      if (data && !error) setSilentCards(data);
    };
    fetchSilentCards();
    const channel = supabase
      .channel('silent_cards_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'silent_cards' }, (payload: any) => {
        fetchSilentCards();
        // Teacher hears a sound (by card colour) when a student picks a card
        const picked = payload?.new?.selected_card;
        if (roleRef.current === 'teacher' && picked && payload?.old?.selected_card !== picked) {
          if (picked === 'green' || picked === 'yellow' || picked === 'red') playSound(picked);
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const stats: Record<string, number> = silentCards.reduce(
    (acc: Record<string, number>, s) => {
      if (s.selected_card) acc[s.selected_card] = (acc[s.selected_card] || 0) + 1;
      return acc;
    },
    { green: 0, yellow: 0, red: 0 }
  );

  const studentsByCard: Record<string, string[]> = silentCards.reduce(
    (acc: Record<string, string[]>, s) => {
      if (s.selected_card) {
        acc[s.selected_card] = acc[s.selected_card] || [];
        acc[s.selected_card].push(s.student_name);
      }
      return acc;
    },
    { green: [], yellow: [], red: [] }
  );

  const handleCardSelect = async (studentId: string, cardType: string) => {
    if (!user) return;
    const card = silentCards.find(c => c.student_id === studentId);
    if (!card || card.selected_card) return;

    const { error: updateError } = await supabase
      .from('silent_cards')
      .update({ selected_card: cardType, selected_at: new Date().toISOString() })
      .eq('student_id', studentId);
    if (updateError) { console.error('[silent_cards] update failed:', updateError); return; }

    // Sound feedback depending on the card colour
    if (cardType === 'green' || cardType === 'yellow' || cardType === 'red') playSound(cardType);

    const { error: logErr } = await supabase.from('silent_card_logs').insert({
      student_id: studentId, student_name: card.student_name, card_type: cardType,
    });
    if (logErr) console.error('[silent_card_logs] insert failed:', logErr);

    await trackStudentActivity({
      studentId, studentName: card.student_name, model: 'silent_cards',
      action: `اختار بطاقة ${cardType}`, increment: 'cards_selected',
    });
  };

  const handleResetAll = async () => {
    await supabase.from('silent_cards')
      .update({ selected_card: null, selected_at: null })
      .not('selected_card', 'is', null);
  };

  const getTeacherResponse = () => {
    if (stats.red > 2) {
      setTeacherMessage(t('silentCards.interactive.teacherResponseRed'));
      setTeacherType('red');
    } else if (stats.yellow > 3) {
      setTeacherMessage(t('silentCards.interactive.teacherResponseYellow'));
      setTeacherType('yellow');
    } else if (stats.green > 4) {
      setTeacherMessage(t('silentCards.interactive.teacherResponseGreen'));
      setTeacherType('green');
    } else {
      setTeacherMessage(t('silentCards.interactive.teacherResponseNeutral'));
      setTeacherType('neutral');
    }
  };

  const containerV = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
  const itemV = { hidden: { opacity: 0, scale: 0.95 }, show: { opacity: 1, scale: 1, transition: { duration: 0.35, ease } } };

  const responseBg: Record<string, string> = {
    green: 'sc-i-response--green',
    yellow: 'sc-i-response--yellow',
    red: 'sc-i-response--red',
    neutral: 'sc-i-response--neutral',
  };

  return (
    <div className="sc-i-wrap">
      {/* Hero */}
      <div className="sc-i-hero">
        <div className="sc-i-back">
          <Link href="/silent-cards" className="sc-i-back-link">
            <ArrowLeft size={14} /> {t('nav.backToExplanation')}
          </Link>
        </div>

        <motion.div className="sc-i-hero-inner" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="sc-i-hero-icon-wrap">
            <MessageSquare size={28} />
          </div>
          <h1 className="sc-i-hero-title">{t('silentCards.interactive.hero.title')}</h1>
          <p className="sc-i-hero-desc"><BrText text={t('silentCards.interactive.hero.subtitle')} /></p>
        </motion.div>
      </div>

      {/* Split Layout */}
      <div className="sc-i-layout">
        {/* Sidebar */}
        <motion.div
          className="sc-i-sidebar"
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15, duration: 0.5, ease }}
        >
          {/* Stats panel — teachers only */}
          {profile?.role === 'teacher' && (
            <div className="sc-i-stats">
              <div className="sc-i-stats-title">
                <CircleAlert size={15} /> {t('silentCards.interactive.teacherResponse')}
              </div>
              {CARD_OPTIONS.map(opt => (
                <div key={opt.key} className="sc-i-stat-row">
                  <div className={`sc-i-stat-dot sc-i-stat-dot--${opt.key}`} />
                  <span className="sc-i-stat-label">{opt.key === 'green' ? t('silentCards.green.label') : opt.key === 'yellow' ? t('silentCards.yellow.label') : t('silentCards.red.label')}</span>
                  <span className="sc-i-stat-count">{stats[opt.key]}</span>
                </div>
              ))}
              {Object.entries(studentsByCard).map(([key, names]) =>
                names.length > 0 ? (
                  <div key={key} className="sc-i-stat-names">
                    {names.join(', ')}
                  </div>
                ) : null
              )}
            </div>
          )}

          {/* Teacher response */}
          {profile?.role === 'teacher' && (
            <div className={`sc-i-response ${responseBg[teacherType || 'neutral'] || 'sc-i-response--neutral'}`}>
              <div className="sc-i-response-title">
                <Send size={15} /> {t('silentCards.interactive.teacherResponse')}
              </div>
              <AnimatePresence mode="wait">
                <motion.p
                  key={teacherMessage}
                  className="sc-i-response-msg"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                >
                  {teacherMessage || t('silentCards.interactive.teacherResponseWaiting')}
                </motion.p>
              </AnimatePresence>
              <motion.button
                className="sc-i-response-btn"
                onClick={getTeacherResponse}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Send size={14} /> {t('silentCards.interactive.teacherDecision')}
              </motion.button>
            </div>
          )}

          {/* Actions */}
          <div className="sc-i-actions">
            {user && profile?.role === 'teacher' && (
              <motion.button className="sc-i-act-btn sc-i-act-btn--danger" onClick={handleResetAll} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <RefreshCcw size={14} /> {t('silentCards.interactive.resetAll')}
              </motion.button>
            )}
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link href="/silent-cards" className="sc-i-act-link">
                <ArrowLeft size={14} /> {t('silentCards.interactive.backToExplanation')}
              </Link>
            </motion.div>
          </div>
        </motion.div>

        {/* Response Wall — Student Grid */}
        <motion.div className="sc-i-wall" variants={containerV} initial="hidden" animate="show">
          {userLoading ? (
            <div className="sc-i-login">{t('common.loading')}</div>
          ) : !user ? (
            <div className="sc-i-login">
              <div className="sc-i-login-icon"><Lock size={22} /></div>
              <h3 className="sc-i-login-title">{t('silentCards.interactive.loginToParticipate')}</h3>
              <Link href="/auth/login" className="sc-i-login-link">{t('nav.login')}</Link>
            </div>
          ) : silentCards.length === 0 ? (
            <div className="sc-i-login">{t('silentCards.interactive.noStudents')}</div>
          ) : (
            silentCards
              .filter(card => profile?.role === 'teacher' || card.student_id === user.id)
              .map((card) => {
                const active = CARD_OPTIONS.find(o => o.key === card.selected_card);
                const isMyCard = card.student_id === user.id;
                return (
                  <motion.div
                    key={card.student_id}
                    variants={itemV}
                    className={`sc-i-student ${active ? `sc-i-student--selected sc-i-student--${card.selected_card}` : ''} ${isMyCard ? 'sc-i-student--mine' : ''}`}
                  >
                    {card.avatar_url ? (
                      <img src={card.avatar_url} alt="" className="sc-i-student-avatar" />
                    ) : (
                      <div className="sc-i-student-avatar-ph"><UserRound size={20} /></div>
                    )}

                    <div className="sc-i-student-name">
                      {isMyCard && <span className="sc-i-student-you">{t('common.you')}</span>}
                      {card.student_name}
                    </div>

                    <div className={`sc-i-student-status ${active ? `sc-i-student-status--${card.selected_card}` : 'sc-i-student-status--none'}`}>
                      {active ? (
                        <>
                          {card.selected_card === 'green' && <CheckCircle size={13} />}
                          {card.selected_card === 'yellow' && <CircleAlert size={13} />}
                          {card.selected_card === 'red' && <CircleX size={13} />}
                          {card.selected_card === 'green' ? t('silentCards.green.label') : card.selected_card === 'yellow' ? t('silentCards.yellow.label') : t('silentCards.red.label')}
                        </>
                      ) : (
                        <>
                          <Clock size={13} />
                          {t('silentCards.interactive.selectGreen').split(' ')[0]}
                        </>
                      )}
                    </div>

                    <div className="sc-i-card-btns">
                      {CARD_OPTIONS.map(opt => (
                        <motion.button
                          key={opt.key}
                          className={`sc-i-card-btn sc-i-card-btn--${opt.key} ${card.selected_card === opt.key ? 'sc-i-card-btn--active' : ''}`}
                          onClick={() => handleCardSelect(card.student_id, opt.key)}
                          disabled={!isMyCard || card.selected_card !== null}
                          whileHover={isMyCard && card.selected_card === null ? { scale: 1.12 } : {}}
                          whileTap={isMyCard && card.selected_card === null ? { scale: 0.9 } : {}}
                        >
                          <opt.Icon size={18} />
                        </motion.button>
                      ))}
                    </div>

                    {card.selected_at && (
                      <div className="sc-i-student-time">
                        {new Date(card.selected_at).toLocaleTimeString('ar-EG')}
                      </div>
                    )}
                  </motion.div>
                );
              })
          )}
        </motion.div>
      </div>
    </div>
  );
}
