export interface Project {
  id: string;
  user_id: string;
  slug: string;
  order: number;
  is_published: boolean;
  category?: string | null;
  thumbnail_drive_id?: string | null;
  role_es?: string | null;
  role_en?: string | null;
  title_es: string;
  title_en: string;
  description_es: string;
  description_en: string;
}

export interface Section {
  id: string;
  project_id: string;
  layout_type: string;
  order: number;
  title_es?: string | null;
  title_en?: string | null;
  description_es?: string | null;
  description_en?: string | null;
  model_drive_id?: string | null;
}

export interface Asset {
  id: string;
  section_id: string;
  drive_id: string;
  type: string;
  order: number;
  config_3d?: any | null;
  title_es?: string | null;
  title_en?: string | null;
  description_es?: string | null;
  description_en?: string | null;
}
