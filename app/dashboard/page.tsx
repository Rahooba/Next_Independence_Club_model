'use client'

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { supabase } from '@/lib/supabase';
import { useUser } from '@/hooks/useUser';
import { useTranslation } from '@/hooks/useTranslation';
import { useTheme } from '@/hooks/useTheme';
import { useDashboard } from '@/providers/DashboardProvider';
import {
  Users,
  TrendingUp,
  Activity,
  BookOpen,
  Lock,
  ClipboardList,
  Clock,
  Sparkles,
  Layers3,
  ChevronRight,
  Star,
  ThumbsUp,
  AlertTriangle,
  MessageSquare,
  GraduationCap
} from 'lucide-react';

const DashboardPage = () => {
  const { user, profile, isTeacher, isAdmin } = useUser();
  const { t, dir } = useTranslation();
  const { theme, tokens } = useTheme();
  const { searchTerm } = useDashboard();

  const [students, setStudents] = useState<any[]>([]);
  const [sortBy, setSortBy] = useState<'lastActivity' | 'highestActions'>('lastActivity');
  const [isLoading, setIsLoading] = useState(true);
  const [surveyData, setSurveyData] = useState<any[]>([]);
  const [surveyLoading, setSurveyLoading] = useState(true);

  const SkeletonKPI = () => (
    <div style={{
      background: tokens.card,
      border: `1px solid ${tokens.border}`,
      borderRadius: '16px',
      padding: 'clamp(14px, 2vw, 20px)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: tokens.skeleton }} />
        <div style={{ flex: 1 }}>
          <div style={{ height: '10px', background: tokens.skeleton, borderRadius: '4px', width: '60%', marginBottom: '8px' }} />
          <div style={{ height: '20px', background: tokens.skeleton, borderRadius: '4px', width: '40%' }} />
        </div>
      </div>
    </div>
  );

  const SkeletonCard = () => (
    <div style={{
      background: tokens.card,
      border: `1px solid ${tokens.border}`,
      borderRadius: '16px',
      padding: 'clamp(16px, 2vw, 24px)',
      animation: 'shimmer 1.5s infinite',
      transition: 'all 0.2s'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
        <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: tokens.skeleton }} />
        <div style={{ flex: 1 }}>
          <div style={{ height: '12px', background: tokens.skeleton, borderRadius: '4px', width: '70%', marginBottom: '8px' }} />
          <div style={{ height: '10px', background: tokens.skeleton, borderRadius: '4px', width: '50%' }} />
        </div>
      </div>
      <div style={{ height: '6px', background: tokens.skeleton, borderRadius: '3px', marginBottom: '8px' }} />
      <div style={{ height: '6px', background: tokens.skeleton, borderRadius: '3px', width: '80%' }} />
    </div>
  );

  useEffect(() => {
    const fetchStudents = async () => {
      const { data, error } = await supabase
        .from('student_stats')
        .select('*')
        .order('last_activity_at', { ascending: false });

      if (data && !error) {
        const studentMap = new Map<string, any>();
        data.forEach((row: any) => {
          const existing = studentMap.get(row.student_id);
          if (existing) {
            existing.models[row.model] = row;
            existing.total_actions += (row.help_requests_count || 0) + (row.coupons_used || 0) + (row.cards_selected || 0) + (row.mistakes_submitted || 0);
            if (new Date(row.last_activity_at) > new Date(existing.last_activity_at)) {
              existing.last_activity_at = row.last_activity_at;
            }
          } else {
            studentMap.set(row.student_id, {
              id: row.student_id,
              name: row.student_name,
              models: { [row.model]: row },
              total_actions: (row.help_requests_count || 0) + (row.coupons_used || 0) + (row.cards_selected || 0) + (row.mistakes_submitted || 0),
              last_activity_at: row.last_activity_at
            });
          }
        });
        setStudents(Array.from(studentMap.values()));
      }
      setIsLoading(false);
    };

    fetchStudents();

    const channel = supabase
      .channel('dashboard_stats_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'student_stats' }, () => {
        fetchStudents();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  useEffect(() => {
    const fetchSurvey = async () => {
      const { data, error } = await supabase
        .from('beautiful_mistakes_survey')
        .select('*')
        .order('submitted_at', { ascending: false });

      if (data && !error) {
        setSurveyData(data);
      }
      setSurveyLoading(false);
    };

    fetchSurvey();
  }, []);

  const overviewStats = useMemo(() => {
    const totalStudents = students.length;
    const totalActions = students.reduce((sum, s) => sum + s.total_actions, 0);
    const avgActions = totalStudents > 0 ? Math.round(totalActions / totalStudents) : 0;
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const activeStudents = students.filter(s => new Date(s.last_activity_at) > sevenDaysAgo).length;
    const modelsSet = new Set<string>();
    students.forEach(s => Object.keys(s.models).forEach(m => modelsSet.add(m)));
    return { totalStudents, avgActions, activeStudents, modelsCovered: modelsSet.size };
  }, [students]);

  const filteredStudents = useMemo(() => {
    let result = students;
    if (searchTerm) {
      result = result.filter(s => s.name?.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    if (sortBy === 'lastActivity') {
      result.sort((a, b) => new Date(b.last_activity_at).getTime() - new Date(a.last_activity_at).getTime());
    } else {
      result.sort((a, b) => b.total_actions - a.total_actions);
    }
    return result;
  }, [students, searchTerm, sortBy]);

  const ratingDistribution = useMemo(() => {
    const dist = [0, 0, 0, 0, 0];
    surveyData.forEach((r: any) => { if (r.q1_rating >= 1 && r.q1_rating <= 5) dist[r.q1_rating - 1]++; });
    return [
      { name: '1', count: dist[0], fill: tokens.danger },
      { name: '2', count: dist[1], fill: '#F97316' },
      { name: '3', count: dist[2], fill: tokens.warning },
      { name: '4', count: dist[3], fill: '#22C55E' },
      { name: '5', count: dist[4], fill: tokens.primary },
    ];
  }, [surveyData, tokens]);

  const benefitedData = useMemo(() => {
    let yes = 0, no = 0;
    surveyData.forEach((r: any) => {
      const val = r.q2_benefited;
      if (val === true || val === 'Yes' || val === 'yes' || val === 1 || val === 'نعم') {
        yes++;
      } else {
        no++;
      }
    });
    return [
      { name: t('dashboard.survey.yesLabel') || 'نعم', value: yes, fill: '#16A34A' },
      { name: t('dashboard.survey.noLabel') || 'لا', value: no, fill: '#6366F1' },
    ];
  }, [surveyData, t, tokens, theme]);

  const avgFear = useMemo(() => {
    if (surveyData.length === 0) return 0;
    return surveyData.reduce((sum: number, r: any) => sum + (r.q3_fear_level || 0), 0) / surveyData.length;
  }, [surveyData]);

  const isStudentActive = (lastActivity: string) => {
    const diff = Date.now() - new Date(lastActivity).getTime();
    return diff < 7 * 24 * 60 * 60 * 1000;
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return t('dashboard.lastActivityNone') || '—';
    const date = new Date(dateStr);
    return date.toLocaleDateString(dir === 'rtl' ? 'ar-SA' : 'en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const totalSurveyResponses = surveyData.length;
  const avgRating = totalSurveyResponses > 0
    ? (surveyData.reduce((sum: number, r: any) => sum + (r.q1_rating || 0), 0) / totalSurveyResponses).toFixed(1)
    : '0';
  const benefitedPercent = totalSurveyResponses > 0
    ? Math.round((surveyData.filter((r: any) => {
        const val = r.q2_benefited;
        return val === true || val === 'Yes' || val === 'yes' || val === 1 || val === 'نعم';
      }).length / totalSurveyResponses) * 100)
    : 0;

  if (!isTeacher && !isAdmin) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh'
      }}>
        <div style={{
          background: tokens.card,
          border: `1px solid ${tokens.border}`,
          borderRadius: '16px',
          padding: 'clamp(24px, 5vw, 48px)',
          textAlign: 'center',
          maxWidth: '400px',
          boxShadow: tokens.shadow,
          transition: 'all 0.2s'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '16px',
            background: theme === 'dark' ? 'rgba(239,68,68,0.15)' : '#FEF2F2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px'
          }}>
            <Lock size={28} style={{ color: tokens.danger }} />
          </div>
          <h2 style={{ color: tokens.primaryText, fontSize: '1.3rem', fontWeight: '700', marginBottom: '8px', transition: 'color 0.2s' }}>
            {t('dashboard.unauthorized') || 'غير مصرح'}
          </h2>
          <p style={{ color: tokens.mutedText, marginBottom: '24px', transition: 'color 0.2s' }}>
            {t('dashboard.unauthorizedDesc') || 'يجب أن تكون معلماً للوصول لهذه الصفحة'}
          </p>
          <Link href="/home" style={{ textDecoration: 'none' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: tokens.primary,
              color: 'white',
              padding: '10px 24px',
              borderRadius: '50px',
              fontWeight: '600',
              fontSize: '0.9rem',
              transition: 'background 0.2s'
            }}>
              {t('nav.backToHome') || 'العودة للرئيسية'}
            </span>
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div>
        <style>{`@keyframes shimmer { 0% { opacity: 0.6; } 50% { opacity: 1; } 100% { opacity: 0.6; } }`}</style>
        <div style={{ marginBottom: '28px' }}>
          <div style={{ height: '28px', background: tokens.skeleton, borderRadius: '6px', width: 'clamp(120px, 30vw, 200px)', marginBottom: '8px', animation: 'shimmer 1.5s infinite' }} />
          <div style={{ height: '14px', background: tokens.skeleton, borderRadius: '6px', width: 'clamp(200px, 50vw, 350px)', animation: 'shimmer 1.5s infinite' }} />
        </div>
        <div className="skeleton-kpi-grid">
          {[...Array(4)].map((_, i) => <SkeletonKPI key={i} />)}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(340px, 100%), 1fr))', gap: '16px' }}>
          {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }

  return (
    <div>
      <style>{`
        @keyframes shimmer { 0% { opacity: 0.6; } 50% { opacity: 1; } 100% { opacity: 0.6; } }
        .dashboard-card { transition: box-shadow 0.2s ease, transform 0.2s ease, background 0.2s, border-color 0.2s; }
        .dashboard-card:hover { box-shadow: 0 4px 20px ${theme === 'dark' ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.06)'}; }
        .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 28px; }
        .main-grid { display: grid; grid-template-columns: 1fr 380px; gap: 20px; align-items: start; }
        .student-stats { display: flex; align-items: center; gap: 20px; flex-shrink: 0; }
        .skeleton-kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 28px; }
        @media (max-width: 1279px) {
          .main-grid { grid-template-columns: 1fr 320px; }
        }
        @media (max-width: 1023px) {
          .main-grid { grid-template-columns: 1fr; }
          .kpi-grid { grid-template-columns: repeat(2, 1fr); }
          .skeleton-kpi-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 640px) {
          .kpi-grid { grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px; }
          .skeleton-kpi-grid { grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px; }
          .student-stats { gap: 12px; }
          .student-stats > div:first-child { display: none; }
        }
        @media (max-width: 480px) {
          .kpi-grid { grid-template-columns: 1fr; gap: 10px; }
          .skeleton-kpi-grid { grid-template-columns: 1fr; gap: 10px; }
          .student-name-group { display: none; }
        }
      `}</style>

      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ marginBottom: '28px' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
          <GraduationCap size={28} style={{ color: tokens.primary, flexShrink: 0 }} />
          <h1 style={{
            fontSize: 'clamp(1.2rem, 3vw, 1.6rem)',
            fontWeight: '800',
            color: tokens.primaryText,
            transition: 'color 0.2s'
          }}>
            {t('dashboard.title') || 'لوحة المعلم'}
          </h1>
        </div>
        <p style={{ color: tokens.mutedText, fontSize: '0.9rem', transition: 'color 0.2s' }}>
          {t('dashboard.subtitle') || 'متابعة نشاط الطلاب عبر جميع النماذج التعليمية'}
        </p>
      </motion.div>

      {/* KPI Strip */}
      <div className="kpi-grid">
        {[
          {
            label: t('dashboard.overview.totalStudents') || 'إجمالي الطلاب',
            value: overviewStats.totalStudents,
            icon: <Users size={18} style={{ color: tokens.primary }} />,
            bgColor: theme === 'dark' ? 'rgba(99,102,241,0.15)' : 'rgba(79,70,229,0.08)'
          },
          {
            label: t('dashboard.overview.avgActions') || 'متوسط التفاعلات',
            value: overviewStats.avgActions,
            icon: <TrendingUp size={18} style={{ color: tokens.info }} />,
            bgColor: theme === 'dark' ? 'rgba(56,189,248,0.15)' : 'rgba(14,165,233,0.08)'
          },
          {
            label: t('dashboard.overview.activeWeek') || 'نشط (7 أيام)',
            value: overviewStats.activeStudents,
            icon: <Activity size={18} style={{ color: tokens.success }} />,
            bgColor: theme === 'dark' ? 'rgba(34,197,94,0.15)' : 'rgba(22,163,74,0.08)'
          },
          {
            label: t('dashboard.overview.modelsCovered') || 'النماذج المشمولة',
            value: overviewStats.modelsCovered,
            icon: <BookOpen size={18} style={{ color: tokens.warning }} />,
            bgColor: theme === 'dark' ? 'rgba(250,204,21,0.15)' : 'rgba(245,158,11,0.08)'
          }
        ].map((kpi, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.3 }}
            className="dashboard-card"
            style={{
              background: tokens.card,
              border: `1px solid ${tokens.border}`,
              borderRadius: '16px',
              padding: 'clamp(14px, 2vw, 20px)',
              cursor: 'default'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '0.78rem', color: tokens.mutedText, fontWeight: '500', transition: 'color 0.2s' }}>{kpi.label}</span>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: kpi.bgColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 0.2s'
              }}>
                {kpi.icon}
              </div>
            </div>
            <div style={{ fontSize: 'clamp(1.4rem, 3vw, 1.8rem)', fontWeight: '800', color: tokens.primaryText, lineHeight: '1.1', transition: 'color 0.2s' }}>
              {kpi.value}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main content: 2-column layout */}
      <div className="main-grid">
        {/* Left: Student list */}
        <div>
          {/* Sort bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginBottom: '16px' }}>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              style={{
                padding: '10px 14px',
                border: `1px solid ${tokens.border}`,
                borderRadius: '10px',
                fontSize: '0.85rem',
                fontFamily: 'inherit',
                background: tokens.card,
                color: tokens.secondaryText,
                cursor: 'pointer',
                outline: 'none',
                transition: 'all 0.2s'
              }}
            >
              <option value="lastActivity">{t('dashboard.sort.lastActivity') || 'آخر نشاط'}</option>
              <option value="highestActions">{t('dashboard.sort.highestActions') || 'الأكثر تفاعلاً'}</option>
            </select>
          </div>

          {/* Students list */}
          {filteredStudents.length === 0 ? (
            <div style={{
              background: tokens.card,
              border: `1px solid ${tokens.border}`,
              borderRadius: '16px',
              padding: 'clamp(32px, 5vw, 48px) clamp(16px, 3vw, 24px)',
              textAlign: 'center',
              boxShadow: tokens.shadow,
              transition: 'all 0.2s'
            }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '14px',
                background: tokens.skeleton,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px'
              }}>
                <ClipboardList size={24} style={{ color: tokens.mutedText }} />
              </div>
              <h3 style={{ color: tokens.primaryText, fontWeight: '700', marginBottom: '6px', transition: 'color 0.2s' }}>
                {t('dashboard.noStudents') || 'لا يوجد بيانات للطلاب بعد'}
              </h3>
              <p style={{ color: tokens.mutedText, fontSize: '0.88rem', transition: 'color 0.2s' }}>
                {t('dashboard.noStudentsDesc') || 'سيظهر الطلاب هنا بمجرد تفاعلهم مع أي من النماذج'}
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {filteredStudents.map((student, index) => (
                <motion.div
                  key={student.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03, duration: 0.25 }}
                >
                  <Link href={`/dashboard/student/${student.id}`} style={{ textDecoration: 'none' }}>
                    <div
                      className="dashboard-card"
                      style={{
                        background: tokens.card,
                        border: `1px solid ${tokens.border}`,
                        borderRadius: '16px',
                        padding: 'clamp(12px, 2vw, 16px) clamp(14px, 2vw, 20px)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        cursor: 'pointer'
                      }}
                    >
                      <div style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '12px',
                        background: `linear-gradient(135deg, ${tokens.primary}, ${theme === 'dark' ? '#818CF8' : '#818CF8'})`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: '700',
                        fontSize: '1rem',
                        flexShrink: 0
                      }}>
                        {student.name?.charAt(0) || '?'}
                      </div>

                      <div className="student-name-group" style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <span style={{ fontWeight: '600', color: tokens.primaryText, fontSize: '0.92rem', transition: 'color 0.2s' }}>
                            {student.name}
                          </span>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '0.68rem',
                            fontWeight: '600',
                            padding: '2px 8px',
                            borderRadius: '50px',
                            background: isStudentActive(student.last_activity_at)
                              ? (theme === 'dark' ? 'rgba(34,197,94,0.15)' : '#F0FDF4')
                              : (theme === 'dark' ? 'rgba(250,204,21,0.15)' : '#FFF7ED'),
                            color: isStudentActive(student.last_activity_at) ? tokens.success : tokens.warning,
                            border: `1px solid ${isStudentActive(student.last_activity_at)
                              ? (theme === 'dark' ? 'rgba(34,197,94,0.3)' : '#BBF7D0')
                              : (theme === 'dark' ? 'rgba(250,204,21,0.3)' : '#FDE68A')}`,
                            transition: 'all 0.2s'
                          }}>
                            <span style={{
                              width: '5px',
                              height: '5px',
                              borderRadius: '50%',
                              background: isStudentActive(student.last_activity_at) ? tokens.success : tokens.warning
                            }} />
                            {isStudentActive(student.last_activity_at)
                              ? (t('dashboard.overview.active') || 'نشط')
                              : (t('dashboard.overview.inactive') || 'غير نشط')}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: tokens.mutedText, transition: 'color 0.2s' }}>
                          {t('dashboard.lastActivity') || 'آخر نشاط:'} {formatDate(student.last_activity_at)}
                        </div>
                      </div>

                      <div className="student-stats">
                        <div style={{ textAlign: 'center', minWidth: '60px' }}>
                          <div style={{ fontSize: '1.1rem', fontWeight: '800', color: tokens.primaryText, transition: 'color 0.2s' }}>
                            {student.total_actions}
                          </div>
                          <div style={{ fontSize: '0.65rem', color: tokens.mutedText, transition: 'color 0.2s' }}>
                            {t('dashboard.totalActions') || 'تفاعلات'}
                          </div>
                        </div>

                        <div style={{ textAlign: 'center', minWidth: '60px' }}>
                          <div style={{ fontSize: '1.1rem', fontWeight: '800', color: tokens.primary, transition: 'color 0.2s' }}>
                            {Object.keys(student.models).length}
                          </div>
                          <div style={{ fontSize: '0.65rem', color: tokens.mutedText, transition: 'color 0.2s' }}>
                            {t('dashboard.modelsUsed') || 'نماذج'}
                          </div>
                        </div>

                        {dir === 'rtl' ? <ChevronRight size={16} style={{ color: tokens.mutedText }} /> : <ChevronRight size={16} style={{ color: tokens.mutedText, transform: 'scaleX(-1)' }} />}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Survey + Quick Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Survey Summary Card */}
          {totalSurveyResponses > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="dashboard-card"
              style={{
                background: tokens.card,
                border: `1px solid ${tokens.border}`,
                borderRadius: '16px',
                padding: 'clamp(14px, 2vw, 20px)',
                boxShadow: tokens.shadow
              }}
            >
              <h3 style={{ fontSize: '0.92rem', fontWeight: '700', color: tokens.primaryText, marginBottom: '16px', transition: 'color 0.2s' }}>
                {t('dashboard.survey.title') || 'نتائج استبيان الأخطاء الجميلة'}
              </h3>

              {/* Mini KPIs */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '10px', marginBottom: '16px' }}>
                {[
                  { label: t('dashboard.survey.totalResponses') || 'إجمالي الاستجابات', value: totalSurveyResponses, icon: <ClipboardList size={14} />, color: tokens.primary },
                  { label: t('dashboard.survey.averageRating') || 'متوسط التقييم', value: `${avgRating}`, icon: <Star size={14} />, color: tokens.warning },
                  { label: t('dashboard.survey.benefited') || 'استفادوا', value: `${benefitedPercent}%`, icon: <ThumbsUp size={14} />, color: tokens.success },
                  { label: t('dashboard.survey.averageFear') || 'متوسط الخوف', value: avgFear.toFixed(1), icon: <AlertTriangle size={14} />, color: tokens.danger },
                ].map((item, i) => (
                  <div key={i} style={{
                    background: tokens.kpiBg,
                    border: `1px solid ${tokens.border}`,
                    borderRadius: '12px',
                    padding: '12px',
                    transition: 'all 0.2s'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                      <span style={{ color: item.color }}>{item.icon}</span>
                      <span style={{ fontSize: '0.68rem', color: tokens.mutedText, transition: 'color 0.2s' }}>{item.label}</span>
                    </div>
                    <div style={{ fontSize: '1.2rem', fontWeight: '800', color: tokens.primaryText, transition: 'color 0.2s' }}>{item.value}</div>
                  </div>
                ))}
              </div>

              {/* Rating chart */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '0.78rem', color: tokens.mutedText, marginBottom: '8px', fontWeight: '600', transition: 'color 0.2s' }}>
                  {t('dashboard.survey.ratingDistribution') || 'توزيع التقييمات'}
                </div>
                <div style={{ height: '120px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={ratingDistribution} barSize={24}>
                      <CartesianGrid strokeDasharray="3 3" stroke={tokens.border} vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 11, fill: tokens.mutedText }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: tokens.mutedText }} axisLine={false} tickLine={false} />
                      <Tooltip
                        contentStyle={{
                          background: tokens.card,
                          border: `1px solid ${tokens.border}`,
                          borderRadius: '10px',
                          fontSize: '0.8rem',
                          boxShadow: tokens.shadow,
                          color: tokens.primaryText
                        }}
                      />
                      <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                        {ratingDistribution.map((entry, index) => (
                          <Cell key={index} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Benefited donut */}
              <div>
                <div style={{ fontSize: '0.78rem', color: tokens.mutedText, marginBottom: '8px', fontWeight: '600', transition: 'color 0.2s' }}>
                  {t('dashboard.survey.benefitedChart') || 'استفادوا من النموذج'}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '100px', height: '100px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={benefitedData}
                          innerRadius={30}
                          outerRadius={45}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {benefitedData.map((entry, index) => (
                            <Cell key={index} fill={entry.fill} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {benefitedData.map((item, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: item.fill }} />
                        <span style={{ color: tokens.secondaryText, transition: 'color 0.2s' }}>{item.name}</span>
                        <span style={{ fontWeight: '700', color: tokens.primaryText, transition: 'color 0.2s' }}>{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Fear gauge — Green → Yellow → Red */}
              <div style={{ marginTop: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.78rem', color: tokens.mutedText, fontWeight: '600', transition: 'color 0.2s' }}>
                    {t('dashboard.survey.fearGauge') || 'مقياس مستوى الخوف'}
                  </span>
                  <span style={{ fontSize: '0.78rem', color: tokens.primaryText, fontWeight: '700', transition: 'color 0.2s' }}>
                    {avgFear.toFixed(1)} / 5
                  </span>
                </div>
                <div style={{
                  height: '8px',
                  background: theme === 'dark' ? '#334155' : '#E5E7EB',
                  borderRadius: '4px',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(90deg, #22C55E, #FACC15, #EF4444)',
                    borderRadius: '4px'
                  }} />
                  <div style={{
                    position: 'absolute',
                    top: '-3px',
                    left: `${(avgFear / 5) * 100}%`,
                    width: '14px',
                    height: '14px',
                    borderRadius: '50%',
                    background: 'white',
                    border: `2px solid ${tokens.primaryText}`,
                    transform: 'translateX(-50%)',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.15)'
                  }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                  <span style={{ fontSize: '0.65rem', color: '#22C55E' }}>{t('dashboard.survey.fearNotAfraid') || 'لم أكن خائفاً'}</span>
                  <span style={{ fontSize: '0.65rem', color: '#EF4444' }}>{t('dashboard.survey.fearVeryAfraid') || 'كنت خائفاً جداً'}</span>
                </div>
              </div>

              {/* Comments */}
              {surveyData.filter((r: any) => r.q4_comment).length > 0 && (
                <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: `1px solid ${tokens.border}`, transition: 'border-color 0.2s' }}>
                  <h4 style={{ fontSize: '0.82rem', fontWeight: '700', color: tokens.primaryText, marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px', transition: 'color 0.2s' }}>
                    <MessageSquare size={14} />
                    {t('dashboard.survey.commentsTitle') || 'التعليقات والاقتراحات'}
                  </h4>
                  {surveyData.filter((r: any) => r.q4_comment).slice(0, 3).map((r: any, i: number) => (
                    <div key={i} style={{
                      padding: '10px 12px',
                      background: tokens.kpiBg,
                      border: `1px solid ${tokens.border}`,
                      borderRadius: '10px',
                      marginBottom: '8px',
                      transition: 'all 0.2s'
                    }}>
                      <div style={{ fontSize: '0.72rem', color: tokens.mutedText, marginBottom: '4px' }}>{r.student_name}</div>
                      <div style={{ fontSize: '0.82rem', color: tokens.secondaryText, lineHeight: '1.5' }}>{r.q4_comment}</div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Quick Actions Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="dashboard-card"
            style={{
              background: tokens.card,
              border: `1px solid ${tokens.border}`,
              borderRadius: '16px',
              padding: 'clamp(14px, 2vw, 20px)',
              boxShadow: tokens.shadow
            }}
          >
            <h3 style={{ fontSize: '0.92rem', fontWeight: '700', color: tokens.primaryText, marginBottom: '14px', transition: 'color 0.2s' }}>
              {t('dashboard.quickActions') || 'إجراءات سريعة'}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { label: t('dashboard.actions.startSession') || 'بدء جلسة 10-10-10', path: '/model-10-10-10/interactive', icon: <Clock size={16} />, color: tokens.primary },
                { label: t('dashboard.actions.openMistakes') || 'فتح لوحة الأخطاء', path: '/beautiful-mistakes/interactive', icon: <Sparkles size={16} />, color: tokens.danger },
                { label: t('dashboard.actions.supportLadder') || 'سلم الدعم', path: '/support-ladder', icon: <Layers3 size={16} />, color: tokens.success },
              ].map((action, i) => (
                <Link key={i} href={action.path} style={{ textDecoration: 'none' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: 'clamp(8px, 1.5vw, 10px) clamp(10px, 2vw, 14px)',
                    background: tokens.kpiBg,
                    border: `1px solid ${tokens.border}`,
                    borderRadius: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    minHeight: '44px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ color: action.color }}>{action.icon}</span>
                      <span style={{ fontSize: '0.85rem', color: tokens.primaryText, fontWeight: '500', transition: 'color 0.2s' }}>{action.label}</span>
                    </div>
                    {dir === 'rtl' ? <ChevronRight size={14} style={{ color: tokens.mutedText }} /> : <ChevronRight size={14} style={{ color: tokens.mutedText, transform: 'scaleX(-1)' }} />}
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default function Page() {
  return <DashboardPage />;
}
