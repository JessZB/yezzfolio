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
    const profile = await prisma.profile.findUnique({
      where: { userId },
    });

    const [socials, software, stats] = await Promise.all([
      prisma.social.findMany({ where: { userId }, orderBy: { order: 'asc' } }),
      prisma.software.findMany({ where: { userId }, orderBy: { order: 'asc' } }),
      prisma.stat.findMany({ where: { userId }, orderBy: { order: 'asc' } }),
    ]);

    return {
      profile: profile || {},
      socials,
      software,
      stats
    };
  }

  /**
   * Updates or creates the main identity profile.
   */
  static async upsertIdentity(userId: string, data: any) {
    const cleanedData = cleanObject(data);
    return prisma.profile.upsert({
      where: { userId },
      update: cleanedData,
      create: { ...cleanedData, userId },
    });
  }

  /**
   * Replaces all social links for a user (Transactional).
   */
  static async updateSocials(userId: string, socials: any[]) {
    return prisma.$transaction([
      prisma.social.deleteMany({ where: { userId } }),
      prisma.social.createMany({
        data: socials.map((s, idx) => ({ ...s, userId, order: idx })),
      }),
    ]);
  }

  /**
   * Replaces all software items (Transactional).
   */
  static async updateSoftware(userId: string, software: any[]) {
    return prisma.$transaction([
      prisma.software.deleteMany({ where: { userId } }),
      prisma.software.createMany({
        data: software.map((s, idx) => ({ ...s, userId, order: idx })),
      }),
    ]);
  }

  /**
   * Replaces all stats (Transactional).
   */
  static async updateStats(userId: string, stats: any[]) {
    return prisma.$transaction([
      prisma.stat.deleteMany({ where: { userId } }),
      prisma.stat.createMany({
        data: stats.map((s, idx) => ({ ...s, userId, order: idx })),
      }),
    ]);
  }
}
