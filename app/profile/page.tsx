'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { useTranslation } from '@/hooks/useTranslation'
import { useTheme } from '@/hooks/useTheme'
import {
  GraduationCap,
  Camera,
  Pencil,
  Check,
  X,
  LogOut,
  Home,
  User,
  Mail,
  Shield,
  Calendar,
  Loader2,
  Settings,
  Sparkles,
  Save,
} from 'lucide-react'

const fadeIn = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }
const stagger = { visible: { transition: { staggerChildren: 0.08 } } }

export default function ProfilePage() {
  const { t, dir } = useTranslation()
  const router = useRouter()
  const { tokens, theme } = useTheme()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [isEditingName, setIsEditingName] = useState(false)
  const [newName, setNewName] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [mounted, setMounted] = useState(false)
  const [hovered, setHovered] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    fetchUserAndProfile()
  }, [])

  const fetchUserAndProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/auth/login')
      return
    }

    setUser(user)

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    setProfile(profile)
    setLoading(false)
  }

  const handleAvatarUpload = async (file: File) => {
    if (!user) return

    setUploading(true)

    try {
      const filePath = `${user.id}/avatar.jpg`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true })

      if (uploadError) {
        console.error('Upload error:', uploadError)
        setUploading(false)
        return
      }

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id)

      if (updateError) {
        console.error('Update error:', updateError)
      } else {
        setProfile({ ...profile, avatar_url: publicUrl })
      }
    } catch (error) {
      console.error('Error:', error)
    }

    setUploading(false)
  }

  const getDisplayName = () => {
    if (profile?.full_name) return profile.full_name
    if (user?.email) return user.email.split('@')[0]
    return t('profile.unknown')
  }

  const getRoleBadge = () => {
    const role = profile?.role
    if (role === 'student') return { text: t('profile.role.student'), color: tokens.info, bg: 'rgba(14,165,233,0.08)', icon: <GraduationCap size={14} /> }
    if (role === 'teacher') return { text: t('profile.role.teacher'), color: tokens.success, bg: 'rgba(22,163,74,0.08)', icon: <Shield size={14} /> }
    if (role === 'admin') return { text: t('profile.role.admin'), color: tokens.danger, bg: 'rgba(239,68,68,0.08)', icon: <Shield size={14} /> }
    return { text: t('profile.role.student'), color: tokens.info, bg: 'rgba(14,165,233,0.08)', icon: <GraduationCap size={14} /> }
  }

  const handleSaveName = async () => {
    if (!user || !newName.trim()) return

    const { error } = await supabase
      .from('profiles')
      .update({ full_name: newName.trim() })
      .eq('id', user.id)

    if (error) {
      console.error('Error updating name:', error)
    } else {
      setProfile({ ...profile, full_name: newName.trim() })
      setSuccessMessage(t('profile.nameSaved'))
      setTimeout(() => setSuccessMessage(''), 3000)
      setIsEditingName(false)
    }
  }

  const handleCancelEdit = () => {
    setIsEditingName(false)
    setNewName('')
  }

  const handleEditName = () => {
    setNewName(profile?.full_name || user?.email?.split('@')[0] || '')
    setIsEditingName(true)
  }

  const getJoinDate = () => {
    const createdAt = profile?.created_at || user?.created_at
    if (!createdAt) return ''
    const date = new Date(createdAt)
    const monthNames = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر']
    return `${monthNames[date.getMonth()]} ${date.getFullYear()}`
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: tokens.bg,
      }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <Loader2 size={32} style={{ color: tokens.primary }} />
        </motion.div>
      </div>
    )
  }

  const roleBadge = getRoleBadge()

  return (
    <div style={{
      minHeight: '100vh', background: tokens.bg,
      direction: 'rtl', paddingBottom: '60px',
    }}>
      {/* Hero Section */}
      <div style={{
        position: 'relative', overflow: 'hidden',
        background: `linear-gradient(160deg, #0F172A 0%, #1E3A5F 45%, #2A5F8F 100%)`,
        paddingBottom: '80px',
      }}>
        {/* Grid Pattern */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '60px 60px', pointerEvents: 'none',
        }} />

        {/* Decorative Orbs */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute', top: '-20%', right: '-5%',
            width: '400px', height: '400px', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(244,162,97,0.12), transparent 70%)',
            filter: 'blur(60px)', pointerEvents: 'none',
          }}
        />

        {/* Top Navigation */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{
            position: 'relative', zIndex: 2,
            maxWidth: '1000px', margin: '0 auto',
            padding: '20px clamp(20px, 4vw, 32px)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}
        >
          <Link href="/home" style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            color: 'rgba(255,255,255,0.7)', textDecoration: 'none',
            fontSize: '0.85rem', fontWeight: '600',
            padding: '10px 18px', borderRadius: '12px',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            backdropFilter: 'blur(8px)',
            transition: 'all 0.2s',
          }}>
            <Home size={16} />
            {t('profile.backToHome')}
          </Link>
          <div style={{ display: 'flex', gap: '2px' }}>
            <div style={{ width: '3px', height: '22px', background: '#E76F51', borderRadius: '2px' }} />
            <div style={{ width: '3px', height: '14px', background: '#F4A261', borderRadius: '2px', alignSelf: 'flex-end' }} />
            <div style={{ width: '3px', height: '8px', background: '#E9C46A', borderRadius: '2px', alignSelf: 'flex-end' }} />
          </div>
        </motion.div>

        {/* Profile Info */}
        <motion.div
          initial="hidden"
          animate={mounted ? 'visible' : 'hidden'}
          variants={stagger}
          style={{
            position: 'relative', zIndex: 2,
            maxWidth: '1000px', margin: '0 auto',
            padding: '0 clamp(20px, 4vw, 32px)',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            textAlign: 'center',
          }}
        >
          {/* Avatar */}
          <motion.div
            variants={fadeIn}
            onHoverStart={() => setHovered(true)}
            onHoverEnd={() => setHovered(false)}
            style={{ position: 'relative', marginBottom: '24px' }}
          >
            <motion.div
              animate={hovered ? { scale: 1.03 } : { scale: 1 }}
              transition={{ duration: 0.3 }}
              onClick={() => document.getElementById('avatar-input')?.click()}
              style={{
                width: '120px', height: '120px', borderRadius: '28px',
                background: 'rgba(255,255,255,0.08)',
                borderWidth: '3px', borderStyle: 'solid',
                borderColor: hovered ? 'rgba(244,162,97,0.5)' : 'rgba(255,255,255,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                overflow: 'hidden', cursor: 'pointer',
                position: 'relative', transition: 'border-color 0.3s',
              }}
            >
              {uploading ? (
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'rgba(0,0,0,0.5)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  borderRadius: '25px',
                }}>
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                    <Loader2 size={28} color="#fff" />
                  </motion.div>
                </div>
              ) : profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <GraduationCap size={40} strokeWidth={1.5} color="rgba(255,255,255,0.5)" />
              )}

              {/* Upload Overlay */}
              <AnimatePresence>
                {hovered && !uploading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{
                      position: 'absolute', inset: 0,
                      background: 'rgba(0,0,0,0.5)',
                      display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center', gap: '4px',
                      borderRadius: '25px',
                    }}
                  >
                    <Camera size={20} color="#fff" />
                    <span style={{ color: '#fff', fontSize: '0.7rem', fontWeight: '600' }}>
                      {t('common.changePhoto')}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            <input
              id="avatar-input"
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) {
                  setAvatarFile(file)
                  handleAvatarUpload(file)
                }
              }}
              style={{ display: 'none' }}
            />
          </motion.div>

          {/* Name */}
          <motion.div variants={fadeIn} style={{ marginBottom: '12px' }}>
            {isEditingName ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center' }}>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  autoFocus
                  style={{
                    padding: '10px 16px', borderRadius: '10px',
                    border: '2px solid rgba(255,255,255,0.2)',
                    background: 'rgba(255,255,255,0.08)',
                    color: '#fff', fontSize: '1.3rem', fontWeight: '700',
                    fontFamily: 'inherit', textAlign: 'center',
                    outline: 'none', backdropFilter: 'blur(8px)',
                    width: '280px', maxWidth: '100%',
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveName()
                    if (e.key === 'Escape') handleCancelEdit()
                  }}
                />
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleSaveName}
                  style={{
                    width: '40px', height: '40px', borderRadius: '10px',
                    background: tokens.success, border: 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', color: '#fff',
                  }}
                >
                  <Check size={18} />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleCancelEdit}
                  style={{
                    width: '40px', height: '40px', borderRadius: '10px',
                    background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', color: 'rgba(255,255,255,0.7)',
                  }}
                >
                  <X size={18} />
                </motion.button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center' }}>
                <h1 style={{
                  color: '#fff', fontSize: 'clamp(1.4rem, 3vw, 1.8rem)',
                  fontWeight: '800', margin: 0, letterSpacing: '-0.02em',
                }}>
                  {getDisplayName()}
                </h1>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 15 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleEditName}
                  style={{
                    background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: '8px', padding: '6px', cursor: 'pointer',
                    display: 'flex', color: 'rgba(255,255,255,0.6)',
                    transition: 'all 0.2s',
                  }}
                >
                  <Pencil size={14} />
                </motion.button>
              </div>
            )}
          </motion.div>

          {/* Success Message */}
          <AnimatePresence>
            {successMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                style={{
                  padding: '8px 16px', borderRadius: '8px',
                  background: 'rgba(34,197,94,0.15)',
                  color: '#22C55E', fontSize: '0.85rem', fontWeight: '600',
                  marginBottom: '12px',
                }}
              >
                {successMessage}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Role Badge */}
          <motion.div variants={fadeIn} style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '6px 16px', borderRadius: '100px',
            background: roleBadge.bg, border: `1px solid ${roleBadge.color}22`,
            color: roleBadge.color, fontSize: '0.82rem', fontWeight: '700',
            marginBottom: '12px',
          }}>
            {roleBadge.icon}
            {roleBadge.text}
          </motion.div>

          {/* Email */}
          <motion.p variants={fadeIn} style={{
            color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem',
            margin: 0,
          }}>
            {user?.email}
          </motion.p>
        </motion.div>
      </div>

      {/* Content Cards */}
      <div style={{
        maxWidth: '1000px', margin: '-40px auto 0',
        padding: '0 clamp(20px, 4vw, 32px)',
        position: 'relative', zIndex: 2,
      }}>
        <motion.div
          initial="hidden"
          animate={mounted ? 'visible' : 'hidden'}
          variants={stagger}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(300px, 100%), 1fr))',
            gap: '20px',
          }}
        >
          {/* Personal Information Card */}
          <motion.div variants={fadeIn} style={{
            background: tokens.card,
            border: `1px solid ${tokens.border}`,
            borderRadius: '20px',
            padding: '28px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <div style={{
                width: '42px', height: '42px', borderRadius: '12px',
                background: 'rgba(79,70,229,0.08)', display: 'flex',
                alignItems: 'center', justifyContent: 'center', color: tokens.primary,
              }}>
                <User size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: '700', color: tokens.primaryText, margin: 0 }}>
                  {t('profile.title')}
                </h3>
                <p style={{ fontSize: '0.78rem', color: tokens.mutedText, margin: 0 }}>
                  {t('profile.fullName')}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Full Name */}
              <div style={{
                padding: '16px', borderRadius: '14px',
                background: tokens.bg, border: `1px solid ${tokens.border}`,
              }}>
                <label style={{
                  display: 'block', color: tokens.mutedText,
                  fontSize: '0.75rem', fontWeight: '600', marginBottom: '6px',
                  textTransform: 'uppercase', letterSpacing: '0.04em',
                }}>
                  {t('profile.fullName')}
                </label>
                <div style={{ color: tokens.primaryText, fontSize: '0.95rem', fontWeight: '600' }}>
                  {profile?.full_name || t('profile.unknown')}
                </div>
              </div>

              {/* Email */}
              <div style={{
                padding: '16px', borderRadius: '14px',
                background: tokens.bg, border: `1px solid ${tokens.border}`,
              }}>
                <label style={{
                  display: 'block', color: tokens.mutedText,
                  fontSize: '0.75rem', fontWeight: '600', marginBottom: '6px',
                  textTransform: 'uppercase', letterSpacing: '0.04em',
                }}>
                  {t('profile.email')}
                </label>
                <div style={{ color: tokens.primaryText, fontSize: '0.95rem', fontWeight: '600', direction: 'ltr', textAlign: 'left' }}>
                  {user?.email || t('profile.unknown')}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Account Details Card */}
          <motion.div variants={fadeIn} style={{
            background: tokens.card,
            border: `1px solid ${tokens.border}`,
            borderRadius: '20px',
            padding: '28px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <div style={{
                width: '42px', height: '42px', borderRadius: '12px',
                background: 'rgba(42,157,143,0.08)', display: 'flex',
                alignItems: 'center', justifyContent: 'center', color: '#2A9D8F',
              }}>
                <Settings size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: '700', color: tokens.primaryText, margin: 0 }}>
                  {t('dashboard.sidebar.overview') || 'نظرة عامة'}
                </h3>
                <p style={{ fontSize: '0.78rem', color: tokens.mutedText, margin: 0 }}>
                  Account Details
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Role */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '14px 16px', borderRadius: '12px',
                background: tokens.bg, border: `1px solid ${tokens.border}`,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Shield size={16} style={{ color: roleBadge.color }} />
                  <span style={{ fontSize: '0.88rem', color: tokens.secondaryText, fontWeight: '500' }}>
                    {t('common.teacher') || 'الدور'}
                  </span>
                </div>
                <span style={{
                  fontSize: '0.82rem', fontWeight: '700',
                  color: roleBadge.color, padding: '4px 12px',
                  borderRadius: '8px', background: roleBadge.bg,
                }}>
                  {roleBadge.text}
                </span>
              </div>

              {/* Member Since */}
              {getJoinDate() && (
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '14px 16px', borderRadius: '12px',
                  background: tokens.bg, border: `1px solid ${tokens.border}`,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Calendar size={16} style={{ color: tokens.mutedText }} />
                    <span style={{ fontSize: '0.88rem', color: tokens.secondaryText, fontWeight: '500' }}>
                      {t('profile.memberSince')}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.85rem', fontWeight: '600', color: tokens.primaryText }}>
                    {getJoinDate()}
                  </span>
                </div>
              )}

              {/* Status */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '14px 16px', borderRadius: '12px',
                background: tokens.bg, border: `1px solid ${tokens.border}`,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Sparkles size={16} style={{ color: '#F4A261' }} />
                  <span style={{ fontSize: '0.88rem', color: tokens.secondaryText, fontWeight: '500' }}>
                    الحالة
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{
                    width: '8px', height: '8px', borderRadius: '50%',
                    background: tokens.success,
                  }} />
                  <span style={{ fontSize: '0.82rem', fontWeight: '600', color: tokens.success }}>
                    نشط
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={mounted ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.4 }}
          style={{
            display: 'flex', gap: '12px', marginTop: '24px',
            justifyContent: 'center', flexWrap: 'wrap',
          }}
        >
          <Link href="/home" style={{ textDecoration: 'none' }}>
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '14px 28px', borderRadius: '14px',
                background: tokens.card, border: `1px solid ${tokens.border}`,
                color: tokens.primaryText, fontSize: '0.92rem', fontWeight: '700',
                fontFamily: 'inherit', cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                transition: 'box-shadow 0.2s',
              }}
            >
              <Home size={18} />
              {t('profile.backToHome')}
            </motion.button>
          </Link>

          <motion.button
            onClick={handleLogout}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '14px 28px', borderRadius: '14px',
              background: 'rgba(239,68,68,0.06)',
              border: '1px solid rgba(239,68,68,0.12)',
              color: tokens.danger, fontSize: '0.92rem', fontWeight: '700',
              fontFamily: 'inherit', cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <LogOut size={18} />
            {t('profile.logout')}
          </motion.button>
        </motion.div>
      </div>
    </div>
  )
}
