'use client'

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useUser } from '@/hooks/useUser';
import { useTranslation } from '@/hooks/useTranslation';
import { useTheme } from '@/hooks/useTheme';
import { useDashboard } from '@/providers/DashboardProvider';
import LanguageSwitcher from '@/components/i18n/LanguageSwitcher';
import { Search, User, Bell, Sun, Moon } from 'lucide-react';

const TopBar = () => {
  const { t } = useTranslation();
  const { user, profile } = useUser();
  const { theme, tokens, toggleTheme } = useTheme();
  const { searchTerm, setSearchTerm } = useDashboard();
  const [searchFocused, setSearchFocused] = useState(false);

  const now = new Date();
  const dateStr = now.toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      background: theme === 'dark' ? 'rgba(15,23,42,0.85)' : 'rgba(248,250,252,0.85)',
      backdropFilter: 'blur(12px)',
      borderBottom: `1px solid ${tokens.border}`,
      padding: '0 clamp(12px, 3vw, 32px)',
      transition: 'background 0.2s, border-color 0.2s'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '60px',
        gap: '16px'
      }}>
        {/* Date */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: 0 }}>
          <div style={{ fontSize: '0.78rem', color: tokens.mutedText, fontWeight: '500', transition: 'color 0.2s', whiteSpace: 'nowrap' }}>
            {dateStr}
          </div>
        </div>

        {/* Search — single global student search */}
        <div style={{ flex: '1', maxWidth: '480px' }}>
          <div style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center'
          }}>
            <Search
              size={16}
              style={{
                position: 'absolute',
                left: '12px',
                pointerEvents: 'none',
                color: searchFocused ? tokens.primary : tokens.mutedText,
                transition: 'color 0.2s'
              }}
            />
            <input
              type="text"
              placeholder={t('dashboard.searchPlaceholder') || 'بحث عن طالب...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              style={{
                width: '100%',
                padding: '9px 12px 9px 36px',
                border: `1px solid ${searchFocused ? tokens.primary : tokens.border}`,
                borderRadius: '10px',
                fontSize: '0.85rem',
                fontFamily: 'inherit',
                background: tokens.searchBg,
                color: tokens.primaryText,
                outline: 'none',
                transition: 'all 0.2s ease'
              }}
            />
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Theme Toggle */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleTheme}
            title={theme === 'light' ? 'الوضع الداكن' : 'الوضع الفاتح'}
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '10px',
              background: tokens.kpiBg,
              border: `1px solid ${tokens.border}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: tokens.secondaryText,
              transition: 'all 0.2s'
            }}
          >
            <motion.div
              key={theme}
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
            </motion.div>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '10px',
              background: tokens.kpiBg,
              border: `1px solid ${tokens.border}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: tokens.secondaryText,
              transition: 'all 0.2s'
            }}
          >
            <Bell size={16} />
          </motion.button>

          <LanguageSwitcher />

          {user && (
            <Link href="/profile" style={{ textDecoration: 'none' }}>
              <motion.div whileHover={{ scale: 1.05 }} style={{
                width: '34px',
                height: '34px',
                borderRadius: '10px',
                background: tokens.kpiBg,
                border: `1px solid ${tokens.border}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}>
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <User size={16} style={{ color: tokens.secondaryText }} />
                )}
              </motion.div>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default TopBar;
