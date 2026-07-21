export type UserRole = 'student' | 'teacher' | 'admin';

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface TeamMember {
  id: string;
  full_name: string;
  role: string;
  bio: string;
  full_name_ar: string;
  full_name_en: string;
  role_ar: string;
  role_en: string;
  bio_ar: string;
  bio_en: string;
  department_ar: string;
  department_en: string;
  image_url: string | null;
  display_order: number;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthUser {
  id: string;
  email: string;
}
