'use client'

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { useUser } from '@/hooks/useUser';
import { useTranslation } from '@/hooks/useTranslation';
import { useTheme } from '@/hooks/useTheme';
import { useSidebar } from '@/providers/DashboardProvider';
import {
  LayoutDashboard,
  Timer,
  Waypoints,
  Sparkles,
  PanelsTopLeft,
  BookOpen,
  House,
  Users,
  PanelRightClose,
  PanelRightOpen,
  X
} from 'lucide-react';

const navIcons: Record<string, React.ReactNode> = {
  '/dashboard': <LayoutDashboard size={18} />,
  '/model-10-10-10': <Timer size={18} />,
  '/support-ladder': <Waypoints size={18} />,
  '/silent-cards': <PanelsTopLeft size={18} />,
  '/beautiful-mistakes': <Sparkles size={18} />,
  '/about': <BookOpen size={18} />,
  '/home': <House size={18} />,
  '/dashboard/team': <Users size={18} />,
};

const Sidebar = () => {
  const pathname = usePathname();
  const { t } = useTranslation();
  const { profile } = useUser();
  const { tokens } = useTheme();
  const { mobileOpen, setMobileOpen, collapsed, setCollapsed } = useSidebar();

  const navGroups = [
    {
      label: t('dashboard.sidebar.overview') || 'نظرة عامة',
      items: [
        { path: '/dashboard', label: t('dashboard') || 'لوحة المعلم' },
      ]
    },
    ...(profile?.role === 'admin' ? [{
      label: t('team.management') || 'إدارة الفريق',
      items: [
        { path: '/dashboard/team', label: t('team.management') || 'إدارة الفريق' },
      ]
    }] : []),
    {
      label: t('dashboard.sidebar.models') || 'النماذج التعليمية',
      items: [
        { path: '/model-10-10-10', label: t('nav.model101010') || '10-10-10' },
        { path: '/support-ladder', label: t('nav.supportLadder') || 'سلم الدعم' },
        { path: '/silent-cards', label: t('nav.silentCards') || 'البطاقات الصامتة' },
        { path: '/beautiful-mistakes', label: t('nav.beautifulMistakes') || 'الأخطاء الجميلة' },
      ]
    },
    {
      label: t('dashboard.sidebar.resources') || 'الموارد',
      items: [
        { path: '/about', label: t('nav.about') || 'حول' },
        { path: '/home', label: t('nav.home') || 'الرئيسية' },
      ]
    }
  ];

  const handleNavClick = () => {
    if (window.innerWidth < 1024) {
      setMobileOpen(false);
    }
  };

  const sidebarContent = (
    <>
      {/* Logo */}
      <div style={{
        padding: collapsed ? '20px 12px' : '20px 20px',
        display: 'flex', alignItems: 'center', gap: '10px',
        borderBottom: `1px solid ${tokens.border}`,
        minHeight: '68px',
        transition: 'padding 0.25s cubic-bezier(0.25,0.1,0.25,1), border-color 0.2s'
      }}>
        <Link href="/home" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }} onClick={handleNavClick}>
          <div style={{ display: 'flex', gap: '2px', flexShrink: 0 }}>
            <div style={{ width: '3px', height: '24px', background: tokens.primary, borderRadius: '2px' }} />
            <div style={{ width: '3px', height: '16px', background: '#818CF8', borderRadius: '2px', alignSelf: 'flex-end' }} />
            <div style={{ width: '3px', height: '10px', background: '#A5B4FC', borderRadius: '2px', alignSelf: 'flex-end' }} />
          </div>
          {!collapsed && (
            <div>
              <div style={{ fontWeight: '800', color: tokens.primaryText, fontSize: '0.95rem', lineHeight: '1.2' }}>Independence</div>
              <div style={{ fontSize: '0.65rem', color: tokens.mutedText, fontWeight: '400' }}>Club Dashboard</div>
            </div>
          )}
        </Link>
      </div>

      {/* Nav Groups */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '12px 8px' }}>
        {navGroups.map((group, gi) => (
          <div key={gi} style={{ marginBottom: gi < navGroups.length - 1 ? '20px' : '0' }}>
            {!collapsed && (
              <div style={{
                fontSize: '0.65rem', fontWeight: '600', color: tokens.mutedText,
                textTransform: 'uppercase', letterSpacing: '0.5px',
                padding: '4px 12px', marginBottom: '6px'
              }}>
                {group.label}
              </div>
            )}
            {group.items.map((item) => {
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  title={collapsed ? item.label : undefined}
                  onClick={handleNavClick}
                  style={{
                    textDecoration: 'none', display: 'flex', alignItems: 'center',
                    gap: '10px', padding: collapsed ? '10px 0' : '10px 12px',
                    borderRadius: '10px', marginBottom: '2px',
                    background: isActive ? tokens.navActive : 'transparent',
                    color: isActive ? tokens.primary : tokens.secondaryText,
                    fontWeight: isActive ? '600' : '500', fontSize: '0.88rem',
                    transition: 'all 0.15s ease',
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    position: 'relative', minHeight: '44px'
                  }}
                >
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active"
                      style={{
                        position: 'absolute', right: collapsed ? '50%' : 0,
                        top: collapsed ? 0 : '50%',
                        transform: collapsed ? 'translateX(50%) translateY(-50%)' : 'translateY(-50%)',
                        width: '3px', height: '20px', background: tokens.navActiveBg, borderRadius: '2px'
                      }}
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
                    {navIcons[item.path] || <LayoutDashboard size={18} />}
                  </span>
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Collapse toggle — desktop only */}
      <div className="sidebar-collapse-toggle" style={{ padding: '12px 8px', borderTop: `1px solid ${tokens.border}` }}>
        <button
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          style={{
            width: '100%', display: 'flex', alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            gap: '10px', padding: '10px 12px', borderRadius: '10px',
            border: 'none', background: 'transparent', color: tokens.mutedText,
            cursor: 'pointer', fontSize: '0.85rem', fontFamily: 'inherit',
            transition: 'all 0.15s ease', minHeight: '44px'
          }}
        >
          {collapsed ? <PanelRightOpen size={18} /> : <PanelRightClose size={18} />}
          {!collapsed && <span>{t('dashboard.sidebar.collapse') || 'طي'}</span>}
        </button>
      </div>
    </>
  );

  return (
    <>
      <aside
        className="db-sidebar"
        style={{
          position: 'fixed', top: '16px', right: '16px', bottom: '16px',
          width: collapsed ? '72px' : '260px',
          background: tokens.sidebar, border: `1px solid ${tokens.border}`,
          borderRadius: '16px', zIndex: 100, display: 'flex',
          flexDirection: 'column', overflow: 'hidden',
          boxShadow: tokens.shadow,
          transform: mobileOpen ? 'translateX(0)' : undefined,
          transition: 'width 0.25s cubic-bezier(0.25,0.1,0.25,1), transform 0.3s cubic-bezier(0.25,0.1,0.25,1), background 0.2s, border-color 0.2s, box-shadow 0.2s'
        }}
      >
        {/* Mobile close button */}
        <button
          className="sidebar-close-btn"
          onClick={() => setMobileOpen(false)}
          aria-label="Close sidebar"
          style={{
            position: 'absolute', top: '12px', left: '12px',
            width: '36px', height: '36px', borderRadius: '10px',
            border: `1px solid ${tokens.border}`, background: tokens.card,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: tokens.secondaryText, zIndex: 10,
            transition: 'all 0.2s'
          }}
        >
          <X size={18} />
        </button>
        {sidebarContent}
      </aside>

      <style>{`
        .db-sidebar { transform: translateX(100%); }
        .sidebar-close-btn { display: none; }
        .sidebar-collapse-toggle { display: none; }
        @media (min-width: 1024px) {
          .db-sidebar { transform: translateX(0); }
          .sidebar-collapse-toggle { display: block; }
        }
        @media (max-width: 1023px) {
          .sidebar-close-btn { display: flex; }
        }
      `}</style>
    </>
  );
};

export default Sidebar;
