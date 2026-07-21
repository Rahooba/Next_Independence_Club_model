'use client'

import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, User, X, CircleCheck, CircleDashed } from 'lucide-react';

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

interface MistakeSpotlightProps {
  selectedMistake: MistakeType | null;
  spotlightTitle: string;
  spotlightNone: string;
  selectLabel: string;
  clearLabel: string;
  isMobile: boolean;
  isTeacher: boolean;
  hasTeacherSelection: boolean;
  onSelectMistakeOfWeek: () => void;
  onClearMistakeOfWeek: () => void;
  getDisplayName: (mistake: { real_name: string; optional_name: string | null }) => string;
}

export default function MistakeSpotlight({
  selectedMistake,
  spotlightTitle,
  spotlightNone,
  selectLabel,
  clearLabel,
  isMobile,
  isTeacher,
  hasTeacherSelection,
  onSelectMistakeOfWeek,
  onClearMistakeOfWeek,
  getDisplayName,
}: MistakeSpotlightProps) {
  return (
    <div className="bm-i-panel bm-i-spotlight">
      <div className="bm-i-panel-head">
        <h3 className="bm-i-panel-title">
          <Trophy size={13} strokeWidth={2} />
          {spotlightTitle.replace(/[🏆]/g, '').trim()}
        </h3>
      </div>


      <div className="bm-i-spotlight-body">
        <AnimatePresence mode="wait">
          {selectedMistake ? (
            <motion.div
              key={selectedMistake.id}
              initial={{ opacity: 0, y: 10, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.97 }}
              transition={{ duration: 0.35, ease: "easeOut" as const }}
              className="bm-i-spotlight-card"
            >
              {isTeacher && (
                <button onClick={onClearMistakeOfWeek} className="bm-i-spotlight-clear">
                  <X size={11} strokeWidth={2.5} />
                  {clearLabel}
                </button>
              )}
              <div className="bm-i-spotlight-inner">
                {selectedMistake.avatar_url ? (
                  <img src={selectedMistake.avatar_url} alt="" className="bm-i-spotlight-avatar" />
                ) : (
                  <div className="bm-i-spotlight-avatar-ph">
                    <User size={18} strokeWidth={2} />
                  </div>
                )}
                <div className="bm-i-spotlight-text">
                  <p className="bm-i-spotlight-quote">&ldquo;{selectedMistake.mistake_description}&rdquo;</p>
                  <p className="bm-i-spotlight-author">— {getDisplayName(selectedMistake)}</p>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bm-i-spotlight-none"
            >
              <div className="bm-i-spotlight-none-icon">
                <CircleDashed size={22} strokeWidth={1.5} />
              </div>
              <p>{spotlightNone}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {isTeacher && (
        <button
          onClick={onSelectMistakeOfWeek}
          disabled={!hasTeacherSelection}
          className="bm-i-spotlight-select"
        >
          <CircleCheck size={16} strokeWidth={2} />
          {selectLabel}
        </button>
      )}
    </div>
  );
}
