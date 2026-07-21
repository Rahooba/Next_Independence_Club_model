'use client'

import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Trash2, User, Check, Inbox } from 'lucide-react';

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

interface MistakeBoardProps {
  mistakes: MistakeType[];
  boardTitle: string;
  deleteLabel: string;
  markedLabel: string;
  noMistakesLabel: string;
  noMistakesDesc: string;
  isMobile: boolean;
  isTeacher: boolean;
  teacherSelectedMistake: string | null;
  onSelectMistake: (id: string) => void;
  onDeleteMistake: (id: string) => void;
  getDisplayName: (mistake: { real_name: string; optional_name: string | null }) => string;
}

const cardVariants = {
  hidden: { opacity: 0, y: 12, scale: 0.98 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: i * 0.04,
      duration: 0.35,
      ease: "easeOut" as const,
    },
  }),
  exit: {
    opacity: 0,
    scale: 0.96,
    x: 16,
    transition: { duration: 0.2 },
  },
};

export default function MistakeBoard({
  mistakes,
  boardTitle,
  deleteLabel,
  markedLabel,
  noMistakesLabel,
  noMistakesDesc,
  isMobile,
  isTeacher,
  teacherSelectedMistake,
  onSelectMistake,
  onDeleteMistake,
  getDisplayName,
}: MistakeBoardProps) {
  return (
    <div className="bm-i-panel bm-i-board">
      <div className="bm-i-board-head">
        <h3 className="bm-i-board-title">
          <FileText size={16} strokeWidth={2} color="#4F46E5" />
          {boardTitle.replace(/[📌]/g, '').trim()}
        </h3>
        <div className="bm-i-board-actions">
          {isTeacher && mistakes.length > 0 && (
            <button className="bm-i-board-action bm-i-board-action--danger">
              <Trash2 size={12} strokeWidth={2} />
              {deleteLabel}
            </button>
          )}
          <span className="bm-i-panel-badge">{mistakes.length}</span>
        </div>
      </div>

      <div className="bm-i-board-scroll">
        <AnimatePresence mode="popLayout">
          {mistakes.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bm-i-board-empty"
            >
              <div className="bm-i-board-empty-icon">
                <Inbox size={28} strokeWidth={1.5} />
              </div>
              <p>{noMistakesDesc.replace(/🌟/g, '').replace(/<br\/>/g, ' ')}</p>
            </motion.div>
          ) : (
            mistakes.map((m, i) => (
              <motion.div
                key={m.id}
                custom={i}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                onClick={() => {
                  if (isTeacher) {
                    onSelectMistake(m.id);
                  }
                }}
                className={`bm-i-card ${teacherSelectedMistake === m.id && isTeacher ? 'bm-i-card--selected' : ''} ${isTeacher ? 'bm-i-card--teacher' : ''}`}
              >
                <div className="bm-i-card-rail" />
                <div className="bm-i-card-body">
                  <div className="bm-i-card-top">
                    <div className="bm-i-card-user">
                      {m.avatar_url ? (
                        <img src={m.avatar_url} alt="" className="bm-i-card-avatar" />
                      ) : (
                        <div className="bm-i-card-avatar-ph">
                          <User size={14} strokeWidth={2} />
                        </div>
                      )}
                      <span className="bm-i-card-name">{getDisplayName(m)}</span>
                    </div>
                    <div className="bm-i-card-meta">
                      <span className="bm-i-card-time">{new Date(m.submitted_at).toLocaleTimeString()}</span>
                      {isTeacher && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteMistake(m.id);
                          }}
                          className="bm-i-card-del"
                        >
                          <Trash2 size={10} strokeWidth={2} />
                          {deleteLabel}
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="bm-i-card-desc">{m.mistake_description}</p>
                  {teacherSelectedMistake === m.id && isTeacher && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="bm-i-card-tag"
                    >
                      <Check size={10} strokeWidth={2.5} />
                      {markedLabel}
                    </motion.div>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
