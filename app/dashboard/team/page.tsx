'use client'

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useUser } from '@/hooks/useUser';
import { useTranslation } from '@/hooks/useTranslation';
import { useTheme } from '@/hooks/useTheme';
import type { TeamMember } from '@/lib/i18n/types';
import {
  Users,
  Plus,
  Pencil,
  Trash2,
  X,
  Upload,
  Eye,
  EyeOff,
  GripVertical,
  Search,
  Save,
  CheckCircle2,
  AlertTriangle,
  Image,
  Loader2,
} from 'lucide-react';

const teamColors = ['#2A9D8F', '#F4A261', '#E9C46A', '#E76F51', '#1E3A5F', '#818CF8'];

const ease = [0.22, 1, 0.36, 1] as const;

const TeamManagement = () => {
  const { profile } = useUser();
  const { t, dir, language } = useTranslation();
  const { tokens } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [tableExists, setTableExists] = useState<boolean | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

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

  const canManageTeam = profile?.role === 'admin' || profile?.role === 'teacher';

  useEffect(() => {
    if (!canManageTeam) return;

    const channel = supabase
      .channel('team-members-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'team_members' },
        () => {
          fetchMembers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [canManageTeam]);

  useEffect(() => {
    if (canManageTeam) {
      fetchMembers();
    }
  }, [canManageTeam]);

  const fetchMembers = async () => {
    const { data, error } = await supabase
      .from('team_members')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) {
      console.error('[DashboardTeam] fetchMembers error:', error.message);
      if (error.code === '42P01' || error.message?.includes('does not exist') || error.message?.includes('relation')) {
        setTableExists(false);
      }
      setMembers([]);
      setLoading(false);
      return;
    }

    setMembers(data ?? []);
    setTableExists(true);
    setLoading(false);
  };

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
    setFormOrder(members.length);
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
    reader.onload = (ev) => {
      setFormImagePreview(ev.target?.result as string);
    };
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
      console.error('[DashboardTeam] Upload failed:', error.message);
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
    const member = members.find(m => m.id === id);

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

  const handleReorder = async (newOrder: TeamMember[]) => {
    setMembers(newOrder);

    const updates = newOrder.map((member, index) => ({
      id: member.id,
      display_order: index,
    }));

    for (const update of updates) {
      await supabase
        .from('team_members')
        .update({ display_order: update.display_order })
        .eq('id', update.id);
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

  const filteredMembers = members.filter(m => {
    const q = searchQuery.toLowerCase();
    return (
      m.full_name.toLowerCase().includes(q) ||
      m.full_name_ar?.toLowerCase().includes(q) ||
      m.full_name_en?.toLowerCase().includes(q) ||
      m.role.toLowerCase().includes(q) ||
      m.role_ar?.toLowerCase().includes(q) ||
      m.role_en?.toLowerCase().includes(q)
    );
  });

  if (!canManageTeam) {
    return (
      <div className="tm-page" style={{ direction: dir }}>
        <div style={{ textAlign: 'center', padding: '64px 24px' }}>
          <p style={{ color: tokens.mutedText }}>{t('common.unauthorized')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="tm-page" style={{ direction: dir }}>
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: dir === 'rtl' ? 0 : 0 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="tm-toast"
            style={{
              background: toast.type === 'success' ? '#059669' : '#DC2626',
            }}
          >
            {toast.type === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="tm-header">
        <div className="tm-header-left">
          <h1 style={{ color: tokens.primaryText }}>
            <Users size={22} strokeWidth={2} style={{ verticalAlign: 'middle', marginRight: 10 }} />
            {t('team.management')}
          </h1>
          <p>{members.length} {members.length === 1 ? 'member' : 'members'}</p>
        </div>
        <button onClick={openAddModal} className="tm-add-btn">
          <Plus size={16} strokeWidth={2.5} />
          {t('team.addMember')}
        </button>
      </div>

      {/* Search */}
      {tableExists !== false && (
        <div className="tm-search-bar">
          <Search size={16} />
          <input
            type="text"
            placeholder={t('team.searchMembers')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="tm-search-clear">
              <X size={14} />
            </button>
          )}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="tm-grid">
          {[1, 2, 3].map((i) => (
            <div key={i} className="tm-card tm-card--skeleton">
              <div className="tm-card-skeleton-img" />
              <div className="tm-card-body">
                <div className="tm-skeleton-line" style={{ width: '70%', height: 14 }} />
                <div className="tm-skeleton-line" style={{ width: '40%', height: 10, marginTop: 8 }} />
                <div className="tm-skeleton-line" style={{ width: '90%', height: 10, marginTop: 8 }} />
              </div>
            </div>
          ))}
        </div>
      ) : tableExists === false ? (
        <div className="tm-empty-state">
          <div className="tm-empty-state-icon" style={{ background: 'rgba(239,68,68,0.08)', color: '#DC2626' }}>
            <AlertTriangle size={28} strokeWidth={1.5} />
          </div>
          <h3>Database Table Required</h3>
          <p>
            The <code>team_members</code> table does not exist in your Supabase project.
            Run the following SQL in your Supabase SQL Editor to set it up.
          </p>
          <div className="tm-sql-block">
            <pre>{`CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL DEFAULT '',
  role TEXT DEFAULT '',
  bio TEXT DEFAULT '',
  full_name_ar TEXT DEFAULT '',
  full_name_en TEXT DEFAULT '',
  role_ar TEXT DEFAULT '',
  role_en TEXT DEFAULT '',
  bio_ar TEXT DEFAULT '',
  bio_en TEXT DEFAULT '',
  department_ar TEXT DEFAULT '',
  department_en TEXT DEFAULT '',
  image_url TEXT,
  display_order INTEGER DEFAULT 0,
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access"
  ON team_members FOR SELECT USING (true);

CREATE POLICY "Admin full access"
  ON team_members FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Also create the storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('team-avatars', 'team-avatars', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read access for team-avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'team-avatars');

CREATE POLICY "Admin upload access for team-avatars"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'team-avatars'
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admin delete access for team-avatars"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'team-avatars'
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );`}</pre>
          </div>
          <p className="tm-empty-hint">
            Go to Supabase Dashboard &rarr; SQL Editor &rarr; Paste &rarr; Run
          </p>
        </div>
      ) : filteredMembers.length === 0 && !searchQuery ? (
        <div className="tm-empty-state">
          <div className="tm-empty-state-icon">
            <Users size={28} strokeWidth={1.5} />
          </div>
          <h3>{t('team.noMembers')}</h3>
          <p>{t('team.addMember')}</p>
          <button onClick={openAddModal} className="tm-add-btn" style={{ marginTop: 8 }}>
            <Plus size={16} strokeWidth={2.5} />
            {t('team.addMember')}
          </button>
        </div>
      ) : searchQuery && filteredMembers.length === 0 ? (
        <div className="tm-empty-state">
          <div className="tm-empty-state-icon">
            <Search size={28} strokeWidth={1.5} />
          </div>
          <h3>No results</h3>
          <p>No members match &ldquo;{searchQuery}&rdquo;</p>
        </div>
      ) : (
        <Reorder.Group
          axis="y"
          values={searchQuery ? filteredMembers : members}
          onReorder={(newOrder) => {
            if (searchQuery) {
              const merged = members.map(m => {
                const found = newOrder.find(n => n.id === m.id);
                return found || m;
              });
              handleReorder(merged);
            } else {
              handleReorder(newOrder);
            }
          }}
          className="tm-list"
        >
          {(searchQuery ? filteredMembers : members).map((member, i) => (
            <Reorder.Item
              key={member.id}
              value={member}
              className="tm-card"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03, duration: 0.3, ease }}
              whileDrag={{ scale: 1.02, boxShadow: '0 8px 32px rgba(0,0,0,0.12)', zIndex: 10 }}
            >
              <div className="tm-card-drag">
                <GripVertical size={16} />
              </div>

              {member.image_url ? (
                <img src={member.image_url} alt={member.full_name} className="tm-card-img" />
              ) : (
                <div className="tm-card-avatar" style={{ background: `linear-gradient(135deg, ${teamColors[i % teamColors.length]}, ${teamColors[i % teamColors.length]}cc)` }}>
                  {(language === 'ar' ? (member.full_name_ar || member.full_name) : (member.full_name_en || member.full_name_ar || member.full_name)).charAt(0)}
                </div>
              )}

              <div className="tm-card-body">
                <h4 className="tm-card-name">{language === 'ar' ? (member.full_name_ar || member.full_name) : (member.full_name_en || member.full_name_ar || member.full_name)}</h4>
                {(language === 'ar' ? (member.role_ar || member.role) : (member.role_en || member.role_ar || member.role)) && (
                  <p className="tm-card-role">{language === 'ar' ? (member.role_ar || member.role) : (member.role_en || member.role_ar || member.role)}</p>
                )}
                {(language === 'ar' ? (member.bio_ar || member.bio) : (member.bio_en || member.bio_ar || member.bio)) && (
                  <p className="tm-card-bio">{language === 'ar' ? (member.bio_ar || member.bio) : (member.bio_en || member.bio_ar || member.bio)}</p>
                )}
                <div className="tm-card-meta">
                  <span className={`tm-card-badge ${member.is_visible ? 'tm-card-badge--visible' : 'tm-card-badge--hidden'}`}>
                    {member.is_visible ? <Eye size={10} /> : <EyeOff size={10} />}
                    {member.is_visible ? t('team.visible') : t('team.hidden')}
                  </span>
                  <span className="tm-card-badge tm-card-badge--order">
                    #{member.display_order}
                  </span>
                </div>
              </div>

              <div className="tm-card-actions">
                <button
                  onClick={() => handleToggleVisibility(member)}
                  className="tm-card-action"
                  title={member.is_visible ? 'Hide' : 'Show'}
                >
                  {member.is_visible ? <Eye size={14} /> : <EyeOff size={14} />}
                </button>
                <button
                  onClick={() => openEditModal(member)}
                  className="tm-card-action"
                  title={t('common.edit')}
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(member.id)}
                  className="tm-card-action tm-card-action--danger"
                  title={t('common.delete')}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </Reorder.Item>
          ))}
        </Reorder.Group>
      )}

      {/* Add/Edit Modal */}
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
                <button onClick={() => setShowModal(false)} className="tm-modal-close">
                  <X size={16} />
                </button>
              </div>

              <div className="tm-modal-body">
                {/* Image Upload */}
                <div className="tm-form-group">
                  <label className="tm-form-label">{t('team.memberImage')}</label>
                  <div
                    className="tm-upload"
                    onClick={() => !uploading && fileInputRef.current?.click()}
                  >
                    {uploading ? (
                      <div className="tm-upload-progress">
                        <Loader2 size={24} className="tm-spin" />
                        <div className="tm-progress-bar">
                          <div className="tm-progress-fill" style={{ width: `${uploadProgress}%` }} />
                        </div>
                        <span className="tm-progress-text">Uploading...</span>
                      </div>
                    ) : formImagePreview ? (
                      <div className="tm-upload-preview-wrap">
                        <img src={formImagePreview} alt="Preview" className="tm-upload-preview" />
                        <div className="tm-upload-overlay">
                          <Image size={16} />
                          <span>{t('team.changeImage')}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="tm-upload-placeholder">
                        <Upload size={24} />
                        <p>{t('team.uploadImage')}</p>
                        <span>JPG, PNG. Max 2MB</span>
                      </div>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    style={{ display: 'none' }}
                  />
                  {formImagePreview && !uploading && (
                    <button
                      onClick={() => {
                        setFormImageUrl(null);
                        setFormImageFile(null);
                        setFormImagePreview(null);
                      }}
                      className="tm-remove-image"
                    >
                      {t('team.removeImage')}
                    </button>
                  )}
                </div>

                {/* Name - Arabic */}
                <div className="tm-form-group">
                  <label className="tm-form-label">{t('team.memberName')} (AR)</label>
                  <input
                    type="text"
                    value={formNameAr}
                    onChange={(e) => setFormNameAr(e.target.value)}
                    className="tm-form-input"
                    placeholder="الاسم بالعربي"
                    dir="rtl"
                  />
                </div>

                {/* Name - English */}
                <div className="tm-form-group">
                  <label className="tm-form-label">{t('team.memberName')} (EN)</label>
                  <input
                    type="text"
                    value={formNameEn}
                    onChange={(e) => setFormNameEn(e.target.value)}
                    className="tm-form-input"
                    placeholder="English name"
                    dir="ltr"
                  />
                </div>

                {/* Role - Arabic */}
                <div className="tm-form-group">
                  <label className="tm-form-label">{t('team.memberRole')} (AR)</label>
                  <input
                    type="text"
                    value={formRoleAr}
                    onChange={(e) => setFormRoleAr(e.target.value)}
                    className="tm-form-input"
                    placeholder="الدور بالعربي"
                    dir="rtl"
                  />
                </div>

                {/* Role - English */}
                <div className="tm-form-group">
                  <label className="tm-form-label">{t('team.memberRole')} (EN)</label>
                  <input
                    type="text"
                    value={formRoleEn}
                    onChange={(e) => setFormRoleEn(e.target.value)}
                    className="tm-form-input"
                    placeholder="English role"
                    dir="ltr"
                  />
                </div>

                {/* Bio - Arabic */}
                <div className="tm-form-group">
                  <label className="tm-form-label">{t('team.memberBio')} (AR)</label>
                  <textarea
                    value={formBioAr}
                    onChange={(e) => setFormBioAr(e.target.value)}
                    className="tm-form-textarea"
                    placeholder="السيرة الذاتية بالعربي"
                    dir="rtl"
                    rows={3}
                  />
                </div>

                {/* Bio - English */}
                <div className="tm-form-group">
                  <label className="tm-form-label">{t('team.memberBio')} (EN)</label>
                  <textarea
                    value={formBioEn}
                    onChange={(e) => setFormBioEn(e.target.value)}
                    className="tm-form-textarea"
                    placeholder="English bio"
                    dir="ltr"
                    rows={3}
                  />
                </div>

                {/* Order + Visibility */}
                <div className="tm-form-row">
                  <div className="tm-form-group">
                    <label className="tm-form-label">{t('team.displayOrder')}</label>
                    <input
                      type="number"
                      value={formOrder}
                      onChange={(e) => setFormOrder(parseInt(e.target.value) || 0)}
                      className="tm-form-input"
                      min={0}
                    />
                  </div>
                  <div className="tm-form-group">
                    <label className="tm-form-label">{t('team.isVisible')}</label>
                    <div
                      className="tm-form-toggle"
                      onClick={() => setFormVisible(!formVisible)}
                    >
                      <div className={`tm-form-toggle-track ${formVisible ? 'tm-form-toggle-track--on' : ''}`}>
                        <div className="tm-form-toggle-thumb" />
                      </div>
                      <span className="tm-form-toggle-label">
                        {formVisible ? t('team.visible') : t('team.hidden')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="tm-modal-footer">
                <button onClick={() => setShowModal(false)} className="tm-btn tm-btn--secondary">
                  {t('team.cancel')}
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || uploading || (!formNameAr.trim() && !formNameEn.trim())}
                  className="tm-btn tm-btn--primary"
                >
                  {saving ? <Loader2 size={14} className="tm-spin" /> : <Save size={14} />}
                  {saving ? '...' : t('team.saveMember')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
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
                <div className="tm-delete-icon">
                  <Trash2 size={22} />
                </div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 8px' }}>{t('common.delete')}</h3>
                <p style={{ fontSize: '0.85rem', color: '#94A3B8', margin: 0 }}>{t('team.confirmDelete')}</p>
              </div>
              <div className="tm-modal-footer" style={{ justifyContent: 'center' }}>
                <button onClick={() => setShowDeleteConfirm(null)} className="tm-btn tm-btn--secondary">
                  {t('team.cancel')}
                </button>
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

export default TeamManagement;
