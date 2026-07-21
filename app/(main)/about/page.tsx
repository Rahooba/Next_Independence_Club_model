'use client'

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import { useUser } from '@/hooks/useUser';
import { supabase } from '@/lib/supabase';
import type { TeamMember } from '@/lib/i18n/types';
import {
  ArrowRight,
  ArrowLeft,
  Eye,
  EyeOff,
  Lightbulb,
  AlertTriangle,
  Sparkles,
  TrendingUp,
  CheckCircle2,
  Users,
  School,
  BookOpen,
  Clock,
  GraduationCap,
  Plus,
  Pencil,
  Trash2,
  X,
  Upload,
  Save,
  Loader2,
  GripVertical,
  Image,
} from 'lucide-react';

const ease = [0.22, 1, 0.36, 1] as const;
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };
const fadeUp = { hidden: { opacity: 0, y: 40 }, show: { opacity: 1, y: 0, transition: { duration: 0.7, ease } } };
const scaleUp = { hidden: { opacity: 0, scale: 0.85 }, show: { opacity: 1, scale: 1, transition: { duration: 0.6, ease } } };

const teamColors = ['#2A9D8F', '#F4A261', '#E9C46A', '#E76F51', '#1E3A5F', '#818CF8'];

const About = () => {
  const { t, dir, language } = useTranslation();
  const { profile } = useUser();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canManageTeam = profile?.role === 'admin' || profile?.role === 'teacher';

  // Team data
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [teamLoading, setTeamLoading] = useState(true);

  // Admin CRUD state
  const [showModal, setShowModal] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Form state
  const [formNameAr, setFormNameAr] = useState('');
  const [formNameEn, setFormNameEn] = useState('');
  const [formRoleAr, setFormRoleAr] = useState('');
  const [formRoleEn, setFormRoleEn] = useState('');
  const [formBioAr, setFormBioAr] = useState('');
  const [formBioEn, setFormBioEn] = useState('');
  const [formOrder, setFormOrder] = useState(0);
  const [formVisible, setFormVisible] = useState(true);
  const [formImageUrl, setFormImageUrl] = useState<string | null>(null);
  const [formImageFile, setFormImageFile] = useState<File | null>(null);
  const [formImagePreview, setFormImagePreview] = useState<string | null>(null);

  const fetchTeam = useCallback(async () => {
    let query = supabase
      .from('team_members')
      .select('*');

    if (!canManageTeam) {
      query = query.eq('is_visible', true);
    }

    const { data, error } = await query.order('display_order', { ascending: true });

    if (error) {
      console.error('[About] fetchTeam error:', error.message);
      setTeamMembers([]);
    } else {
      setTeamMembers(data ?? []);
      console.log("Fetched Team:", data);
    }
    setTeamLoading(false);
  }, [canManageTeam]);

  useEffect(() => {
    fetchTeam();
  }, [fetchTeam]);

  useEffect(() => {
    const channel = supabase
      .channel('about-team-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'team_members' },
        () => {
          fetchTeam();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchTeam]);

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const openAddModal = () => {
    setEditingMember(null);
    setFormNameAr('');
    setFormNameEn('');
    setFormRoleAr('');
    setFormRoleEn('');
    setFormBioAr('');
    setFormBioEn('');
    setFormOrder(teamMembers.length);
    setFormVisible(true);
    setFormImageUrl(null);
    setFormImageFile(null);
    setFormImagePreview(null);
    setShowModal(true);
  };

  const openEditModal = (member: TeamMember) => {
    setEditingMember(member);
    setFormNameAr(member.full_name_ar || member.full_name || '');
    setFormNameEn(member.full_name_en || '');
    setFormRoleAr(member.role_ar || member.role || '');
    setFormRoleEn(member.role_en || '');
    setFormBioAr(member.bio_ar || member.bio || '');
    setFormBioEn(member.bio_en || '');
    setFormOrder(member.display_order);
    setFormVisible(member.is_visible);
    setFormImageUrl(member.image_url);
    setFormImageFile(null);
    setFormImagePreview(member.image_url);
    setShowModal(true);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      showToast('File must be under 2MB', 'error');
      return;
    }
    setFormImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setFormImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!formImageFile) return formImageUrl;
    setUploading(true);
    setUploadProgress(0);

    const fileExt = formImageFile.name.split('.').pop();
    const fileName = `team/${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('team-avatars')
      .upload(fileName, formImageFile, {
        cacheControl: '3600',
        upsert: false,
        contentType: formImageFile.type,
      });

    if (error) {
      console.error('[About] Upload failed:', error.message);
      setUploading(false);
      setUploadProgress(0);
      return null;
    }

    setUploadProgress(100);
    const { data: urlData } = supabase.storage
      .from('team-avatars')
      .getPublicUrl(fileName);

    setUploading(false);
    setUploadProgress(0);
    return urlData.publicUrl;
  };

  const handleSave = async () => {
    if (!formNameAr.trim() && !formNameEn.trim()) return;
    setSaving(true);

    let imageUrl = formImageUrl;
    if (formImageFile) {
      imageUrl = await uploadImage();
      if (!imageUrl && formImageFile) {
        setSaving(false);
        return;
      }
    }

    const memberData = {
      full_name: formNameAr.trim() || formNameEn.trim(),
      full_name_ar: formNameAr.trim(),
      full_name_en: formNameEn.trim(),
      role_ar: formRoleAr.trim(),
      role_en: formRoleEn.trim(),
      bio_ar: formBioAr.trim(),
      bio_en: formBioEn.trim(),
      display_order: formOrder,
      is_visible: formVisible,
      image_url: imageUrl,
    };

    if (editingMember) {
      const { error } = await supabase
        .from('team_members')
        .update(memberData)
        .eq('id', editingMember.id);

      if (!error) {
        setShowModal(false);
        showToast(t('team.success'));
      } else {
        showToast(t('team.error'), 'error');
      }
    } else {
      const { error } = await supabase
        .from('team_members')
        .insert(memberData);

      if (!error) {
        setShowModal(false);
        showToast(t('team.success'));
      } else {
        showToast(t('team.error'), 'error');
      }
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    const member = teamMembers.find(m => m.id === id);
    if (member?.image_url && member.image_url.includes('team-avatars')) {
      const urlParts = member.image_url.split('/');
      const path = urlParts.slice(urlParts.indexOf('team')).join('/');
      await supabase.storage.from('team-avatars').remove([path]);
    }

    const { error } = await supabase
      .from('team_members')
      .delete()
      .eq('id', id);

    if (!error) {
      setShowDeleteConfirm(null);
      showToast(t('team.success'));
    } else {
      showToast(t('team.error'), 'error');
    }
  };

  const handleToggleVisibility = async (member: TeamMember) => {
    const { error } = await supabase
      .from('team_members')
      .update({ is_visible: !member.is_visible })
      .eq('id', member.id);

    if (!error) {
      showToast(t('team.success'));
    }
  };

  const handleReorder = async (newOrder: TeamMember[]) => {
    setTeamMembers(newOrder);
    for (let i = 0; i < newOrder.length; i++) {
      await supabase
        .from('team_members')
        .update({ display_order: i })
        .eq('id', newOrder[i].id);
    }
  };

  const results = [
    t('about.results.item1'),
    t('about.results.item2'),
    t('about.results.item3'),
    t('about.results.item4'),
  ];

  // Public view: only show visible members; admin view: show all
  const displayMembers = teamMembers;

  return (
    <div className="about-page" style={{ direction: dir }}>
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="tm-toast"
            style={{ background: toast.type === 'success' ? 'var(--success)' : 'var(--danger)' }}
          >
            {toast.type === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* HERO */}
      <section className="about-hero">
        <div className="about-hero-inner">
          <motion.div variants={stagger} initial="hidden" animate="show">
            <motion.div variants={fadeUp} style={{ marginBottom: 20 }}>
              <Link href="/" className="about-back">
                {dir === 'rtl' ? <ArrowRight size={14} strokeWidth={2} /> : <ArrowLeft size={14} strokeWidth={2} />}
                {t('about.hero.back')}
              </Link>
            </motion.div>

            <motion.div variants={fadeUp} className="about-hero-badge">
              <GraduationCap size={13} strokeWidth={2.5} />
              Independence Club
            </motion.div>

            <motion.h1 variants={fadeUp} className="about-hero-title">
              {t('about.hero.title')} <span>{t('logo.title')}</span>
            </motion.h1>

            <motion.p variants={fadeUp} className="about-hero-desc">
              {t('about.hero.subtitle')}
            </motion.p>

            <motion.div variants={fadeUp}>
              <Link href="/home" className="about-hero-cta">
                {t('common.backToHome')}
                {dir === 'rtl' ? <ArrowLeft size={16} strokeWidth={2.5} /> : <ArrowRight size={16} strokeWidth={2.5} />}
              </Link>
            </motion.div>
          </motion.div>

          <motion.div variants={scaleUp} initial="hidden" animate="show" className="about-hero-visual">
            <div className="about-hero-visual-orb">
              <div className="about-hero-visual-ring about-hero-visual-ring--1" />
              <div className="about-hero-visual-ring about-hero-visual-ring--2" />
              <div className="about-hero-visual-ring about-hero-visual-ring--3" />
              <div className="about-hero-visual-center">
                <Sparkles size={32} strokeWidth={1.5} />
              </div>
              <motion.div className="about-hero-orbit-item about-hero-orbit-item--1" animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}>
                <Eye size={18} strokeWidth={2} />
              </motion.div>
              <motion.div className="about-hero-orbit-item about-hero-orbit-item--2" animate={{ x: [0, 8, 0] }} transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}>
                <Lightbulb size={18} strokeWidth={2} />
              </motion.div>
              <motion.div className="about-hero-orbit-item about-hero-orbit-item--3" animate={{ y: [0, 8, 0] }} transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}>
                <TrendingUp size={18} strokeWidth={2} />
              </motion.div>
              <motion.div className="about-hero-orbit-item about-hero-orbit-item--4" animate={{ x: [0, -8, 0] }} transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}>
                <Users size={18} strokeWidth={2} />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="about-inner">
        {/* VISION / PROBLEM / SOLUTION */}
        <section className="about-vps">
          <div className="about-vps-grid">
            {[
              { icon: Eye, title: t('about.vision.title'), desc: t('about.vision.desc'), color: '#2A9D8F' },
              { icon: AlertTriangle, title: t('about.problem.title'), desc: t('about.problem.desc'), color: '#F4A261' },
              { icon: Lightbulb, title: t('about.solution.title'), desc: t('about.solution.desc'), color: '#E9C46A' },
            ].map((card, i) => {
              const Icon = card.icon;
              return (
                <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-40px' }} transition={{ delay: i * 0.1, duration: 0.5, ease }} whileHover={{ y: -6 }} className="about-vps-card">
                  <div className="about-vps-card-accent" style={{ background: card.color }} />
                  <div className="about-vps-card-icon" style={{ background: `linear-gradient(135deg, ${card.color}, ${card.color}cc)` }}>
                    <Icon size={22} strokeWidth={2} />
                  </div>
                  <h3 className="about-vps-card-title">{card.title}</h3>
                  <p className="about-vps-card-desc">{card.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* RESULTS */}
        <section className="about-results">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.6, ease }} className="about-results-band">
            <div className="about-results-content">
              <h3>{t('about.results.title')}</h3>
              <div className="about-results-grid">
                {results.map((item, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: dir === 'rtl' ? 20 : -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 + 0.3, duration: 0.4 }} className="about-results-item">
                    <div className="about-results-item-icon"><CheckCircle2 size={14} strokeWidth={2.5} /></div>
                    <span>{item}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </section>

        {/* PILOT PROGRAM */}
        <section className="about-pilot">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-40px' }} transition={{ duration: 0.5, ease }} style={{ marginBottom: 16 }}>
            <div className="about-section-label"><span>02</span> Pilot Program</div>
          </motion.div>
          <div className="about-pilot-grid">
            {[
              { icon: School, label: t('about.sample.school'), value: t('about.sample.schoolName'), color: '#2A9D8F' },
              { icon: Users, label: t('about.sample.students'), value: t('about.sample.studentsDesc'), color: '#F4A261' },
              { icon: BookOpen, label: t('about.sample.subjects'), value: t('about.sample.subjectsList'), color: '#E9C46A' },
              { icon: Clock, label: t('about.sample.duration'), value: t('about.sample.durationDesc'), color: '#1E3A5F' },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-30px' }} transition={{ delay: i * 0.08, duration: 0.4, ease }} whileHover={{ y: -3 }} className="about-pilot-card">
                  <div className="about-pilot-card-header">
                    <div className="about-pilot-card-icon" style={{ background: `${item.color}10`, color: item.color }}><Icon size={18} strokeWidth={2} /></div>
                    <div className="about-pilot-card-label">{item.label}</div>
                  </div>
                  <p className="about-pilot-card-value">{item.value}</p>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* TEAM */}
        <section className="about-team">
          {/* Team Header with Admin Add Button */}
          <div className="about-team-head">
            <div className="about-section-label" style={{ justifyContent: 'center' }}>
              <span>03</span> Team
            </div>
            <div className="about-team-title-row">
              <h2 className="about-team-title">{t('about.team.title')}</h2>
              {canManageTeam && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={openAddModal}
                  className="tm-add-btn"
                >
                  <Plus size={16} strokeWidth={2.5} />
                  {t('team.addMember')}
                </motion.button>
              )}
            </div>
            <p className="about-team-sub">{t('about.team.hpIdea')}</p>
          </div>

          {teamLoading ? (
            <div className="about-team-grid">
              {[1, 2, 3].map((i) => (
                <div key={i} className="about-profile-skeleton">
                  <div className="about-profile-skeleton-inner">
                    <div className="about-skeleton-circle" />
                    <div className="about-skeleton-line" style={{ width: '55%', marginBottom: 8 }} />
                    <div className="about-skeleton-line" style={{ width: '35%', marginBottom: 16 }} />
                    <div className="about-skeleton-line" style={{ width: '90%', marginBottom: 6 }} />
                    <div className="about-skeleton-line" style={{ width: '75%' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : displayMembers.length === 0 ? (
            <div className="about-team-empty">
              <div className="about-team-empty-icon">
                <Users size={24} strokeWidth={1.5} />
              </div>
              {canManageTeam ? (
                <>
                  <p>{t('team.noMembers')}</p>
                  <button onClick={openAddModal} className="tm-add-btn" style={{ marginTop: 12 }}>
                    <Plus size={16} strokeWidth={2.5} />
                    {t('team.addMember')}
                  </button>
                </>
              ) : (
                <p>{t('team.noMembers')}</p>
              )}
            </div>
          ) : canManageTeam ? (
            /* Admin View: Reorderable list */
            <Reorder.Group
              axis="y"
              values={displayMembers}
              onReorder={handleReorder}
              className="about-team-reorder-list"
            >
              {displayMembers.map((member, i) => {
                const color = teamColors[i % teamColors.length];
                return (
                  <Reorder.Item
                    key={member.id}
                    value={member}
                    className="about-team-reorder-item"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.4, ease }}
                    whileDrag={{ scale: 1.02, boxShadow: '0 12px 40px rgba(0,0,0,0.15)', zIndex: 50 }}
                  >
                    <div className="about-team-drag-handle">
                      <GripVertical size={16} />
                    </div>

                    <div className="about-profile-card" style={{ flex: 1 }}>
                      <div className="about-profile-glow" style={{ background: `linear-gradient(135deg, ${color}20, ${color}08, transparent)` }} />
                      <div className="about-profile-card-inner">
                        <div className="about-profile-avatar-wrap">
                          <div className="about-profile-avatar-ring" />
                          {member.image_url ? (
                            <img src={member.image_url} alt={member.full_name} className="about-profile-avatar" />
                          ) : (
                            <div className="about-profile-avatar-fallback" style={{ background: `linear-gradient(135deg, ${color}, ${color}bb)` }}>
                              {(language === 'ar' ? (member.full_name_ar || member.full_name) : (member.full_name_en || member.full_name_ar || member.full_name)).charAt(0)}
                            </div>
                          )}
                        </div>
                        <h4 className="about-profile-name">{language === 'ar' ? (member.full_name_ar || member.full_name) : (member.full_name_en || member.full_name_ar || member.full_name)}</h4>
                        {(language === 'ar' ? (member.role_ar || member.role) : (member.role_en || member.role_ar || member.role)) && (
                          <div className="about-profile-role" style={{ background: `${color}10`, color }}>
                            <span className="about-profile-role-dot" style={{ background: color }} />
                            {language === 'ar' ? (member.role_ar || member.role) : (member.role_en || member.role_ar || member.role)}
                          </div>
                        )}
                        {(language === 'ar' ? (member.bio_ar || member.bio) : (member.bio_en || member.bio_ar || member.bio)) && (
                          <p className="about-profile-bio">{language === 'ar' ? (member.bio_ar || member.bio) : (member.bio_en || member.bio_ar || member.bio)}</p>
                        )}
                      </div>
                    </div>

                    {/* Admin Controls */}
                    <div className="about-team-admin-controls">
                      <span className={`tm-card-badge ${member.is_visible ? 'tm-card-badge--visible' : 'tm-card-badge--hidden'}`}>
                        {member.is_visible ? <Eye size={10} /> : <EyeOff size={10} />}
                        {member.is_visible ? t('team.visible') : t('team.hidden')}
                      </span>
                      <div className="about-team-admin-actions">
                        <button onClick={() => handleToggleVisibility(member)} className="tm-card-action" title={member.is_visible ? 'Hide' : 'Show'}>
                          {member.is_visible ? <Eye size={14} /> : <EyeOff size={14} />}
                        </button>
                        <button onClick={() => openEditModal(member)} className="tm-card-action" title={t('common.edit')}>
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => setShowDeleteConfirm(member.id)} className="tm-card-action tm-card-action--danger" title={t('common.delete')}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </Reorder.Item>
                );
              })}
            </Reorder.Group>
          ) : (
            /* Public View: Masonry grid */
            <div className="about-team-grid">
              {displayMembers.map((member, i) => {
                const color = teamColors[i % teamColors.length];
                return (
                  <motion.div
                    key={member.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-20px' }}
                    transition={{ delay: i * 0.08, duration: 0.5, ease }}
                    className="about-profile-card"
                  >
                    <div className="about-profile-glow" style={{ background: `linear-gradient(135deg, ${color}20, ${color}08, transparent)` }} />
                    <div className="about-profile-card-inner">
                      <div className="about-profile-avatar-wrap">
                        <div className="about-profile-avatar-ring" />
                        {member.image_url ? (
                          <img src={member.image_url} alt={member.full_name} className="about-profile-avatar" />
                        ) : (
                          <div className="about-profile-avatar-fallback" style={{ background: `linear-gradient(135deg, ${color}, ${color}bb)` }}>
                            {(language === 'ar' ? (member.full_name_ar || member.full_name) : (member.full_name_en || member.full_name_ar || member.full_name)).charAt(0)}
                          </div>
                        )}
                      </div>
                      <h4 className="about-profile-name">{language === 'ar' ? (member.full_name_ar || member.full_name) : (member.full_name_en || member.full_name_ar || member.full_name)}</h4>
                      {(language === 'ar' ? (member.role_ar || member.role) : (member.role_en || member.role_ar || member.role)) && (
                        <div className="about-profile-role" style={{ background: `${color}10`, color }}>
                          <span className="about-profile-role-dot" style={{ background: color }} />
                          {language === 'ar' ? (member.role_ar || member.role) : (member.role_en || member.role_ar || member.role)}
                        </div>
                      )}
                      {(language === 'ar' ? (member.bio_ar || member.bio) : (member.bio_en || member.bio_ar || member.bio)) && (
                        <p className="about-profile-bio">{language === 'ar' ? (member.bio_ar || member.bio) : (member.bio_en || member.bio_ar || member.bio)}</p>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* ─── ADD/EDIT MODAL ─── */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="tm-modal-overlay"
            onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.25, ease }}
              className="tm-modal"
            >
              <div className="tm-modal-header">
                <h2>{editingMember ? t('team.editMember') : t('team.addMember')}</h2>
                <button onClick={() => setShowModal(false)} className="tm-modal-close"><X size={16} /></button>
              </div>
              <div className="tm-modal-body">
                {/* Image Upload */}
                <div className="tm-form-group">
                  <label className="tm-form-label">{t('team.memberImage')}</label>
                  <div className="tm-upload" onClick={() => !uploading && fileInputRef.current?.click()}>
                    {uploading ? (
                      <div className="tm-upload-progress">
                        <Loader2 size={24} className="tm-spin" />
                        <div className="tm-progress-bar"><div className="tm-progress-fill" style={{ width: `${uploadProgress}%` }} /></div>
                        <span className="tm-progress-text">Uploading...</span>
                      </div>
                    ) : formImagePreview ? (
                      <div className="tm-upload-preview-wrap">
                        <img src={formImagePreview} alt="Preview" className="tm-upload-preview" />
                        <div className="tm-upload-overlay"><Image size={16} /><span>{t('team.changeImage')}</span></div>
                      </div>
                    ) : (
                      <div className="tm-upload-placeholder">
                        <Upload size={24} />
                        <p>{t('team.uploadImage')}</p>
                        <span>JPG, PNG. Max 2MB</span>
                      </div>
                    )}
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageSelect} style={{ display: 'none' }} />
                  {formImagePreview && !uploading && (
                    <button onClick={() => { setFormImageUrl(null); setFormImageFile(null); setFormImagePreview(null); }} className="tm-remove-image">
                      {t('team.removeImage')}
                    </button>
                  )}
                </div>

                <div className="tm-form-group">
                  <label className="tm-form-label">{t('team.memberName')} (AR)</label>
                  <input type="text" value={formNameAr} onChange={(e) => setFormNameAr(e.target.value)} className="tm-form-input" placeholder="الاسم بالعربي" dir="rtl" />
                </div>

                <div className="tm-form-group">
                  <label className="tm-form-label">{t('team.memberName')} (EN)</label>
                  <input type="text" value={formNameEn} onChange={(e) => setFormNameEn(e.target.value)} className="tm-form-input" placeholder="English name" dir="ltr" />
                </div>

                <div className="tm-form-group">
                  <label className="tm-form-label">{t('team.memberRole')} (AR)</label>
                  <input type="text" value={formRoleAr} onChange={(e) => setFormRoleAr(e.target.value)} className="tm-form-input" placeholder="الدور بالعربي" dir="rtl" />
                </div>

                <div className="tm-form-group">
                  <label className="tm-form-label">{t('team.memberRole')} (EN)</label>
                  <input type="text" value={formRoleEn} onChange={(e) => setFormRoleEn(e.target.value)} className="tm-form-input" placeholder="English role" dir="ltr" />
                </div>

                <div className="tm-form-group">
                  <label className="tm-form-label">{t('team.memberBio')} (AR)</label>
                  <textarea value={formBioAr} onChange={(e) => setFormBioAr(e.target.value)} className="tm-form-textarea" placeholder="السيرة الذاتية بالعربي" dir="rtl" rows={3} />
                </div>

                <div className="tm-form-group">
                  <label className="tm-form-label">{t('team.memberBio')} (EN)</label>
                  <textarea value={formBioEn} onChange={(e) => setFormBioEn(e.target.value)} className="tm-form-textarea" placeholder="English bio" dir="ltr" rows={3} />
                </div>

                <div className="tm-form-row">
                  <div className="tm-form-group">
                    <label className="tm-form-label">{t('team.displayOrder')}</label>
                    <input type="number" value={formOrder} onChange={(e) => setFormOrder(parseInt(e.target.value) || 0)} className="tm-form-input" min={0} />
                  </div>
                  <div className="tm-form-group">
                    <label className="tm-form-label">{t('team.isVisible')}</label>
                    <div className="tm-form-toggle" onClick={() => setFormVisible(!formVisible)}>
                      <div className={`tm-form-toggle-track ${formVisible ? 'tm-form-toggle-track--on' : ''}`}>
                        <div className="tm-form-toggle-thumb" />
                      </div>
                      <span className="tm-form-toggle-label">{formVisible ? t('team.visible') : t('team.hidden')}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="tm-modal-footer">
                <button onClick={() => setShowModal(false)} className="tm-btn tm-btn--secondary">{t('team.cancel')}</button>
                <button onClick={handleSave} disabled={saving || uploading || (!formNameAr.trim() && !formNameEn.trim())} className="tm-btn tm-btn--primary">
                  {saving ? <Loader2 size={14} className="tm-spin" /> : <Save size={14} />}
                  {saving ? '...' : t('team.saveMember')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── DELETE CONFIRMATION ─── */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="tm-modal-overlay"
            onClick={(e) => { if (e.target === e.currentTarget) setShowDeleteConfirm(null); }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="tm-modal"
              style={{ maxWidth: 400 }}
            >
              <div className="tm-modal-body" style={{ textAlign: 'center', padding: '28px 24px' }}>
                <div className="tm-delete-icon"><Trash2 size={22} /></div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 8px' }}>{t('common.delete')}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>{t('team.confirmDelete')}</p>
              </div>
              <div className="tm-modal-footer" style={{ justifyContent: 'center' }}>
                <button onClick={() => setShowDeleteConfirm(null)} className="tm-btn tm-btn--secondary">{t('team.cancel')}</button>
                <button onClick={() => handleDelete(showDeleteConfirm)} className="tm-btn tm-btn--danger">
                  <Trash2 size={14} />
                  {t('common.delete')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function Page() {
  return <About />;
}
