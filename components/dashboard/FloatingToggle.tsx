'use client'

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/hooks/useTheme';
import { useSidebar } from '@/providers/DashboardProvider';
import { Menu, X } from 'lucide-react';

const FloatingToggle = () => {
  const { tokens } = useTheme();
  const { mobileOpen, setMobileOpen, collapsed, setCollapsed } = useSidebar();
  const [isDesktop, setIsDesktop] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const check = () => setIsDesktop(window.innerWidth >= 1024);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const handleClick = () => {
    if (isDesktop) {
      setCollapsed(!collapsed);
    } else {
      setMobileOpen(!mobileOpen);
    }
  };

  const isExpanded = isDesktop ? !collapsed : mobileOpen;
  const iconKey = mounted ? (isExpanded ? 'close' : 'menu') : 'menu';

  return (
    <motion.button
      onClick={handleClick}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.94 }}
      aria-label={isExpanded ? 'Close sidebar' : 'Open sidebar'}
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        width: '56px',
        height: '56px',
        borderRadius: '50%',
        background: tokens.primary,
        color: '#FFFFFF',
        border: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        zIndex: 99999,
        boxShadow: '0 4px 20px rgba(0,0,0,0.25), 0 0 0 4px rgba(99,102,241,0.15)',
        outline: 'none',
        transition: 'box-shadow 0.2s ease, background 0.2s ease',
      }}
      onFocus={(e) => {
        e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.25), 0 0 0 4px rgba(99,102,241,0.4)';
      }}
      onBlur={(e) => {
        e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.25), 0 0 0 4px rgba(99,102,241,0.15)';
      }}
    >
      <motion.div
        key={iconKey}
        initial={mounted ? { rotate: -90, opacity: 0 } : false}
        animate={{ rotate: 0, opacity: 1 }}
        exit={{ rotate: 90, opacity: 0 }}
        transition={{ duration: 0.2 }}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        {isExpanded ? <X size={22} /> : <Menu size={22} />}
      </motion.div>
    </motion.button>
  );
};

export default FloatingToggle;
