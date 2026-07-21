'use client'

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useUser } from '@/hooks/useUser';
import { useTranslation } from '@/hooks/useTranslation';
import MistakeCard from '@/components/interactive/MistakeCard';
import WorkspaceHeader from '@/components/interactive/beautiful-mistakes/WorkspaceHeader';
import MistakeBoard from '@/components/interactive/beautiful-mistakes/MistakeBoard';
import MistakeSpotlight from '@/components/interactive/beautiful-mistakes/MistakeSpotlight';
import FloatingActions from '@/components/interactive/beautiful-mistakes/FloatingActions';
import CelebrationToast from '@/components/interactive/beautiful-mistakes/CelebrationToast';
import { Hash, Clock, TrendingUp, Sparkles } from 'lucide-react';

type MistakeType = {
  id: string;
  student_name: string;
  real_name: string;
  optional_name: string | null;
  avatar_url: string | null;
  mistake_description: string;
  submitted_at: string;
  is_best_of_week: boolean;
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut" as const,
    },
  },
};

const BeautifulMistakesInteractive = () => {
  const { user, profile } = useUser();
  const { t, dir } = useTranslation();
  const [mistakes, setMistakes] = useState<MistakeType[]>([]);
  const [selectedMistake, setSelectedMistake] = useState<MistakeType | null>(null);
  const [teacherSelectedMistake, setTeacherSelectedMistake] = useState<string | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [windowWidth, setWindowWidth] = useState(1200);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    setWindowWidth(window.innerWidth);
    const onResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const isMobile = isMounted && windowWidth < 768;
  const isTablet = isMounted && windowWidth >= 768 && windowWidth < 1024;

  const getDisplayName = (mistake: { real_name: string; optional_name: string | null }) => {
    if (profile?.role === 'teacher' && mistake.optional_name) {
      return `${mistake.optional_name} (${mistake.real_name})`;
    }
    return mistake.real_name;
  };

  const fetchMistakes = async () => {
    const { data, error } = await supabase
      .from('beautiful_mistakes')
      .select('*')
      .eq('is_deleted', false)
      .order('submitted_at', { ascending: false });

    if (error) {
      console.error('Error fetching mistakes:', error);
    } else {
      setMistakes(data || []);
      const bestOfWeek = data?.find(m => m.is_best_of_week);
      if (bestOfWeek) {
        setSelectedMistake(bestOfWeek);
      }
    }
  };

  useEffect(() => {
    fetchMistakes();

    const channel = supabase
      .channel('beautiful_mistakes_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'beautiful_mistakes'
        },
        (payload) => {
          fetchMistakes();
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, []);

  const addMistake = async (realName: string, optionalName: string, mistakeDescription: string) => {
    const { data, error } = await supabase
      .from('beautiful_mistakes')
      .insert({
        real_name: realName,
        optional_name: optionalName,
        student_name: optionalName || realName,
        avatar_url: profile?.avatar_url,
        mistake_description: mistakeDescription,
        is_best_of_week: false
      });

    if (error) {
      console.error('Mistake insert error:', error.message);
    } else if (user) {
      const studentName = optionalName || realName;
      await supabase.from('student_activity_log').insert({
        student_id: user.id,
        student_name: studentName,
        action: 'شارك بخطأ جميل',
        model: 'beautiful_mistakes'
      });
      
      const { data: currentStats } = await supabase.from('student_stats').select('mistakes_submitted').eq('student_id', user.id).eq('model', 'beautiful_mistakes').maybeSingle();
      await supabase.from('student_stats').upsert({
        student_id: user.id,
        student_name: studentName,
        model: 'beautiful_mistakes',
        mistakes_submitted: (currentStats?.mistakes_submitted || 0) + 1,
        last_activity_at: new Date().toISOString()
      }, { onConflict: 'student_id,model' });
    }
  };

  const selectMistakeOfWeek = async () => {
    if (!teacherSelectedMistake) return;

    await supabase
      .from('beautiful_mistakes')
      .update({ is_best_of_week: false })
      .neq('id', '00000000-0000-0000-0000-000000000000');

    const { error } = await supabase
      .from('beautiful_mistakes')
      .update({ is_best_of_week: true })
      .eq('id', teacherSelectedMistake);

    if (error) {
      console.error('Error selecting mistake of week:', error);
      return;
    }

    await fetchMistakes();
    setTeacherSelectedMistake(null);
    setShowCelebration(true);
    setTimeout(() => setShowCelebration(false), 5000);
  };

  const deleteMistake = async (mistakeId: string) => {
    setMistakes(prev => prev.filter(m => m.id !== mistakeId));

    const { error } = await supabase
      .from('beautiful_mistakes')
      .update({ is_deleted: true })
      .eq('id', mistakeId);

    if (error) {
      console.error('Error deleting mistake:', error);
      return;
    }

    await fetchMistakes();
  };

  const deleteAllMistakes = async () => {
    const { error } = await supabase
      .from('beautiful_mistakes')
      .update({ is_deleted: true })
      .eq('is_deleted', false);

    if (error) {
      console.error('Error deleting all mistakes:', error);
      return;
    }

    await fetchMistakes();
  };

  const clearMistakeOfWeek = async () => {
    if (!selectedMistake) return;

    setSelectedMistake(null);

    const { error } = await supabase
      .from('beautiful_mistakes')
      .update({ is_best_of_week: false })
      .eq('id', selectedMistake.id);

    if (error) {
      console.error('Error clearing mistake of week:', error);
      return;
    }

    await fetchMistakes();
  };

  const handleSelectMistake = (id: string) => {
    if (profile?.role === 'teacher') {
      setTeacherSelectedMistake(id);
    }
  };

  const todayCount = mistakes.filter(m => {
    const d = new Date(m.submitted_at);
    const now = new Date();
    return d.toDateString() === now.toDateString();
  }).length;

  return (
    <div className="bm-i-page" style={{ direction: dir }}>
      <WorkspaceHeader
        title={t('beautifulMistakes.interactive.hero.title')}
        subtitle={t('beautifulMistakes.interactive.hero.subtitle')}
        backLabel={t('nav.backToExplanation')}
        mistakesCount={mistakes.length}
        mistakesCountLabel={t('beautifulMistakes.hero.mistakesCount')}
        isMobile={isMobile}
        dir={dir}
      />

      <motion.div
        className="bm-i-workspace"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Left Column - Submit + Stats */}
        <motion.div className="bm-i-left" variants={itemVariants}>
          <div className="bm-i-panel bm-i-submit">
            <MistakeCard onAddMistake={addMistake} />
          </div>

          {(profile?.role === 'teacher' || profile?.role === 'admin') && (
            <div className="bm-i-panel">
              <div className="bm-i-stats">
                <div className="bm-i-stat">
                  <div className="bm-i-stat-icon bm-i-stat-icon--primary">
                    <Hash size={14} strokeWidth={2} />
                  </div>
                  <div className="bm-i-stat-value">{mistakes.length}</div>
                  <div className="bm-i-stat-label">{t('beautifulMistakes.hero.mistakesCount')}</div>
                </div>
                <div className="bm-i-stat">
                  <div className="bm-i-stat-icon bm-i-stat-icon--success">
                    <Clock size={14} strokeWidth={2} />
                  </div>
                  <div className="bm-i-stat-value">{todayCount}</div>
                  <div className="bm-i-stat-label">Today</div>
                </div>
                <div className="bm-i-stat">
                  <div className="bm-i-stat-icon bm-i-stat-icon--warning">
                    <TrendingUp size={14} strokeWidth={2} />
                  </div>
                  <div className="bm-i-stat-value">{selectedMistake ? 1 : 0}</div>
                  <div className="bm-i-stat-label">Featured</div>
                </div>
                <div className="bm-i-stat">
                  <div className="bm-i-stat-icon bm-i-stat-icon--accent">
                    <Sparkles size={14} strokeWidth={2} />
                  </div>
                  <div className="bm-i-stat-value">{mistakes.length > 0 ? Math.round((todayCount / Math.max(mistakes.length, 1)) * 100) : 0}%</div>
                  <div className="bm-i-stat-label">Activity</div>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Center Column - Board */}
        <motion.div className="bm-i-center" variants={itemVariants}>
          <MistakeBoard
            mistakes={mistakes}
            boardTitle={t('beautifulMistakes.interactive.boardTitle')}
            deleteLabel={t('beautifulMistakes.interactive.delete')}
            markedLabel={t('beautifulMistakes.interactive.markedForSelection')}
            noMistakesLabel={t('beautifulMistakes.interactive.noMistakes')}
            noMistakesDesc={t('beautifulMistakes.interactive.noMistakesDesc')}
            isMobile={isMobile}
            isTeacher={profile?.role === 'teacher'}
            teacherSelectedMistake={teacherSelectedMistake}
            onSelectMistake={handleSelectMistake}
            onDeleteMistake={deleteMistake}
            getDisplayName={getDisplayName}
          />
        </motion.div>

        {/* Right Column - Spotlight + Actions */}
        <motion.div className="bm-i-right" variants={itemVariants}>
          <MistakeSpotlight
            selectedMistake={selectedMistake}
            spotlightTitle={t('beautifulMistakes.interactive.mistakeOfWeekTitle')}
            spotlightNone={t('beautifulMistakes.interactive.mistakeOfWeekNone')}
            selectLabel={t('beautifulMistakes.interactive.selectMistakeOfWeek')}
            clearLabel={t('beautifulMistakes.interactive.clear')}
            isMobile={isMobile}
            isTeacher={profile?.role === 'teacher'}
            hasTeacherSelection={!!teacherSelectedMistake}
            onSelectMistakeOfWeek={selectMistakeOfWeek}
            onClearMistakeOfWeek={clearMistakeOfWeek}
            getDisplayName={getDisplayName}
          />

          <FloatingActions
            deleteBoardLabel={t('beautifulMistakes.interactive.deleteBoard')}
            backLabel={t('beautifulMistakes.interactive.backToExplanation')}
            isMobile={isMobile}
            isTeacher={profile?.role === 'teacher'}
            onDeleteAll={deleteAllMistakes}
          />
        </motion.div>
      </motion.div>

      <CelebrationToast
        show={showCelebration}
        selectedMistake={selectedMistake}
        celebrateTitle={t('beautifulMistakes.interactive.celebrateTitle')}
        celebrateDesc={t('beautifulMistakes.interactive.celebrateDesc')}
        isMobile={isMobile}
        getDisplayName={getDisplayName}
      />

      <style>{`* { box-sizing: border-box; } body { overflow-x: hidden; margin: 0; }`}</style>
    </div>
  );
};

export default function Page() {
  return <BeautifulMistakesInteractive />;
}
