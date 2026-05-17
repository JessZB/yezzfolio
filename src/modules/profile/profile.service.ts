import prisma from '../../core/db.js';
import { cleanObject } from '../../core/utils/sanitize.js';

/**
 * ProfileService
 * Handles artist identity, profile metadata, and associated lists (socials, software, stats).
 */
export class ProfileService {
  
  /**
   * Retrieves the full profile including all associated relations.
   */
  static async getFullProfile(userId: string) {
    const [profile, socials, software, stats] = await Promise.all([
      prisma.profile.findUnique({ where: { user_id: userId } }),
      prisma.social.findMany({ where: { user_id: userId }, orderBy: { order: 'asc' } }),
      prisma.software.findMany({ where: { user_id: userId }, orderBy: { order: 'asc' } }),
      prisma.stat.findMany({ where: { user_id: userId }, orderBy: { order: 'asc' } }),
    ]);
    return { profile, socials, software, stats };
  }

  /**
   * Updates or creates the main identity profile.
   */
  static async upsertIdentity(userId: string, data: any) {
    const cleanedData = cleanObject(data);
    const profile = await prisma.profile.findUnique({
      where: { user_id: userId },
    });

    if (profile) {
      return await prisma.profile.update({
        where: { id: profile.id },
        data: cleanedData,
      });
    }

    return await prisma.profile.create({
      data: {
        ...cleanedData,
        user_id: userId,
      },
    });
  }

  /**
   * Replaces all social links for a user (Transactional).
   */
  static async updateSocials(userId: string, socials: any[]) {
    await prisma.$transaction([
      prisma.social.deleteMany({ where: { user_id: userId } }),
      prisma.social.createMany({
        data: socials.map((s, idx) => {
          const { id, ...rest } = s; // strip old id to avoid PK conflicts
          return { ...rest, id: undefined, user_id: userId, order: idx };
        }),
      }),
    ]);
  }

  static async updateSoftware(userId: string, software: any[]) {
    await prisma.$transaction([
      prisma.software.deleteMany({ where: { user_id: userId } }),
      prisma.software.createMany({
        data: software.map((s, idx) => {
          const { id, ...rest } = s;
          return { ...rest, id: undefined, user_id: userId, order: idx };
        }),
      }),
    ]);
  }

  static async updateStats(userId: string, stats: any[]) {
    await prisma.$transaction([
      prisma.stat.deleteMany({ where: { user_id: userId } }),
      prisma.stat.createMany({
        data: stats.map((s, idx) => {
          const { id, ...rest } = s;
          return { ...rest, id: undefined, user_id: userId, order: idx };
        }),
      }),
    ]);
  }

  /**
   * Updates the user's preferred language.
   */
  static async updatePreferredLang(userId: string, lang: string) {
    return await prisma.user.update({
      where: { id: userId },
      data: { preferred_lang: lang },
    });
  }
}
