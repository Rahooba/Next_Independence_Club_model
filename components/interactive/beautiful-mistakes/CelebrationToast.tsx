'use client'

import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';

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

interface CelebrationToastProps {
  show: boolean;
  selectedMistake: MistakeType | null;
  celebrateTitle: string;
  celebrateDesc: string;
  isMobile: boolean;
  getDisplayName: (mistake: { real_name: string; optional_name: string | null }) => string;
}

export default function CelebrationToast({
  show,
  selectedMistake,
  celebrateTitle,
  celebrateDesc,
  isMobile,
  getDisplayName,
}: CelebrationToastProps) {
  return (
    <AnimatePresence>
      {show && selectedMistake && (
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.96 }}
          transition={{ type: 'spring', stiffness: 140, damping: 22 }}
          className="bm-i-toast"
        >
          <div className="bm-i-toast-icon">
            <Sparkles size={18} strokeWidth={2} />
          </div>
          <div className="bm-i-toast-body">
            <div className="bm-i-toast-title">{celebrateTitle}</div>
            <div className="bm-i-toast-desc">
              {celebrateDesc.replace('{name}', getDisplayName(selectedMistake))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
