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
    static async getFullProfile(userId) {
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
    static async upsertIdentity(userId, data) {
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
    static async updateSocials(userId, socials) {
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
    static async updateSoftware(userId, software) {
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
    static async updateStats(userId, stats) {
        return prisma.$transaction([
            prisma.stat.deleteMany({ where: { userId } }),
            prisma.stat.createMany({
                data: stats.map((s, idx) => ({ ...s, userId, order: idx })),
            }),
        ]);
    }
}
//# sourceMappingURL=profile.service.js.map