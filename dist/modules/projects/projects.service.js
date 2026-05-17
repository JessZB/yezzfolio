import prisma from '../../core/db.js';
import { cleanObject } from '../../core/utils/sanitize.js';
/**
 * ProjectsService
 * Handles multi-tenant CRUD for Projects, Sections, and Assets.
 * All methods require a userId to ensure data isolation.
 */
export class ProjectsService {
    // --- Projects ---
    static async listProjects(userId) {
        return await prisma.project.findMany({
            where: { userId },
            orderBy: { order: 'asc' },
            include: {
                sections: {
                    orderBy: { order: 'asc' },
                    include: {
                        assets: { orderBy: { order: 'asc' } }
                    }
                }
            }
        });
    }
    static async createProject(userId, data) {
        const cleanedData = cleanObject(data);
        return await prisma.project.create({
            data: {
                ...cleanedData,
                userId,
            }
        });
    }
    static async updateProject(userId, projectId, data) {
        const cleanedData = cleanObject(data);
        const result = await prisma.project.updateMany({
            where: { id: projectId, userId },
            data: cleanedData
        });
        if (result.count === 0)
            throw new Error('NOT_FOUND_OR_UNAUTHORIZED');
        return result;
    }
    static async deleteProject(userId, projectId) {
        const result = await prisma.project.deleteMany({
            where: { id: projectId, userId }
        });
        if (result.count === 0)
            throw new Error('NOT_FOUND_OR_UNAUTHORIZED');
        return result;
    }
    // --- Sections ---
    static async upsertSection(userId, data) {
        // Verify Ownership of parent project
        const project = await prisma.project.findFirst({
            where: { id: data.projectId, userId },
        });
        if (!project)
            throw new Error('UNAUTHORIZED');
        const cleanedData = cleanObject(data);
        const { id, ...rest } = cleanedData;
        return await prisma.section.upsert({
            where: { id: id || '00000000-0000-0000-0000-000000000000' },
            update: rest,
            create: rest,
        });
    }
    static async deleteSection(userId, sectionId) {
        const section = await prisma.section.findFirst({
            where: { id: sectionId, project: { userId } },
        });
        if (!section)
            throw new Error('NOT_FOUND_OR_UNAUTHORIZED');
        return await prisma.section.delete({ where: { id: sectionId } });
    }
    // --- Assets ---
    static async upsertAsset(userId, data) {
        // Verify Ownership of parent section
        const section = await prisma.section.findFirst({
            where: { id: data.sectionId, project: { userId } },
        });
        if (!section)
            throw new Error('UNAUTHORIZED');
        const cleanedData = cleanObject(data);
        const { id, ...rest } = cleanedData;
        return await prisma.asset.upsert({
            where: { id: id || '00000000-0000-0000-0000-000000000000' },
            update: rest,
            create: rest,
        });
    }
    // --- Reordering ---
    static async reorderItems(userId, type, orders) {
        const updates = orders.map((item) => {
            const where = { id: item.id };
            if (type === 'project')
                where.userId = userId;
            else if (type === 'section')
                where.project = { userId };
            else if (type === 'asset')
                where.section = { project: { userId } };
            const model = prisma[type];
            return model.updateMany({
                where,
                data: { order: item.order },
            });
        });
        return await Promise.all(updates);
    }
}
//# sourceMappingURL=projects.service.js.map