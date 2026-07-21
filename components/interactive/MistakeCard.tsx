'use client'

import { useState } from 'react';
import Link from 'next/link';
import { useUser } from '@/hooks/useUser';
import { useTranslation } from '@/hooks/useTranslation';
import { Lock, User, Send, PenLine, AtSign } from 'lucide-react';

const MistakeCard = ({ onAddMistake }: {
  onAddMistake: (realName: string, optionalName: string, mistakeDescription: string) => Promise<void>;
}) => {
  const { t } = useTranslation();
  const { user, profile } = useUser();
  const [mistake, setMistake] = useState('');
  const [optionalName, setOptionalName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mistake.trim()) {
      await onAddMistake(profile?.full_name || 'طالب', optionalName, mistake);
      setMistake('');
      setOptionalName('');
    }
  };

  if (!user) {
    return (
      <div style={{
        background: 'var(--card)',
        borderRadius: '14px',
        padding: '40px 24px',
        boxShadow: 'var(--shadow-sm)',
        border: '1px solid var(--border)',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '200px'
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '12px',
          background: 'rgba(79,70,229,0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '16px',
          color: '#4F46E5'
        }}>
          <Lock size={22} strokeWidth={2} />
        </div>
        <h4 style={{ marginBottom: '12px', color: 'var(--text-primary)', fontSize: '0.95rem', fontWeight: 600 }}>{t('mistakeCard.loginToParticipate')}</h4>
        <Link
          href="/auth/login"
          style={{
            background: 'linear-gradient(135deg, #4F46E5, #4338CA)',
            border: 'none',
            padding: '10px 24px',
            borderRadius: '10px',
            cursor: 'pointer',
            fontWeight: 600,
            color: '#fff',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.85rem',
            boxShadow: '0 2px 8px rgba(79,70,229,0.25)',
          }}
        >
          {t('nav.login')}
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{
      background: 'var(--card)',
      borderRadius: '14px',
      padding: '20px',
      boxShadow: 'var(--shadow-sm)',
      border: '1px solid var(--border)'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: '16px',
        paddingBottom: '14px',
        borderBottom: '1px solid var(--border-light)',
        gap: '12px'
      }}>
        {profile?.avatar_url ? (
          <img
            src={profile.avatar_url}
            alt="Avatar"
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              objectFit: 'cover',
              border: '2px solid var(--border)'
            }}
          />
        ) : (
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #4F46E5, #0EA5E9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff'
          }}>
            <User size={18} strokeWidth={2} />
          </div>
        )}
        <div>
          <h4 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '0.88rem', fontWeight: 600 }}>{t('mistakeCard.shareTitle')}</h4>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.75rem' }}>
            {profile?.full_name || 'طالب'}
          </p>
        </div>
      </div>

      <div style={{ position: 'relative', marginBottom: '10px' }}>
        <div style={{
          position: 'absolute',
          left: '12px',
          top: '50%',
          transform: 'translateY(-50%)',
          color: 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center'
        }}>
          <AtSign size={14} strokeWidth={2} />
        </div>
        <input
          type="text"
          placeholder={t('mistakeCard.namePlaceholder')}
          value={optionalName}
          onChange={(e) => setOptionalName(e.target.value)}
          style={{
            width: '100%',
            padding: '10px 12px 10px 34px',
            border: '1px solid var(--input-border)',
            borderRadius: '10px',
            fontFamily: 'inherit',
            fontSize: '0.82rem',
            color: 'var(--text-primary)',
            background: 'var(--input-bg)',
            outline: 'none',
            transition: 'border-color 0.2s ease',
            boxSizing: 'border-box'
          }}
          onFocus={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
          onBlur={(e) => e.currentTarget.style.borderColor = 'var(--input-border)'}
        />
      </div>

      <div style={{ position: 'relative', marginBottom: '12px' }}>
        <div style={{
          position: 'absolute',
          left: '12px',
          top: '12px',
          color: 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center'
        }}>
          <PenLine size={14} strokeWidth={2} />
        </div>
        <textarea
          placeholder={t('mistakeCard.mistakePlaceholder')}
          value={mistake}
          onChange={(e) => setMistake(e.target.value)}
          rows={3}
          style={{
            width: '100%',
            padding: '10px 12px 10px 34px',
            border: '1px solid var(--input-border)',
            borderRadius: '10px',
            fontFamily: 'inherit',
            resize: 'vertical',
            fontSize: '0.82rem',
            color: 'var(--text-primary)',
            background: 'var(--input-bg)',
            outline: 'none',
            transition: 'border-color 0.2s ease',
            boxSizing: 'border-box'
          }}
          onFocus={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
          onBlur={(e) => e.currentTarget.style.borderColor = 'var(--input-border)'}
        />
      </div>

      <button
        type="submit"
        style={{
          background: 'linear-gradient(135deg, #4F46E5, #4338CA)',
          border: 'none',
          padding: '10px 24px',
          borderRadius: '10px',
          cursor: 'pointer',
          fontWeight: 600,
          color: '#fff',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          fontSize: '0.85rem',
          boxShadow: '0 2px 8px rgba(79,70,229,0.25)',
          transition: 'box-shadow 0.2s ease, transform 0.15s ease'
        }}
      >
        <Send size={14} strokeWidth={2} />
        {t('mistakeCard.submit')}
      </button>
    </form>
  );
};

export default MistakeCard;
