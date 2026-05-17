import Database from 'better-sqlite3';
import path from 'path';

const db: Database.Database = new Database(path.join(__dirname, '../../portfolio.db'));
db.pragma('journal_mode = WAL');

export function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS artists (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      drive_root_folder_id TEXT,
      google_user_id TEXT UNIQUE,
      refresh_token TEXT,
      preferred_lang TEXT DEFAULT 'es',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      artist_id TEXT REFERENCES artists(id) ON DELETE CASCADE,
      title_es TEXT NOT NULL,
      title_en TEXT,
      category TEXT,
      thumbnail_drive_id TEXT,
      role_es TEXT,
      role_en TEXT,
      description_es TEXT,
      description_en TEXT,
      sort_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS work_sections (
      id TEXT PRIMARY KEY,
      project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
      type TEXT NOT NULL,
      title_es TEXT,
      title_en TEXT,
      description_es TEXT,
      description_en TEXT,
      model_drive_id TEXT,
      sort_order INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS work_items (
      id TEXT PRIMARY KEY,
      section_id TEXT REFERENCES work_sections(id) ON DELETE CASCADE,
      title_es TEXT,
      title_en TEXT,
      drive_file_id TEXT,
      description_es TEXT,
      description_en TEXT,
      sort_order INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS artist_profiles (
      artist_id TEXT PRIMARY KEY REFERENCES artists(id) ON DELETE CASCADE,
      class_es TEXT,
      class_en TEXT,
      level INTEGER DEFAULT 1,
      status_es TEXT,
      status_en TEXT,
      bio_es TEXT,
      bio_en TEXT,
      favicon_drive_id TEXT,
      avatar_drive_id TEXT,
      site_title_es TEXT,
      site_title_en TEXT,
      seo_desc_es TEXT,
      seo_desc_en TEXT,
      contact_title_es TEXT,
      contact_title_en TEXT,
      contact_desc_es TEXT,
      contact_desc_en TEXT,
      contact_email TEXT,
      theme_json TEXT -- Contiene los colores en formato JSON
    );

    CREATE TABLE IF NOT EXISTS artist_socials (
      id TEXT PRIMARY KEY,
      artist_id TEXT REFERENCES artists(id) ON DELETE CASCADE,
      name TEXT,
      link TEXT,
      icon_drive_id TEXT,
      active INTEGER DEFAULT 1,
      sort_order INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS artist_software (
      id TEXT PRIMARY KEY,
      artist_id TEXT REFERENCES artists(id) ON DELETE CASCADE,
      name TEXT,
      icon_drive_id TEXT,
      color TEXT,
      sort_order INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS artist_stats (
      id TEXT PRIMARY KEY,
      artist_id TEXT REFERENCES artists(id) ON DELETE CASCADE,
      name_es TEXT,
      name_en TEXT,
      value INTEGER DEFAULT 0,
      css_class TEXT,
      sort_order INTEGER DEFAULT 0
    );
  `);

  // Migration: Ensure preferred_lang exists
  const info = db.prepare("PRAGMA table_info(artists)").all() as any[];
  const hasLang = info.some(col => col.name === 'preferred_lang');
  if (!hasLang) {
    db.exec("ALTER TABLE artists ADD COLUMN preferred_lang TEXT DEFAULT 'es'");
  }
}

export default db;
