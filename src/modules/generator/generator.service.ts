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
      prisma.profile.findUnique({ where: { userId } }),
      prisma.social.findMany({ where: { userId, active: true }, orderBy: { order: 'asc' } }),
      prisma.software.findMany({ where: { userId }, orderBy: { order: 'asc' } }),
      prisma.stat.findMany({ where: { userId }, orderBy: { order: 'asc' } }),
      prisma.project.findMany({
        where: { userId, isPublished: true },
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
          thumbnail: proj.thumbnailDriveId ? `${bridgeUrl}/${proj.thumbnailDriveId}` : null,
          role: lang === 'es' ? proj.roleEs : proj.roleEn,
          description: desc[lang] || desc['es'] || '',
          workDone: proj.sections.map(sec => {
            const mappedItems = sec.assets.map(asset => ({
              title: lang === 'es' ? asset.titleEs : asset.titleEn,
              img: `${bridgeUrl}/${asset.driveId}`,
              desc: lang === 'es' ? asset.descriptionEs : asset.descriptionEn,
              config3d: asset.config3d
            }));

            // Map layoutType to bridge types
            if (sec.layoutType === 'asset-group') {
              return {
                type: 'asset-group',
                groupTitle: lang === 'es' ? sec.titleEs : sec.titleEn,
                description: lang === 'es' ? sec.descriptionEs : sec.descriptionEn,
                items: mappedItems
              };
            } else if (sec.layoutType === 'gltf-model') {
              return {
                type: 'gltf-model',
                title: lang === 'es' ? sec.titleEs : sec.titleEn,
                description: lang === 'es' ? sec.descriptionEs : sec.descriptionEn,
                modelUrl: sec.modelDriveId ? `${bridgeUrl}/${sec.modelDriveId}` : null
              };
            } else {
              return {
                type: '3d-model',
                title: lang === 'es' ? sec.titleEs : sec.titleEn,
                description: lang === 'es' ? sec.descriptionEs : sec.descriptionEn,
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
          site_title: lang === 'es' ? profile.siteTitleEs : profile.siteTitleEn,
          description: lang === 'es' ? profile.seoDescEs : profile.seoDescEn,
          favicon_drive_id: profile.faviconDriveId,
          avatar_drive_id: profile.avatarDriveId
        },
        identity: {
          name: user.name || "Artista",
          class: lang === 'es' ? profile.classEs : profile.classEn,
          level: profile.level,
          status: lang === 'es' ? profile.statusEs : profile.statusEn,
          bio: lang === 'es' ? profile.bioEs : profile.bioEn,
          avatar: profile.avatarDriveId ? `${bridgeUrl}/${profile.avatarDriveId}` : null
        },
        theme: profile.themeJson || {},
        stats: stats.map(s => ({
          name: lang === 'es' ? s.nameEs : s.nameEn,
          value: s.value,
          class: s.cssClass
        })),
        software: software.map(sw => ({
          id: sw.id,
          name: sw.name,
          icon: sw.iconDriveId ? `${bridgeUrl}/${sw.iconDriveId}` : null,
          color: sw.color
        })),
        socials: socials.map(soc => ({
          name: soc.name,
          link: soc.link,
          icon: soc.iconDriveId ? `${bridgeUrl}/${soc.iconDriveId}` : null
        })),
        contact: {
          title: lang === 'es' ? profile.contactTitleEs : profile.contactTitleEn,
          description: lang === 'es' ? profile.contactDescEs : profile.contactDescEn,
          email: profile.contactEmail
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
