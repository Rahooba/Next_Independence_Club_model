'use client'

import { motion } from 'framer-motion';

const orbitDot = (radius: number, duration: number, delay: number) => ({
  animate: {
    rotate: [0, 360],
  },
  transition: {
    duration,
    repeat: Infinity,
    ease: 'linear' as const,
    delay,
  },
  style: {
    width: radius * 2,
    height: radius * 2,
    position: 'absolute' as const,
    top: `calc(50% - ${radius}px)`,
    left: `calc(50% - ${radius}px)`,
  },
});

export default function GlobalLoading() {
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 99999,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--body-gradient)',
      fontFamily: "'Tajawal', sans-serif",
    }}>
      {/* Subtle background blurs */}
      <div style={{
        position: 'absolute',
        width: 400,
        height: 400,
        borderRadius: '50%',
        background: 'rgba(79, 70, 229, 0.04)',
        top: '10%',
        left: '15%',
        filter: 'blur(80px)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute',
        width: 300,
        height: 300,
        borderRadius: '50%',
        background: 'rgba(244, 162, 97, 0.04)',
        bottom: '15%',
        right: '20%',
        filter: 'blur(60px)',
        pointerEvents: 'none',
      }} />

      {/* Animated SVG composition */}
      <div style={{
        position: 'relative',
        width: 120,
        height: 120,
        marginBottom: 32,
      }}>
        {/* Outer orbit ring */}
        <motion.div
          {...orbitDot(56, 12, 0)}
        >
          <svg width="112" height="112" viewBox="0 0 112 112" fill="none">
            <circle cx="56" cy="56" r="54" stroke="rgba(79,70,229,0.1)" strokeWidth="1" strokeDasharray="4 4" />
          </svg>
        </motion.div>

        {/* Orbiting dot 1 */}
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          style={{
            position: 'absolute',
            inset: 0,
          }}
        >
          <div style={{
            position: 'absolute',
            top: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: '#4F46E5',
            boxShadow: '0 0 12px rgba(79,70,229,0.4)',
          }} />
        </motion.div>

        {/* Middle orbit ring */}
        <motion.div
          animate={{ rotate: [0, -360] }}
          transition={{ duration: 16, repeat: Infinity, ease: 'linear' }}
          style={{
            position: 'absolute',
            inset: 8,
          }}
        >
          <svg width="96" height="96" viewBox="0 0 96 96" fill="none">
            <circle cx="48" cy="48" r="46" stroke="rgba(244,162,97,0.12)" strokeWidth="1" strokeDasharray="3 5" />
          </svg>
        </motion.div>

        {/* Orbiting dot 2 */}
        <motion.div
          animate={{ rotate: [0, -360] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
          style={{
            position: 'absolute',
            inset: 8,
          }}
        >
          <div style={{
            position: 'absolute',
            bottom: 4,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: '#F4A261',
            boxShadow: '0 0 10px rgba(244,162,97,0.4)',
          }} />
        </motion.div>

        {/* Center logo */}
        <motion.div
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 48,
            height: 48,
            borderRadius: 14,
            background: 'linear-gradient(135deg, #4F46E5, #6366F1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 20px rgba(79,70,229,0.25)',
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
            <path d="M6 12v5c3 3 9 3 12 0v-5" />
          </svg>
        </motion.div>
      </div>

      {/* Loading text with animated dots */}
      <div style={{ textAlign: 'center' }}>
        <LoadingText />
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          style={{
            fontSize: 'clamp(0.8rem, 1.2vw, 0.9rem)',
            color: 'var(--text-muted)',
            marginTop: 8,
            fontWeight: 400,
          }}
        >
          Please wait a moment.
        </motion.p>
      </div>
    </div>
  );
}

function LoadingText() {
  return (
    <motion.p
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        fontSize: 'clamp(1.1rem, 2vw, 1.35rem)',
        fontWeight: 700,
        color: 'var(--text-primary)',
        letterSpacing: '-0.01em',
      }}
    >
      <span>Reloading</span>
      <motion.span
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        .
      </motion.span>
      <motion.span
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
      >
        .
      </motion.span>
      <motion.span
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
      >
        .
      </motion.span>
    </motion.p>
  );
}
