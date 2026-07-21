'use client'

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Sparkles, Wifi, ArrowRight, Hash } from 'lucide-react';

interface WorkspaceHeaderProps {
  title: string;
  subtitle: string;
  backLabel: string;
  mistakesCount: number;
  mistakesCountLabel: string;
  isMobile: boolean;
  dir: string;
}

export default function WorkspaceHeader({
  title,
  subtitle,
  backLabel,
  mistakesCount,
  mistakesCountLabel,
  isMobile,
  dir,
}: WorkspaceHeaderProps) {
  return (
    <motion.header
      className="bm-i-header"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <div className="bm-i-header-inner">
        <div className="bm-i-header-brand">
          <div className="bm-i-header-icon">
            <Sparkles size={18} strokeWidth={2} />
          </div>
          <div className="bm-i-header-text">
            <h1>{title}</h1>
            <p>{subtitle.replace(/<br\/>/g, ' ').substring(0, 60)}</p>
          </div>
        </div>

        <div className="bm-i-header-chips">
          <div className="bm-i-chip bm-i-chip--live">
            <Wifi size={12} strokeWidth={2.5} />
            <span className="bm-i-chip-dot" />
            Live
          </div>
          <div className="bm-i-chip bm-i-chip--accent">
            <Hash size={12} strokeWidth={2.5} />
            {mistakesCount} {mistakesCountLabel}
          </div>
        </div>

        <Link href="/beautiful-mistakes" className="bm-i-header-back">
          <ArrowRight size={14} strokeWidth={2} />
          {backLabel}
        </Link>
      </div>
    </motion.header>
  );
}
