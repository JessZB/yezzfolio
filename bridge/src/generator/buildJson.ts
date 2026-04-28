import db from '../db/metadata';
import { translations, TranslationKey } from '../i18n/index';

// Schema mimicking works.[lang].json from Portfolio
export interface WorksData {
  id: string;
  title: string;
  category: string;
  thumbnail: string | null;
  role: string;
  description: string;
  workDone: any[];
}

interface DBProject {
  id: string;
  title_es: string;
  title_en: string;
  category: string;
  thumbnail_drive_id: string;
  role_es: string;
  role_en: string;
  description_es: string;
  description_en: string;
  artist_id: string;
}

const getBridgeUrl = () => process.env.BRIDGE_URL || 'http://localhost:3001';

function translateCategory(cat: string, lang: 'es' | 'en'): string {
  const key = `cat.${cat}` as TranslationKey;
  const bundle = translations[lang] as any;
  return bundle[key] || cat;
}

export function generateWorksJson(artistId: string, lang: 'es' | 'en'): WorksData[] {
  const bridgeUrl = getBridgeUrl();
  const projects = db.prepare('SELECT * FROM projects WHERE artist_id = ? ORDER BY sort_order ASC').all(artistId) as DBProject[];

  return projects.map(proj => {
    const sections = db.prepare('SELECT * FROM work_sections WHERE project_id = ? ORDER BY sort_order ASC').all(proj.id) as any[];
    
    const workDone = sections.map(sec => {
      const items = db.prepare('SELECT * FROM work_items WHERE section_id = ? ORDER BY sort_order ASC').all(sec.id) as any[];
      
      const mappedItems = items.map(item => ({
        title: lang === 'es' ? item.title_es : item.title_en,
        img: item.drive_file_id ? `${bridgeUrl}/api/file/${item.drive_file_id}?artistId=${artistId}` : null,
        desc: lang === 'es' ? item.description_es : item.description_en
      }));
      
      if (sec.type === 'asset-group') {
        return {
          type: 'asset-group',
          groupTitle: lang === 'es' ? sec.title_es : sec.title_en,
          description: lang === 'es' ? sec.description_es : sec.description_en,
          items: mappedItems
        };
      } else if (sec.type === 'gltf-model') {
        return {
          type: 'gltf-model',
          title: lang === 'es' ? sec.title_es : sec.title_en,
          description: lang === 'es' ? sec.description_es : sec.description_en,
          modelUrl: sec.model_drive_id ? `${bridgeUrl}/api/file/${sec.model_drive_id}?artistId=${artistId}` : null
        };
      } else { 
        return {
          type: '3d-model',
          title: lang === 'es' ? sec.title_es : sec.title_en,
          description: lang === 'es' ? sec.description_es : sec.description_en,
          modelPlaceholderColor: 12146341,
          textures: mappedItems.map((i: any) => ({ name: i.title, img: i.img }))
        };
      }
    });

    return {
      id: proj.id,
      title: lang === 'es' ? proj.title_es : proj.title_en,
      category: translateCategory(proj.category, lang),
      thumbnail: proj.thumbnail_drive_id ? `${bridgeUrl}/api/file/${proj.thumbnail_drive_id}?artistId=${artistId}` : null,
      role: lang === 'es' ? proj.role_es : proj.role_en,
      description: lang === 'es' ? proj.description_es : proj.description_en,
      workDone
    };
  });
}

export function generateProfileJson(artistId: string, lang: 'es' | 'en'): any {
  const bridgeUrl = getBridgeUrl();
  const profile = db.prepare('SELECT * FROM artist_profiles WHERE artist_id = ?').get(artistId) as any;
  const artist = db.prepare('SELECT name FROM artists WHERE id = ?').get(artistId) as any;
  const socialsList = db.prepare('SELECT * FROM artist_socials WHERE artist_id = ? AND active = 1 ORDER BY sort_order ASC').all(artistId) as any[];
  const softwareList = db.prepare('SELECT * FROM artist_software WHERE artist_id = ? ORDER BY sort_order ASC').all(artistId) as any[];
  const statsList = db.prepare('SELECT * FROM artist_stats WHERE artist_id = ? ORDER BY sort_order ASC').all(artistId) as any[];

  if (!profile) return null;

  return {
    _version: "1.0.0",
    version: "1.1",
    meta: {
      site_title: lang === 'es' ? profile.site_title_es : profile.site_title_en,
      description: lang === 'es' ? profile.seo_desc_es : profile.seo_desc_en,
      favicon_drive_id: profile.favicon_drive_id,
      avatar_drive_id: profile.avatar_drive_id
    },
    identity: {
      name: artist?.name || "Artista",
      class: lang === 'es' ? profile.class_es : profile.class_en,
      level: profile.level,
      status: lang === 'es' ? profile.status_es : profile.status_en,
      bio: lang === 'es' ? profile.bio_es : profile.bio_en,
      avatar: profile.avatar_drive_id ? `${bridgeUrl}/api/file/${profile.avatar_drive_id}?artistId=${artistId}` : null
    },
    theme: JSON.parse(profile.theme_json || '{}'),
    stats: statsList.map(s => ({
      name: lang === 'es' ? s.name_es : s.name_en,
      value: s.value,
      class: s.css_class
    })),
    software: softwareList.map(sw => ({
      id: sw.id,
      name: sw.name,
      icon: sw.icon_drive_id ? `${bridgeUrl}/api/file/${sw.icon_drive_id}?artistId=${artistId}` : null,
      color: sw.color
    })),
    socials: socialsList.map(soc => ({
      name: soc.name,
      link: soc.link,
      icon: soc.icon_drive_id ? `${bridgeUrl}/api/file/${soc.icon_drive_id}?artistId=${artistId}` : null
    })),
    contact: {
      title: lang === 'es' ? profile.contact_title_es : profile.contact_title_en,
      description: lang === 'es' ? profile.contact_desc_es : profile.contact_desc_en,
      email: profile.contact_email
    }
  };
}
