import prisma from '../../core/db.js';
import https from 'https';
import { env } from '../../config/env.js';

/**
 * GeneratorService
 * Handles the generation of static JSON payloads for Astro SSG.
 * Ensures 100% compatibility with bridge/ portfolio structure.
 */
export class GeneratorService {
  
  /**
   * Generates the full site payload (Works + Profile) for both languages.
   */
  static async buildFullPayload(userId: string) {
    const bridgeUrl = env.PROXY_BASE_URL || `http://localhost:${env.PORT}/api/drive/proxy`;

    // 1. Fetch all data
    const [user, profile, socials, software, stats, projects] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId } }),
      prisma.profile.findUnique({ where: { user_id: userId } }),
      prisma.social.findMany({ where: { user_id: userId, active: true }, orderBy: { order: 'asc' } }),
      prisma.software.findMany({ where: { user_id: userId }, orderBy: { order: 'asc' } }),
      prisma.stat.findMany({ where: { user_id: userId }, orderBy: { order: 'asc' } }),
      prisma.project.findMany({
        where: { user_id: userId, is_published: true },
        orderBy: { order: 'asc' },
        include: {
          sections: {
            orderBy: { order: 'asc' },
            include: { assets: { orderBy: { order: 'asc' } } }
          }
        }
      })
    ]);

    if (!profile || !user) throw new Error('PROFILE_INCOMPLETE');

    // 2. Generate payloads for each language
    const languages: ('es' | 'en')[] = ['es', 'en'];
    const result: any = {};

    languages.forEach((lang) => {
      // --- Works Payload ---
      result[`works_${lang}`] = projects.map(proj => {
        const title: any = proj.title || {};
        const desc: any = proj.description || {};

        return {
          id: proj.id,
          slug: proj.slug,
          title: title[lang] || title['es'] || '',
          category: proj.category || '',
           thumbnail: proj.thumbnail_drive_id ? `${bridgeUrl}/${proj.thumbnail_drive_id}` : null,
           role: lang === 'es' ? proj.role_es : proj.role_en,
           description: desc[lang] || desc['es'] || '',
           workDone: proj.sections.map(sec => {
             const mappedItems = sec.assets.map(asset => ({
               title: lang === 'es' ? asset.title_es : asset.title_en,
               img: `${bridgeUrl}/${asset.drive_id}`,
               desc: lang === 'es' ? asset.description_es : asset.description_en,
               config3d: asset.config_3d
             }));

             // Map layoutType to bridge types
             if (sec.layout_type === 'asset-group') {
               return {
                 type: 'asset-group',
                 groupTitle: lang === 'es' ? sec.title_es : sec.title_en,
                 description: lang === 'es' ? sec.description_es : sec.description_en,
                 items: mappedItems
               };
             } else if (sec.layout_type === 'gltf-model') {
               return {
                 type: 'gltf-model',
                 title: lang === 'es' ? sec.title_es : sec.title_en,
                 description: lang === 'es' ? sec.description_es : sec.description_en,
                 modelUrl: sec.model_drive_id ? `${bridgeUrl}/${sec.model_drive_id}` : null
               };
             } else {
               return {
                 type: '3d-model',
                 title: lang === 'es' ? sec.title_es : sec.title_en,
                 description: lang === 'es' ? sec.description_es : sec.description_en,
                 modelPlaceholderColor: 12146341,
                 textures: mappedItems.map(i => ({ name: i.title, img: i.img }))
               };
             }
           })
        };
      });

      // --- Profile Payload ---
       result[`profile_${lang}`] = {
         _version: "1.0.0",
         version: "1.1",
         meta: {
           site_title: lang === 'es' ? profile.site_title_es : profile.site_title_en,
           description: lang === 'es' ? profile.seo_desc_es : profile.seo_desc_en,
           favicon_drive_id: profile.favicon_drive_id,
           avatar_drive_id: profile.avatar_drive_id
         },
         identity: {
           name: user.name || "Artista",
           class: lang === 'es' ? profile.class_es : profile.class_en,
           level: profile.level,
           status: lang === 'es' ? profile.status_es : profile.status_en,
           bio: lang === 'es' ? profile.bio_es : profile.bio_en,
           avatar: profile.avatar_drive_id ? `${bridgeUrl}/${profile.avatar_drive_id}` : null
         },
         theme: profile.theme_json || {},
         stats: stats.map(s => ({
           name: lang === 'es' ? s.name_es : s.name_en,
           value: s.value,
           class: s.css_class
         })),
         software: software.map(sw => ({
           id: sw.id,
           name: sw.name,
           icon: sw.icon_drive_id ? `${bridgeUrl}/${sw.icon_drive_id}` : null,
           color: sw.color
         })),
         socials: socials.map(soc => ({
           name: soc.name,
           link: soc.link,
           icon: soc.icon_drive_id ? `${bridgeUrl}/${soc.icon_drive_id}` : null
         })),
         contact: {
           title: lang === 'es' ? profile.contact_title_es : profile.contact_title_en,
           description: lang === 'es' ? profile.contact_desc_es : profile.contact_desc_en,
           email: profile.contact_email
         }
       };
    });

    return result;
  }

  /**
   * Option B: Triggers a webhook (Vercel/Netlify Deploy Hook) with the payload.
   */
  static triggerWebhook(url: string, payload: any) {
    const data = JSON.stringify(payload);
    const urlObj = new URL(url);

    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
      },
    };

    const req = https.request(options);
    req.on('error', (error) => console.error('[Generator.Service] Webhook Error:', error));
    req.write(data);
    req.end();
  }
}
