'use client'

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import { Play, Pause, RotateCcw, Check } from 'lucide-react';

function CompleteCheck() {
  return (
    <motion.div className="t-complete" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 14, stiffness: 180 }}>
      <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
        <motion.circle cx="28" cy="28" r="26" stroke="#22C55E" strokeWidth="2" opacity="0.2"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5 }} />
        <motion.circle cx="28" cy="28" r="20" stroke="#22C55E" strokeWidth="1.5" opacity="0.1"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.7, delay: 0.2 }} />
        <motion.path d="M18 28L25 35L38 20" stroke="#22C55E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.4, delay: 0.4 }} />
      </svg>
    </motion.div>
  )
}

export default function Timer({
  duration, onComplete, label, isRunning = false, startedAt,
  onStart, onPause, onReset, isTeacherOrAdmin = false,
}: {
  duration: number;
  onComplete?: () => void;
  label: string;
  isRunning?: boolean;
  startedAt?: string | null;
  onStart?: () => Promise<void>;
  onPause?: () => Promise<void>;
  onReset?: () => Promise<void>;
  isTeacherOrAdmin?: boolean;
}) {
  const { t } = useTranslation();
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isLoading, setIsLoading] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const lastStartedAtRef = useRef<string | null>(null);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (isRunning && startedAt && startedAt !== lastStartedAtRef.current) {
      const elapsedMs = Date.now() - new Date(startedAt).getTime();
      const elapsedSec = Math.floor(elapsedMs / 1000);
      setElapsedSeconds(elapsedSec);
      setTimeLeft(Math.max(0, duration - elapsedSec));
      lastStartedAtRef.current = startedAt;
    }
  }, [isRunning, startedAt, duration]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setElapsedSeconds(p => p + 1);
        setTimeLeft(p => Math.max(0, p - 1));
      }, 1000);
    } else if (isRunning && timeLeft === 0) {
      onCompleteRef.current?.();
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  useEffect(() => {
    if (!isRunning) setTimeLeft(Math.max(0, duration - elapsedSeconds));
  }, [isRunning, elapsedSeconds, duration]);

  const doAction = async (fn?: () => Promise<void>) => {
    if (!fn) return;
    setIsLoading(true);
    try { await fn(); } finally { setIsLoading(false); }
  };

  const handleStart = () => doAction(onStart);
  const handlePause = () => doAction(onPause);
  const handleReset = async () => {
    setIsLoading(true);
    try {
      await onReset?.();
      setElapsedSeconds(0);
      setTimeLeft(duration);
    } finally { setIsLoading(false); }
  };

  const progress = duration > 0 ? (duration - timeLeft) / duration : 0;
  const isComplete = timeLeft === 0 && !isRunning;
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const pct = Math.round(progress * 100);

  return (
    <div className="t-wrap2">
      <div className="t-glow2" data-active={isRunning} />

      <div className="t-top">
        <div className="t-label2">{label}</div>
        <div className="t-status2" data-state={isRunning ? 'running' : isComplete ? 'done' : 'idle'}>
          {isComplete ? 'Complete' : isRunning ? t('timer.running') : t('timer.paused')}
        </div>
      </div>

      <div className="t-progress-track">
        <motion.div
          className="t-progress-fill"
          data-complete={isComplete}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
        <div className="t-progress-glow" style={{ left: `${pct}%` }} data-active={isRunning} />
      </div>

      <div className="t-digits-row">
        <AnimatePresence mode="wait">
          {isComplete ? (
            <CompleteCheck key="check" />
          ) : (
            <motion.div key="time" className="t-digits2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <span className="t-min">{minutes.toString().padStart(2, '0')}</span>
              <motion.span className="t-sep2" animate={{ opacity: isRunning ? [1, 0.3, 1] : 0.5 }}
                transition={{ duration: 1, repeat: Infinity }}>:</motion.span>
              <span className="t-sec">{seconds.toString().padStart(2, '0')}</span>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="t-pct2">{pct}%</div>
      </div>

      {isTeacherOrAdmin && (
        <div className="t-actions2">
          {!isRunning && !isComplete && (
            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} onClick={handleStart} disabled={isLoading}
              className="t-btn2 t-btn2--start">
              <Play size={14} fill="currentColor" /> {t('timer.start')}
            </motion.button>
          )}
          {isRunning && (
            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} onClick={handlePause} disabled={isLoading}
              className="t-btn2 t-btn2--pause">
              <Pause size={14} fill="currentColor" /> {t('timer.pause')}
            </motion.button>
          )}
          <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} onClick={handleReset} disabled={isLoading}
            className="t-btn2 t-btn2--reset">
            <RotateCcw size={13} /> {t('timer.reset')}
          </motion.button>
        </div>
      )}
    </div>
  )
}
