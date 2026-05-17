import prisma from '../../core/db.js';
import { cleanObject } from '../../core/utils/sanitize.js';

/**
 * ProjectsService
 * Handles multi-tenant CRUD for Projects, Sections, and Assets.
 * All methods require a userId to ensure data isolation.
 */
export class ProjectsService {
  
  static async getProject(userId: string, projectId: string) {
    const project = await prisma.project.findFirst({
      where: { id: projectId, user_id: userId },
      include: {
        sections: {
          orderBy: { order: 'asc' },
          include: {
            assets: { orderBy: { order: 'asc' } }
          }
        }
      }
    });
    if (!project) throw new Error('NOT_FOUND');
    
    // Map JSON fields to flat fields for frontend compatibility
    const { title, description, ...rest } = project;
    const t = title as any;
    const d = description as any;
    
    // Map sections: rename layout_type -> type, assets -> items (frontend compatibility)
    const mappedSections = (rest as any).sections?.map((sec: any) => ({
      ...sec,
      type: sec.layout_type,
      items: sec.assets,
    })) || [];
    
    return {
      ...rest,
      sections: mappedSections,
      title_es: t?.es || '',
      title_en: t?.en || '',
      description_es: d?.es || '',
      description_en: d?.en || '',
    };
  }

  // --- Projects ---

  static async listProjects(userId: string) {
    const projects = await prisma.project.findMany({
      where: { user_id: userId },
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

    return projects.map(project => {
      const { title, description, ...rest } = project;
      const t = title as any;
      const d = description as any;
      
      // Map sections: rename layout_type -> type, assets -> items (frontend compatibility)
      const mappedSections = (rest as any).sections?.map((sec: any) => ({
        ...sec,
        type: sec.layout_type,
        items: sec.assets,
      })) || [];
      
      return {
        ...rest,
        sections: mappedSections,
        title_es: t?.es || '',
        title_en: t?.en || '',
        description_es: d?.es || '',
        description_en: d?.en || '',
      };
    });
  }


  static async createProject(userId: string, data: any) {
    const cleanedData = cleanObject(data);
    
    // Map separate translation fields to JSON objects for Prisma
    const { 
      title_es, title_en, 
      description_es, description_en, 
      id, sections, index, // remove these to prevent Prisma validation errors
      ...rest 
    } = cleanedData;

    return await prisma.project.create({
      data: {
        ...rest,
        user_id: userId,
        title: { es: title_es || '', en: title_en || '' },
        description: description_es || description_en ? { es: description_es || '', en: description_en || '' } : undefined,
      }
    });
  }

  static async updateProject(userId: string, projectId: string, data: any) {
    const cleanedData = cleanObject(data);

    // Map translation fields to JSON if present
    const title = (cleanedData.title_es || cleanedData.title_en) 
      ? { es: cleanedData.title_es || '', en: cleanedData.title_en || '' } 
      : undefined;
      
    const description = (cleanedData.description_es || cleanedData.description_en)
      ? { es: cleanedData.description_es || '', en: cleanedData.description_en || '' }
      : undefined;

    const { title_es, title_en, description_es, description_en, sections, index, ...rest } = cleanedData;

    const result = await prisma.project.updateMany({
      where: { id: projectId, user_id: userId },
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
      where: { id: projectId, user_id: userId }
    });
    if (result.count === 0) throw new Error('NOT_FOUND_OR_UNAUTHORIZED');
    return result;
  }

  // --- Sections ---

  static async upsertSection(userId: string, data: any) {
    // Verify Ownership of parent project
    const project = await prisma.project.findFirst({
      where: { id: data.project_id, user_id: userId },
    });
    if (!project) throw new Error('UNAUTHORIZED');
    
    const cleanedData = cleanObject(data);
    const { id, order, assets, ...rest } = cleanedData;
    
    const result = await prisma.section.upsert({
      where: { id: id || '00000000-0000-0000-0000-000000000000' },
      update: { ...rest, order: order },
      create: { ...rest, order: order },
    });
    
    // Map for frontend compatibility: layout_type -> type
    return { ...result, type: result.layout_type, items: [] };
  }

  static async deleteSection(userId: string, sectionId: string) {
    const section = await prisma.section.findFirst({
      where: { id: sectionId, project: { user_id: userId } },
    });
    if (!section) throw new Error('NOT_FOUND_OR_UNAUTHORIZED');

    return await prisma.section.delete({ where: { id: sectionId } });
  }

  static async deleteAsset(userId: string, assetId: string) {
    const asset = await prisma.asset.findFirst({
      where: { id: assetId, section: { project: { user_id: userId } } },
    });
    if (!asset) throw new Error('NOT_FOUND_OR_UNAUTHORIZED');

    return await prisma.asset.delete({ where: { id: assetId } });
  }

  // --- Assets ---

  static async upsertAsset(userId: string, data: any) {
    // Verify Ownership of parent section
    const section = await prisma.section.findFirst({
      where: { id: data.section_id, project: { user_id: userId } },
    });
    if (!section) throw new Error('UNAUTHORIZED');
    
    const cleanedData = cleanObject(data);
    const { id, drive_id, ...rest } = cleanedData;
    
    // Normalize empty string to null (asset created before upload)
    const resolvedDriveId = drive_id && drive_id !== '' ? drive_id : null;
    
    return await prisma.asset.upsert({
      where: { id: id || '00000000-0000-0000-0000-000000000000' },
      update: { ...rest, drive_id: resolvedDriveId },
      create: { ...rest, drive_id: resolvedDriveId },
    });
  }

  // --- Reordering ---

  static async reorderItems(userId: string, type: 'project' | 'section' | 'asset', orders: { id: string, order: number }[]) {
    const updates = orders.map((item) => {
      const where: any = { id: item.id };
      if (type === 'project') where.user_id = userId;
      else if (type === 'section') where.project = { user_id: userId };
      else if (type === 'asset') where.section = { project: { user_id: userId } };

      const model = (prisma as any)[type];
      return model.updateMany({
        where,
        data: { order: item.order },
      });
    });

    return await Promise.all(updates);
  }
}
