'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { useTranslation } from '@/hooks/useTranslation'
import { useTheme } from '@/hooks/useTheme'
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
} from 'lucide-react'

export default function LoginPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const { tokens } = useTheme()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    if (authData.user) {
      router.push('/home')
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      direction: 'rtl', padding: 'clamp(20px, 4vw, 40px)',
      background: tokens.bg, position: 'relative', overflow: 'hidden',
    }}>
      {/* Background Decorations */}
      <motion.div
        animate={{ scale: [1, 1.1, 1], opacity: [0.08, 0.15, 0.08] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute', top: '-15%', right: '-10%',
          width: '500px', height: '500px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(79,70,229,0.1), transparent 70%)',
          filter: 'blur(60px)', pointerEvents: 'none',
        }}
      />
      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.06, 0.12, 0.06] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
        style={{
          position: 'absolute', bottom: '-10%', left: '-5%',
          width: '400px', height: '400px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(244,162,97,0.08), transparent 70%)',
          filter: 'blur(60px)', pointerEvents: 'none',
        }}
      />

      {/* Grid Pattern */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: `radial-gradient(circle at 1px 1px, ${tokens.border}22 1px, transparent 0)`,
        backgroundSize: '40px 40px', opacity: 0.5,
      }} />

      {/* Form Card */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        style={{
          width: '100%', maxWidth: '420px',
          background: tokens.card,
          border: `1px solid ${tokens.border}`,
          borderRadius: '24px',
          padding: 'clamp(28px, 4vw, 40px)',
          boxShadow: '0 8px 40px rgba(0,0,0,0.06)',
          position: 'relative', zIndex: 1,
        }}
      >
          {/* Form Header */}
          <div style={{ marginBottom: '32px' }}>
            <div style={{
              width: '52px', height: '52px', borderRadius: '14px',
              background: 'rgba(79,70,229,0.08)', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              marginBottom: '20px', color: tokens.primary,
            }}>
              <Lock size={24} />
            </div>
            <h1 style={{
              fontSize: '1.6rem', fontWeight: '800', color: tokens.primaryText,
              margin: '0 0 8px', letterSpacing: '-0.02em',
            }}>
              {t('auth.login.title')}
            </h1>
            <p style={{ color: tokens.mutedText, fontSize: '0.92rem', margin: 0 }}>
              {t('auth.login.noAccount')}{' '}
              <Link href="/auth/register" style={{ color: tokens.primary, fontWeight: '700', textDecoration: 'none' }}>
                {t('auth.login.createAccount')}
              </Link>
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin}>
            {/* Email */}
            <div style={{ marginBottom: '18px' }}>
              <label style={{
                display: 'block', color: tokens.secondaryText,
                fontSize: '0.82rem', fontWeight: '600', marginBottom: '8px',
                textTransform: 'uppercase', letterSpacing: '0.04em',
              }}>
                {t('auth.email')}
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{
                  position: 'absolute', left: '14px', top: '50%',
                  transform: 'translateY(-50%)', color: tokens.mutedText,
                  pointerEvents: 'none',
                }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder={t('auth.emailPlaceholder')}
                  style={{
                    width: '100%', padding: '13px 16px 13px 44px',
                    border: `1.5px solid ${tokens.border}`, borderRadius: '12px',
                    fontSize: '0.95rem', fontFamily: 'inherit',
                    background: tokens.bg, color: tokens.primaryText,
                    outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s',
                    boxSizing: 'border-box',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = tokens.primary
                    e.currentTarget.style.boxShadow = `0 0 0 3px rgba(79,70,229,0.08)`
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = tokens.border
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                />
              </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block', color: tokens.secondaryText,
                fontSize: '0.82rem', fontWeight: '600', marginBottom: '8px',
                textTransform: 'uppercase', letterSpacing: '0.04em',
              }}>
                {t('auth.password')}
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{
                  position: 'absolute', left: '14px', top: '50%',
                  transform: 'translateY(-50%)', color: tokens.mutedText,
                  pointerEvents: 'none',
                }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder={t('auth.passwordPlaceholder')}
                  style={{
                    width: '100%', padding: '13px 48px 13px 44px',
                    border: `1.5px solid ${tokens.border}`, borderRadius: '12px',
                    fontSize: '0.95rem', fontFamily: 'inherit',
                    background: tokens.bg, color: tokens.primaryText,
                    outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s',
                    boxSizing: 'border-box',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = tokens.primary
                    e.currentTarget.style.boxShadow = `0 0 0 3px rgba(79,70,229,0.08)`
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = tokens.border
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute', right: '12px', top: '50%',
                    transform: 'translateY(-50%)', background: 'none',
                    border: 'none', cursor: 'pointer', padding: '4px',
                    color: tokens.mutedText, display: 'flex',
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = tokens.primaryText }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = tokens.mutedText }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{
                    background: 'rgba(239,68,68,0.06)',
                    border: '1px solid rgba(239,68,68,0.15)',
                    color: tokens.danger,
                    padding: '12px 16px', borderRadius: '12px',
                    fontSize: '0.88rem', marginBottom: '20px',
                    textAlign: 'center', fontWeight: '500',
                  }}
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={loading ? {} : { scale: 1.01, y: -1 }}
              whileTap={loading ? {} : { scale: 0.99 }}
              style={{
                width: '100%',
                background: loading
                  ? tokens.mutedText
                  : `linear-gradient(135deg, ${tokens.primary}, ${tokens.primaryHover})`,
                color: '#fff', border: 'none', padding: '14px',
                borderRadius: '12px', fontSize: '0.95rem', fontWeight: '700',
                fontFamily: 'inherit', cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                boxShadow: loading ? 'none' : `0 4px 16px rgba(79,70,229,0.25)`,
                transition: 'box-shadow 0.2s',
              }}
            >
              {loading ? (
                <>
                  <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                  {t('auth.login.submitting')}
                </>
              ) : (
                t('auth.login.submit')
              )}
            </motion.button>
          </form>

          {/* Footer */}
          <div style={{
            marginTop: '24px', paddingTop: '20px',
            borderTop: `1px solid ${tokens.border}`,
            textAlign: 'center',
          }}>
            <p style={{ color: tokens.mutedText, fontSize: '0.82rem', margin: 0 }}>
              {t('auth.register.hasAccount')}{' '}
              <Link href="/auth/register" style={{ color: tokens.primary, fontWeight: '700', textDecoration: 'none' }}>
                {t('auth.login.createAccount')}
              </Link>
            </p>
          </div>
        </motion.div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
