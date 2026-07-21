'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { useTranslation } from '@/hooks/useTranslation'
import { useTheme } from '@/hooks/useTheme'
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  KeyRound,
  Home,
  Sparkles,
  CheckCircle2,
  Loader2,
  Shield,
} from 'lucide-react'

const fadeIn = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }
const stagger = { visible: { transition: { staggerChildren: 0.06 } } }

export default function RegisterPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const { tokens } = useTheme()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [accessCode, setAccessCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (password !== confirmPassword) {
      setError(t('auth.register.passwordMismatch'))
      setLoading(false)
      return
    }

    if (!accessCode) {
      setError(t('auth.register.requiredCode'))
      setLoading(false)
      return
    }

    const { data: codeData, error: codeError } = await supabase
      .from('auth_codes')
      .select('role, is_used')
      .eq('code', accessCode)
      .maybeSingle()

    if (codeError || !codeData) {
      setError(t('auth.register.invalidCode'))
      setLoading(false)
      return
    }

    if (codeData.is_used) {
      setError(t('auth.register.usedCode'))
      setLoading(false)
      return
    }

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    if (authData.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          full_name: fullName,
          role: codeData.role,
        })

      if (profileError) {
        setError(profileError.message)
        setLoading(false)
        return
      }

      await supabase
        .from('auth_codes')
        .update({ is_used: true })
        .eq('code', accessCode)

      router.push('/home')
    }
  }

  const passwordStrength = (pw: string) => {
    if (pw.length === 0) return { level: 0, color: tokens.border, label: '' }
    if (pw.length < 6) return { level: 1, color: tokens.danger, label: 'ضعيفة' }
    if (pw.length < 10) return { level: 2, color: tokens.warning, label: 'متوسطة' }
    return { level: 3, color: tokens.success, label: 'قوية' }
  }

  const strength = passwordStrength(password)

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

      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        style={{
          width: '100%', maxWidth: '480px',
          background: tokens.card,
          border: `1px solid ${tokens.border}`,
          borderRadius: '28px',
          overflow: 'hidden',
          boxShadow: '0 12px 48px rgba(0,0,0,0.06)',
          position: 'relative', zIndex: 1,
        }}
      >
        {/* Top Accent Bar */}
        <div style={{
          height: '4px',
          background: `linear-gradient(90deg, ${tokens.primary}, #F4A261, #2A9D8F)`,
        }} />

        {/* Header Area */}
        <div style={{
          padding: 'clamp(24px, 4vw, 36px) clamp(24px, 4vw, 36px) 0',
        }}>
          {/* Top Bar */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginBottom: '24px',
          }}>
            <Link href="/home" style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              color: tokens.mutedText, textDecoration: 'none',
              fontSize: '0.82rem', fontWeight: '600',
              padding: '8px 14px', borderRadius: '10px',
              background: tokens.bg, border: `1px solid ${tokens.border}`,
              transition: 'all 0.2s',
            }}>
              <Home size={14} />
              <span>{t('auth.register.homeLink')}</span>
            </Link>
            <div style={{ display: 'flex', gap: '2px' }}>
              <div style={{ width: '3px', height: '22px', background: '#E76F51', borderRadius: '2px' }} />
              <div style={{ width: '3px', height: '14px', background: '#F4A261', borderRadius: '2px', alignSelf: 'flex-end' }} />
              <div style={{ width: '3px', height: '8px', background: '#E9C46A', borderRadius: '2px', alignSelf: 'flex-end' }} />
            </div>
          </div>

          {/* Title */}
          <motion.div initial="hidden" animate={mounted ? 'visible' : 'hidden'} variants={stagger}>
            <motion.div variants={fadeIn} style={{
              width: '52px', height: '52px', borderRadius: '14px',
              background: 'rgba(42,157,143,0.08)', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              marginBottom: '20px', color: '#2A9D8F',
            }}>
              <User size={24} />
            </motion.div>
            <motion.h1 variants={fadeIn} style={{
              fontSize: 'clamp(1.4rem, 3vw, 1.7rem)', fontWeight: '800',
              color: tokens.primaryText, margin: '0 0 8px',
              letterSpacing: '-0.02em',
            }}>
              {t('auth.register.title')}
            </motion.h1>
            <motion.p variants={fadeIn} style={{
              color: tokens.mutedText, fontSize: '0.9rem', margin: 0,
            }}>
              {t('auth.register.hasAccount')}{' '}
              <Link href="/auth/login" style={{ color: tokens.primary, fontWeight: '700', textDecoration: 'none' }}>
                {t('auth.register.loginLink')}
              </Link>
            </motion.p>
          </motion.div>
        </div>

        {/* Form */}
        <form onSubmit={handleRegister} style={{ padding: 'clamp(24px, 4vw, 36px)' }}>
          <motion.div initial="hidden" animate={mounted ? 'visible' : 'hidden'} variants={stagger}>
            {/* Full Name */}
            <motion.div variants={fadeIn} style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block', color: tokens.secondaryText,
                fontSize: '0.82rem', fontWeight: '600', marginBottom: '8px',
                textTransform: 'uppercase', letterSpacing: '0.04em',
              }}>
                {t('auth.fullName')}
              </label>
              <div style={{ position: 'relative' }}>
                <User size={18} style={{
                  position: 'absolute', left: '14px', top: '50%',
                  transform: 'translateY(-50%)', color: tokens.mutedText,
                  pointerEvents: 'none',
                }} />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  placeholder={t('auth.fullNamePlaceholder')}
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
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(79,70,229,0.08)'
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = tokens.border
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                />
              </div>
            </motion.div>

            {/* Email */}
            <motion.div variants={fadeIn} style={{ marginBottom: '16px' }}>
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
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(79,70,229,0.08)'
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = tokens.border
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                />
              </div>
            </motion.div>

            {/* Password */}
            <motion.div variants={fadeIn} style={{ marginBottom: '16px' }}>
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
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(79,70,229,0.08)'
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
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {/* Password Strength */}
              {password.length > 0 && (
                <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ flex: 1, height: '3px', borderRadius: '2px', background: tokens.border, overflow: 'hidden' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(strength.level / 3) * 100}%` }}
                      style={{ height: '100%', background: strength.color, borderRadius: '2px' }}
                    />
                  </div>
                  <span style={{ fontSize: '0.72rem', fontWeight: '600', color: strength.color }}>
                    {strength.label}
                  </span>
                </div>
              )}
            </motion.div>

            {/* Confirm Password */}
            <motion.div variants={fadeIn} style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block', color: tokens.secondaryText,
                fontSize: '0.82rem', fontWeight: '600', marginBottom: '8px',
                textTransform: 'uppercase', letterSpacing: '0.04em',
              }}>
                {t('auth.confirmPassword')}
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{
                  position: 'absolute', left: '14px', top: '50%',
                  transform: 'translateY(-50%)', color: tokens.mutedText,
                  pointerEvents: 'none',
                }} />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(79,70,229,0.08)'
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = tokens.border
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{
                    position: 'absolute', right: '12px', top: '50%',
                    transform: 'translateY(-50%)', background: 'none',
                    border: 'none', cursor: 'pointer', padding: '4px',
                    color: tokens.mutedText, display: 'flex',
                  }}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {confirmPassword && password !== confirmPassword && (
                <p style={{ color: tokens.danger, fontSize: '0.78rem', marginTop: '6px', fontWeight: '500' }}>
                  {t('auth.register.passwordMismatch')}
                </p>
              )}
            </motion.div>

            {/* Access Code */}
            <motion.div variants={fadeIn} style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block', color: tokens.secondaryText,
                fontSize: '0.82rem', fontWeight: '600', marginBottom: '8px',
                textTransform: 'uppercase', letterSpacing: '0.04em',
              }}>
                {t('auth.register.accessCode')}
              </label>
              <div style={{ position: 'relative' }}>
                <KeyRound size={18} style={{
                  position: 'absolute', left: '14px', top: '50%',
                  transform: 'translateY(-50%)', color: tokens.mutedText,
                  pointerEvents: 'none',
                }} />
                <input
                  type="text"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  required
                  placeholder={t('auth.register.accessCodePlaceholder')}
                  style={{
                    width: '100%', padding: '13px 16px 13px 44px',
                    border: `1.5px solid ${tokens.border}`, borderRadius: '12px',
                    fontSize: '0.95rem', fontFamily: 'inherit',
                    background: tokens.bg, color: tokens.primaryText,
                    outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s',
                    boxSizing: 'border-box', letterSpacing: '0.1em', fontWeight: '600',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#2A9D8F'
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(42,157,143,0.08)'
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = tokens.border
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                />
              </div>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                marginTop: '8px', padding: '8px 12px', borderRadius: '8px',
                background: 'rgba(42,157,143,0.04)', border: '1px solid rgba(42,157,143,0.08)',
              }}>
                <Shield size={14} style={{ color: '#2A9D8F', flexShrink: 0 }} />
                <span style={{ fontSize: '0.75rem', color: tokens.mutedText, lineHeight: '1.4' }}>
                  {t('auth.register.accessCodePlaceholder')}
                </span>
              </div>
            </motion.div>

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
              variants={fadeIn}
              style={{
                width: '100%',
                background: loading
                  ? tokens.mutedText
                  : `linear-gradient(135deg, #2A9D8F, #21867a)`,
                color: '#fff', border: 'none', padding: '14px',
                borderRadius: '12px', fontSize: '0.95rem', fontWeight: '700',
                fontFamily: 'inherit', cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                boxShadow: loading ? 'none' : '0 4px 16px rgba(42,157,143,0.25)',
                transition: 'box-shadow 0.2s',
              }}
            >
              {loading ? (
                <>
                  <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                  {t('auth.register.submitting')}
                </>
              ) : (
                <>
                  <CheckCircle2 size={18} />
                  {t('auth.register.submit')}
                </>
              )}
            </motion.button>
          </motion.div>

          {/* Footer */}
          <div style={{
            marginTop: '24px', paddingTop: '20px',
            borderTop: `1px solid ${tokens.border}`,
            textAlign: 'center',
          }}>
            <p style={{ color: tokens.mutedText, fontSize: '0.82rem', margin: 0 }}>
              {t('auth.register.hasAccount')}{' '}
              <Link href="/auth/login" style={{ color: tokens.primary, fontWeight: '700', textDecoration: 'none' }}>
                {t('auth.register.loginLink')}
              </Link>
            </p>
          </div>
        </form>
      </motion.div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
