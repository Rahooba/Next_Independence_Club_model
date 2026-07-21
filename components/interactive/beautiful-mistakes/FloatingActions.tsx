'use client'

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Trash2, ArrowLeft } from 'lucide-react';

interface FloatingActionsProps {
  deleteBoardLabel: string;
  backLabel: string;
  isMobile: boolean;
  isTeacher: boolean;
  onDeleteAll: () => void;
}

export default function FloatingActions({
  deleteBoardLabel,
  backLabel,
  isMobile,
  isTeacher,
  onDeleteAll,
}: FloatingActionsProps) {
  return (
    <motion.div
      className="bm-i-panel"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.4 }}
    >
      <div className="bm-i-actions-panel">
        {isTeacher && (
          <motion.button
            onClick={onDeleteAll}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            className="bm-i-action-btn bm-i-action-btn--danger"
          >
            <Trash2 size={15} strokeWidth={2} />
            {deleteBoardLabel}
          </motion.button>
        )}

        <Link href="/beautiful-mistakes" className="bm-i-action-btn bm-i-action-btn--primary">
          <ArrowLeft size={15} strokeWidth={2} />
          {backLabel}
        </Link>
      </div>
    </motion.div>
  );
}
