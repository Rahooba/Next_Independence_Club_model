'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useUser } from '@/hooks/useUser';
import { useTranslation } from '@/hooks/useTranslation';
import { useTheme } from '@/hooks/useTheme';
import {
  ArrowRight,
  Layers3,
  GraduationCap,
  Sparkles,
  RotateCcw,
  ClipboardList,
  Timer,
  Activity
} from 'lucide-react';

const modelIcons: Record<string, React.ReactNode> = {
  model_10_10_10: <Timer size={18} />,
  support_ladder: <Layers3 size={18} />,
  silent_cards: <GraduationCap size={18} />,
  beautiful_mistakes: <Sparkles size={18} />,
};

const StudentDetailPage = () => {
  const params = useParams();
  const studentId = params.id as string;
  const { user, profile, isTeacher, isAdmin } = useUser();
  const { t, dir } = useTranslation();
  const { theme, tokens } = useTheme();

  const [stats, setStats] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [studentName, setStudentName] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!studentId) return;
    fetchStudentData();

    const statsChannel = supabase
      .channel('student_stats_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'student_stats', filter: `student_id=eq.${studentId}` }, () => {
        fetchStudentData();
      })
      .subscribe();

    const activityChannel = supabase
      .channel('student_activity_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'student_activity_log', filter: `student_id=eq.${studentId}` }, () => {
        fetchStudentData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(statsChannel);
      supabase.removeChannel(activityChannel);
    };
  }, [studentId]);

  const fetchStudentData = async () => {
    const [statsRes, activityRes] = await Promise.all([
      supabase.from('student_stats').select('*').eq('student_id', studentId),
      supabase.from('student_activity_log').select('*').eq('student_id', studentId).order('activity_time', { ascending: false })
    ]);

    if (statsRes.data && statsRes.data.length > 0) {
      setStats(statsRes.data);
      setStudentName(statsRes.data[0].student_name || t('student.unknown') || 'طالب غير معروف');
    }
    if (activityRes.data) {
      setActivities(activityRes.data);
      if (!statsRes.data?.length && activityRes.data.length > 0) {
        setStudentName(activityRes.data[0].student_name || t('student.unknown') || 'طالب غير معروف');
      }
    }
    setIsLoading(false);
  };

  const handleResetModelStats = async (model: string) => {
    const modelName = getModelName(model);
    if (!confirm(`${t('student.resetConfirm') || 'هل أنت متأكد من تصفير إحصائيات نموذج'} ${modelName}?`)) return;

    const { error } = await supabase
      .from('student_stats')
      .update({ help_requests_count: 0, coupons_used: 0, cards_selected: 0, mistakes_submitted: 0 })
      .eq('student_id', studentId)
      .eq('model', model);

    if (error) {
      alert(t('student.resetError') || 'حدث خطأ أثناء التصفير.');
    } else {
      fetchStudentData();
    }
  };

  const getModelName = (model: string) => {
    const names: Record<string, string> = {
      model_10_10_10: t('student.model10') || '10-10-10',
      support_ladder: t('student.modelSupport') || 'سلم الدعم',
      silent_cards: t('student.modelSilent') || 'البطاقات الصامتة',
      beautiful_mistakes: t('student.modelMistakes') || 'أخطائي الجميلة'
    };
    return names[model] || model;
  };

  const getModelColor = (model: string) => {
    const colors: Record<string, string> = {
      model_10_10_10: tokens.primary,
      support_ladder: tokens.success,
      silent_cards: tokens.warning,
      beautiful_mistakes: tokens.danger
    };
    return colors[model] || tokens.primary;
  };

  const getStatValue = (model: string, field: string) => {
    const stat = stats.find(s => s.model === model);
    return stat?.[field] || 0;
  };

  const getActivityAction = (action: string) => {
    const actions: Record<string, string> = {
      'طلب مساعدة في نموذج 10-10-10': t('student.actions.helpRequest') || 'طلب مساعدة في 10-10-10',
      'استخدم كوبون مساعدة في سلم الدعم': t('student.actions.couponUsed') || 'استخدم كوبون مساعدة في سلم الدعم',
      'اختار بطاقة': t('student.actions.cardSelected') || 'اختار بطاقة',
      'شارك بخطأ جميل': t('student.actions.mistakeShared') || 'شارك بخطأ جميل'
    };
    return actions[action] || action;
  };

  const formatTime = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString(dir === 'rtl' ? 'ar-SA' : 'en-US', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const modelKeys = ['model_10_10_10', 'support_ladder', 'silent_cards', 'beautiful_mistakes'];

  if (isLoading) {
    return (
      <div>
        <style>{`@keyframes shimmer { 0% { opacity: 0.6; } 50% { opacity: 1; } 100% { opacity: 0.6; } }`}</style>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '20px' }}>
          <div>
            <div style={{ height: '120px', background: tokens.skeleton, borderRadius: '16px', animation: 'shimmer 1.5s infinite', marginBottom: '20px' }} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              {[...Array(4)].map((_, i) => (
                <div key={i} style={{ height: '140px', background: tokens.skeleton, borderRadius: '16px', animation: 'shimmer 1.5s infinite' }} />
              ))}
            </div>
          </div>
          <div style={{ height: '400px', background: tokens.skeleton, borderRadius: '16px', animation: 'shimmer 1.5s infinite' }} />
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Back button */}
      <motion.div
        initial={{ opacity: 0, x: dir === 'rtl' ? 10 : -10 }}
        animate={{ opacity: 1, x: 0 }}
        style={{ marginBottom: '20px' }}
      >
        <Link href="/dashboard" style={{ textDecoration: 'none' }}>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            color: tokens.mutedText,
            fontSize: '0.85rem',
            fontWeight: '500',
            transition: 'color 0.2s'
          }}>
            <ArrowRight size={14} style={{ transform: dir === 'rtl' ? 'none' : 'scaleX(-1)' }} />
            {t('student.backToDashboard') || 'العودة للوحة المعلم'}
          </span>
        </Link>
      </motion.div>

      {/* Student header card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: tokens.card,
          border: `1px solid ${tokens.border}`,
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '18px',
          boxShadow: tokens.shadow,
          transition: 'all 0.2s'
        }}
      >
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '14px',
          background: `linear-gradient(135deg, ${tokens.primary}, ${theme === 'dark' ? '#818CF8' : '#818CF8'})`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: '800',
          fontSize: '1.4rem',
          flexShrink: 0
        }}>
          {studentName?.charAt(0) || '?'}
        </div>
        <div>
          <h1 style={{ fontSize: '1.3rem', fontWeight: '800', color: tokens.primaryText, marginBottom: '2px', transition: 'color 0.2s' }}>
            {studentName}
          </h1>
          <p style={{ fontSize: '0.82rem', color: tokens.mutedText, transition: 'color 0.2s' }}>
            {t('student.reportSubtitle') || 'تقرير شامل لأداء الطالب في جميع النماذج'}
          </p>
        </div>
      </motion.div>

      {/* Main content: 2 columns */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '20px', alignItems: 'start' }}>
        {/* Model cards */}
        <div>
          <h2 style={{ fontSize: '0.92rem', fontWeight: '700', color: tokens.primaryText, marginBottom: '14px', transition: 'color 0.2s' }}>
            {t('student.modelDetails') || 'تفاصيل النماذج'}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            {modelKeys.map((model, i) => {
              const color = getModelColor(model);
              const helpCount = getStatValue(model, 'help_requests_count');
              const couponsCount = getStatValue(model, 'coupons_used');
              const cardsCount = getStatValue(model, 'cards_selected');
              const mistakesCount = getStatValue(model, 'mistakes_submitted');

              let displayValue = 0;
              let displayLabel = '';
              if (model === 'model_10_10_10') { displayValue = helpCount; displayLabel = t('student.helpRequests') || 'طلبات المساعدة'; }
              else if (model === 'support_ladder') { displayValue = couponsCount; displayLabel = t('student.couponsUsed') || 'كوبونات مستخدمة'; }
              else if (model === 'silent_cards') { displayValue = cardsCount; displayLabel = t('student.cardsSelected') || 'بطاقات مختارة'; }
              else if (model === 'beautiful_mistakes') { displayValue = mistakesCount; displayLabel = t('student.mistakesSubmitted') || 'أخطاء مشاركة'; }

              return (
                <motion.div
                  key={model}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="dashboard-card"
                  style={{
                    background: tokens.card,
                    border: `1px solid ${tokens.border}`,
                    borderRight: `4px solid ${color}`,
                    borderRadius: '16px',
                    padding: '20px',
                    position: 'relative'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '10px',
                        background: `${color}15`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color
                      }}>
                        {modelIcons[model] || <Activity size={18} />}
                      </div>
                      <div>
                        <div style={{ fontWeight: '700', color: tokens.primaryText, fontSize: '0.88rem', transition: 'color 0.2s' }}>
                          {getModelName(model)}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: tokens.mutedText, transition: 'color 0.2s' }}>{displayLabel}</div>
                      </div>
                    </div>

                    {(isTeacher || isAdmin) && (
                      <button
                        onClick={() => handleResetModelStats(model)}
                        title={t('student.resetTitle') || 'تصفير'}
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '8px',
                          border: `1px solid ${tokens.border}`,
                          background: tokens.kpiBg,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.15s',
                          flexShrink: 0,
                          color: tokens.danger
                        }}
                      >
                        <RotateCcw size={12} />
                      </button>
                    )}
                  </div>

                  <div style={{ fontSize: '2rem', fontWeight: '800', color, lineHeight: '1.1' }}>
                    {displayValue}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Activity timeline */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{
            background: tokens.card,
            border: `1px solid ${tokens.border}`,
            borderRadius: '16px',
            padding: '20px',
            position: 'sticky',
            top: '80px',
            maxHeight: 'calc(100vh - 100px)',
            overflowY: 'auto',
            boxShadow: tokens.shadow,
            transition: 'all 0.2s'
          }}
        >
          <h3 style={{ fontSize: '0.92rem', fontWeight: '700', color: tokens.primaryText, marginBottom: '16px', transition: 'color 0.2s' }}>
            {t('student.activityLog') || 'سجل النشاط'}
          </h3>

          {activities.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: tokens.skeleton,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 8px'
              }}>
                <ClipboardList size={20} style={{ color: tokens.mutedText }} />
              </div>
              <p style={{ color: tokens.mutedText, fontSize: '0.85rem', transition: 'color 0.2s' }}>
                {t('student.noActivity') || 'لا يوجد سجل نشاط مسجل حتى الآن.'}
              </p>
            </div>
          ) : (
            <div style={{ position: 'relative' }}>
              <div style={{
                position: 'absolute',
                top: '8px',
                bottom: '8px',
                width: '2px',
                background: tokens.border,
                right: '11px',
                transition: 'background 0.2s'
              }} />

              {activities.map((activity, index) => {
                const actColor = getModelColor(activity.model);
                return (
                  <motion.div
                    key={activity.id || index}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    style={{
                      display: 'flex',
                      gap: '12px',
                      marginBottom: index < activities.length - 1 ? '16px' : '0',
                      position: 'relative',
                      flexDirection: 'row-reverse'
                    }}
                  >
                    <div style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '8px',
                      background: tokens.card,
                      border: `2px solid ${actColor}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      zIndex: 1,
                      color: actColor
                    }}>
                      {modelIcons[activity.model] ? <span style={{ transform: 'scale(0.55)', display: 'flex' }}>{modelIcons[activity.model]}</span> : <Activity size={12} />}
                    </div>

                    <div style={{
                      flex: 1,
                      background: tokens.kpiBg,
                      border: `1px solid ${tokens.border}`,
                      borderRadius: '10px',
                      padding: '10px 12px',
                      transition: 'all 0.2s'
                    }}>
                      <div style={{ fontSize: '0.82rem', color: tokens.primaryText, fontWeight: '500', marginBottom: '4px', transition: 'color 0.2s' }}>
                        {getActivityAction(activity.action)}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.7rem', color: actColor, fontWeight: '600' }}>
                          {getModelName(activity.model)}
                        </span>
                        <span style={{ fontSize: '0.65rem', color: tokens.mutedText, transition: 'color 0.2s' }}>
                          {formatTime(activity.activity_time)}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default function Page() {
  return <StudentDetailPage />;
}
