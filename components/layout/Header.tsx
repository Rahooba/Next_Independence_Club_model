'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@/hooks/useUser';
import { useTranslation } from '@/hooks/useTranslation';
import LanguageSwitcher from '@/components/i18n/LanguageSwitcher';
import ThemeToggle from '@/components/theme/ThemeToggle';
import {
  House,
  LayoutDashboard,
  Timer,
  Layers3,
  PanelsTopLeft,
  Sparkles,
  BookOpen,
  Menu,
  X,
  User,
  LogIn
} from 'lucide-react';

const navIconMap: Record<string, React.ReactNode> = {
  '/home': <House size={18} strokeWidth={2} />,
  '/dashboard': <LayoutDashboard size={18} strokeWidth={2} />,
  '/model-10-10-10': <Timer size={18} strokeWidth={2} />,
  '/support-ladder': <Layers3 size={18} strokeWidth={2} />,
  '/silent-cards': <PanelsTopLeft size={18} strokeWidth={2} />,
  '/beautiful-mistakes': <Sparkles size={18} strokeWidth={2} />,
  '/about': <BookOpen size={18} strokeWidth={2} />,
};

const Header = () => {
  const pathname = usePathname();
  const { user, profile, loading } = useUser();
  const { t, dir } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(1200);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    setWindowWidth(window.innerWidth);

    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      if (window.innerWidth > 768) {
        setIsMenuOpen(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    document.addEventListener('keydown', handleEscape);

    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isMenuOpen]);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMenuOpen]);

  if (pathname === '/') {
    return null;
  }

  const isMobile = windowWidth < 768;
  const isTablet = windowWidth >= 768 && windowWidth < 1024;

  const navItems = [
    { path: '/home', label: t('nav.home') },
  ];
  if (profile?.role === 'teacher') {
    navItems.push({ path: '/dashboard', label: t('dashboard') });
  }
  navItems.push(
    { path: '/model-10-10-10', label: t('nav.model101010') },
    { path: '/support-ladder', label: t('nav.supportLadder') },
    { path: '/silent-cards', label: t('nav.silentCards') },
    { path: '/beautiful-mistakes', label: t('nav.beautifulMistakes') },
    { path: '/about', label: t('nav.about') }
  );

  return (
    <>
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(16px) saturate(180%)',
        WebkitBackdropFilter: 'blur(16px) saturate(180%)',
        borderBottom: '1px solid var(--border)',
        height: isMobile ? '64px' : '72px',
        transition: 'background 250ms ease, border-color 250ms ease, height 0.2s ease'
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: isMobile ? '0 16px' : '0 24px',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          {/* Logo */}
          <Link href="/home" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
            <div style={{ display: 'flex', gap: '2px', flexShrink: 0 }}>
              <div style={{ width: '3px', height: '28px', background: '#E76F51', borderRadius: '2px' }} />
              <div style={{ width: '3px', height: '18px', background: '#F4A261', borderRadius: '2px', alignSelf: 'flex-end' }} />
              <div style={{ width: '3px', height: '12px', background: '#E9C46A', borderRadius: '2px', alignSelf: 'flex-end' }} />
            </div>
            <div>
              <div style={{
                fontSize: isMobile ? '1rem' : '1.15rem',
                fontWeight: '800',
                color: '#1E3A5F',
                lineHeight: '1.2',
                letterSpacing: '-0.02em'
              }}>
                {t('logo.title')}
              </div>
              <div style={{
                fontSize: isMobile ? '0.6rem' : '0.7rem',
                color: 'var(--text-muted)',
                fontWeight: '500',
                letterSpacing: '0.02em'
              }}>
                {t('logo.subtitle')}
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          {!isMobile && (
            <nav style={{ display: 'flex', alignItems: 'center', gap: isTablet ? '4px' : '6px' }}>
              {navItems.map((item) => {
                const isActive = pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    className="nav-item"
                    style={{
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 14px',
                      borderRadius: '10px',
                      fontSize: isTablet ? '0.82rem' : '0.88rem',
                      fontWeight: isActive ? '600' : '500',
                      color: isActive ? '#E76F51' : 'var(--text-secondary)',
                      background: isActive ? 'rgba(231,111,81,0.08)' : 'transparent',
                      transition: 'all 0.2s ease',
                      whiteSpace: 'nowrap'
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.color = 'var(--text-primary)';
                        e.currentTarget.style.background = 'var(--bg-secondary)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.color = 'var(--text-secondary)';
                        e.currentTarget.style.background = 'transparent';
                      }
                    }}
                  >
                    <span style={{
                      display: 'flex',
                      alignItems: 'center',
                      color: isActive ? '#E76F51' : 'var(--text-muted)',
                      transition: 'color 0.2s ease'
                    }}>
                      {navIconMap[item.path]}
                    </span>
                    {item.label}
                    {isActive && (
                      <motion.div
                        layoutId="nav-active-pill"
                        style={{
                          position: 'absolute',
                          bottom: '-1px',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          width: '20px',
                          height: '3px',
                          borderRadius: '3px',
                          background: '#E76F51'
                        }}
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                    )}
                  </Link>
                );
              })}
            </nav>
          )}

          {/* Right Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {!isMobile && <ThemeToggle />}
            {!isMobile && <LanguageSwitcher />}

            {!isMobile && !loading && (
              <>
                {user ? (
                  <Link href="/profile" style={{ textDecoration: 'none' }}>
                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    background: 'var(--surface-alt)',
                    border: '1.5px solid rgba(244,162,97,0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#F4A261';
                      e.currentTarget.style.transform = 'scale(1.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(244,162,97,0.3)';
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                    >
                      {profile?.avatar_url ? (
                        <img src={profile.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <User size={18} style={{ color: '#F4A261' }} />
                      )}
                    </div>
                  </Link>
                ) : (
                  <Link href="/auth/login" style={{ textDecoration: 'none' }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      background: '#E76F51',
                      color: 'white',
                      padding: '8px 18px',
                      borderRadius: '10px',
                      fontSize: '0.85rem',
                      fontWeight: '600',
                      transition: 'all 0.2s ease'
                    }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#C0533c';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#E76F51';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      <LogIn size={16} />
                      {t('nav.login')}
                    </div>
                  </Link>
                )}
              </>
            )}

            {/* Mobile Hamburger */}
            {isMobile && (
              <button
                onClick={() => setIsMenuOpen(true)}
                aria-label={t('common.menu')}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  border: '1px solid var(--border)',
                  background: 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: 'var(--primary-dark)',
                  transition: 'all 0.2s ease'
                }}
              >
                <Menu size={20} />
              </button>
            )}
          </div>
        </div>

        <style>{`
          .nav-item {
            position: relative;
          }
          .nav-item:hover {
            transform: translateY(-1px);
          }
        `}</style>
      </header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMenuOpen && isMobile && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsMenuOpen(false)}
              style={{
                position: 'fixed',
                inset: 0,
                background: 'var(--overlay)',
                zIndex: 999,
                backdropFilter: 'blur(4px)'
              }}
            />

            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              style={{
                position: 'fixed',
                top: 0,
                right: 0,
                bottom: 0,
                width: '85%',
                maxWidth: '320px',
                background: 'var(--surface)',
                zIndex: 1000,
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '-4px 0 24px rgba(0,0,0,0.1)'
              }}
            >
              {/* Drawer Header */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '20px 20px',
                borderBottom: '1px solid var(--border)'
              }}>
                <Link href="/home" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }} onClick={() => setIsMenuOpen(false)}>
                  <div style={{ display: 'flex', gap: '2px', flexShrink: 0 }}>
                    <div style={{ width: '3px', height: '24px', background: '#E76F51', borderRadius: '2px' }} />
                    <div style={{ width: '3px', height: '16px', background: '#F4A261', borderRadius: '2px', alignSelf: 'flex-end' }} />
                    <div style={{ width: '3px', height: '10px', background: '#E9C46A', borderRadius: '2px', alignSelf: 'flex-end' }} />
                  </div>
                  <div>
                    <div style={{ fontWeight: '800', color: '#1E3A5F', fontSize: '0.95rem', lineHeight: '1.2' }}>{t('logo.title')}</div>
                    <div style={{ fontSize: '0.6rem', color: '#9CA3AF', fontWeight: '500' }}>{t('logo.subtitle')}</div>
                  </div>
                </Link>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  aria-label="Close menu"
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    border: '1px solid var(--border)',
                    background: 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: 'var(--text-secondary)'
                  }}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Drawer Nav */}
              <nav style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
                {navItems.map((item, index) => {
                  const isActive = pathname === item.path;
                  return (
                    <motion.div
                      key={item.path}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.04 }}
                    >
                      <Link
                        href={item.path}
                        onClick={() => setIsMenuOpen(false)}
                        style={{
                          textDecoration: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '12px 14px',
                          borderRadius: '12px',
                          marginBottom: '4px',
                          fontSize: '0.95rem',
                          fontWeight: isActive ? '600' : '500',
                          color: isActive ? '#E76F51' : 'var(--text-secondary)',
                          background: isActive ? 'rgba(231,111,81,0.08)' : 'transparent',
                          transition: 'all 0.15s ease'
                        }}
                        onMouseEnter={(e) => {
                          if (!isActive) e.currentTarget.style.background = 'var(--bg-secondary)';
                        }}
                        onMouseLeave={(e) => {
                          if (!isActive) e.currentTarget.style.background = 'transparent';
                        }}
                      >
                        <span style={{ display: 'flex', alignItems: 'center', color: isActive ? '#E76F51' : 'var(--text-muted)' }}>
                          {navIconMap[item.path]}
                        </span>
                        {item.label}
                      </Link>
                    </motion.div>
                  );
                })}
              </nav>

              {/* Drawer Footer */}
              <div style={{ padding: '16px', borderTop: '1px solid var(--border)' }}>
                {!loading && (
                  <>
                    {user ? (
                      <Link href="/profile" onClick={() => setIsMenuOpen(false)} style={{ textDecoration: 'none' }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '12px 14px',
                          borderRadius: '12px',
                          background: 'var(--badge-bg)',
                          marginBottom: '12px'
                        }}>
                          <div style={{
                            width: '38px',
                            height: '38px',
                            borderRadius: '10px',
                            background: 'var(--surface-alt)',
                            border: '1.5px solid rgba(244,162,97,0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: 'hidden',
                            flexShrink: 0
                          }}>
                            {profile?.avatar_url ? (
                              <img src={profile.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              <User size={18} style={{ color: '#F4A261' }} />
                            )}
                          </div>
                          <span style={{ fontWeight: '600', color: 'var(--primary-dark)', fontSize: '0.9rem' }}>{t('nav.profile')}</span>
                        </div>
                      </Link>
                    ) : (
                      <Link href="/auth/login" onClick={() => setIsMenuOpen(false)} style={{ textDecoration: 'none' }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          background: '#E76F51',
                          color: 'white',
                          padding: '12px',
                          borderRadius: '12px',
                          fontSize: '0.9rem',
                          fontWeight: '600',
                          marginBottom: '12px'
                        }}>
                          <LogIn size={18} />
                          {t('nav.login')}
                        </div>
                      </Link>
                    )}
                  </>
                )}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                  <ThemeToggle />
                  <LanguageSwitcher />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;
