import prisma from '../../core/db.js';
import { cleanObject } from '../../core/utils/sanitize.js';

/**
 * ProjectsService
 * Handles multi-tenant CRUD for Projects, Sections, and Assets.
 * All methods require a userId to ensure data isolation.
 */
export class ProjectsService {
  
  // --- Projects ---

  static async listProjects(userId: string) {
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

  static async createProject(userId: string, data: any) {
    const cleanedData = cleanObject(data);
    
    // Map separate translation fields to JSON objects for Prisma
    const { 
      title_es, title_en, 
      description_es, description_en, 
      id, // remove id to let Prisma generate UUID
      ...rest 
    } = cleanedData;

    return await prisma.project.create({
      data: {
        ...rest,
        userId,
        title: { es: title_es, en: title_en },
        description: description_es || description_en ? { es: description_es, en: description_en } : undefined,
      }
    });
  }

  static async updateProject(userId: string, projectId: string, data: any) {
    const cleanedData = cleanObject(data);

    // Map translation fields to JSON if present
    const title = (cleanedData.title_es || cleanedData.title_en) 
      ? { es: cleanedData.title_es, en: cleanedData.title_en } 
      : undefined;
      
    const description = (cleanedData.description_es || cleanedData.description_en)
      ? { es: cleanedData.description_es, en: cleanedData.description_en }
      : undefined;

    const { title_es, title_en, description_es, description_en, ...rest } = cleanedData;

    const result = await prisma.project.updateMany({
      where: { id: projectId, userId },
      data: {
        ...rest,
        ...(title && { title }),
        ...(description && { description }),
      }
    });
    if (result.count === 0) throw new Error('NOT_FOUND_OR_UNAUTHORIZED');
    return result;
  }

  static async deleteProject(userId: string, projectId: string) {
    const result = await prisma.project.deleteMany({
      where: { id: projectId, userId }
    });
    if (result.count === 0) throw new Error('NOT_FOUND_OR_UNAUTHORIZED');
    return result;
  }

  // --- Sections ---

  static async upsertSection(userId: string, data: any) {
    // Verify Ownership of parent project
    const project = await prisma.project.findFirst({
      where: { id: data.project_id, userId },
    });
    if (!project) throw new Error('UNAUTHORIZED');
    
    const cleanedData = cleanObject(data);
    const { id, ...rest } = cleanedData;
    
    return await prisma.section.upsert({
      where: { id: id || '00000000-0000-0000-0000-000000000000' },
      update: rest,
      create: rest,
    });
  }

  static async deleteSection(userId: string, sectionId: string) {
    const section = await prisma.section.findFirst({
      where: { id: sectionId, project: { userId } },
    });
    if (!section) throw new Error('NOT_FOUND_OR_UNAUTHORIZED');

    return await prisma.section.delete({ where: { id: sectionId } });
  }

  // --- Assets ---

  static async upsertAsset(userId: string, data: any) {
    // Verify Ownership of parent section
    const section = await prisma.section.findFirst({
      where: { id: data.section_id, project: { userId } },
    });
    if (!section) throw new Error('UNAUTHORIZED');
    
    const cleanedData = cleanObject(data);
    const { id, ...rest } = cleanedData;
    
    return await prisma.asset.upsert({
      where: { id: id || '00000000-0000-0000-0000-000000000000' },
      update: rest,
      create: rest,
    });
  }

  // --- Reordering ---

  static async reorderItems(userId: string, type: 'project' | 'section' | 'asset', orders: { id: string, order: number }[]) {
    const updates = orders.map((item) => {
      const where: any = { id: item.id };
      if (type === 'project') where.userId = userId;
      else if (type === 'section') where.project = { userId };
      else if (type === 'asset') where.section = { project: { userId } };

      const model = (prisma as any)[type];
      return model.updateMany({
        where,
        data: { order: item.order },
      });
    });

    return await Promise.all(updates);
  }
}
