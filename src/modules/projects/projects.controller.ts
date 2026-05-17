import { Request, Response, NextFunction } from 'express';
import { ProjectsService } from './projects.service.js';

/**
 * ProjectsController
 * Acts as the entry point for Project-related HTTP requests.
 * Enforces Multi-tenant security by passing req.user.id to the service.
 */
export class ProjectsController {
  
  static async listProjects(req: Request, res: Response, next: NextFunction) {
    try {
      const projects = await ProjectsService.listProjects(req.user!.id);
      return res.status(200).json(projects);
    } catch (error) {
      next(error);
    }
  }

  static async createProject(req: Request, res: Response, next: NextFunction) {
    try {
      const project = await ProjectsService.createProject(req.user!.id, req.body);
      return res.status(201).json(project);
    } catch (error) {
      next(error);
    }
  }

  static async updateProject(req: Request, res: Response, next: NextFunction) {
    try {
      await ProjectsService.updateProject(req.user!.id, req.params.id as string, req.body);
      return res.status(200).json({ message: 'Proyecto actualizado' });
    } catch (error: any) {
      if (error.message === 'NOT_FOUND_OR_UNAUTHORIZED') {
        return res.status(404).json({ error: 'Proyecto no encontrado' });
      }
      next(error);
    }
  }

  static async deleteProject(req: Request, res: Response, next: NextFunction) {
    try {
      await ProjectsService.deleteProject(req.user!.id, req.params.id as string);
      return res.status(200).json({ message: 'Proyecto eliminado' });
    } catch (error: any) {
      if (error.message === 'NOT_FOUND_OR_UNAUTHORIZED') {
        return res.status(404).json({ error: 'Proyecto no encontrado' });
      }
      next(error);
    }
  }

  static async upsertSection(req: Request, res: Response, next: NextFunction) {
    try {
      const section = await ProjectsService.upsertSection(req.user!.id, req.body);
      return res.status(200).json(section);
    } catch (error: any) {
      if (error.message === 'UNAUTHORIZED') return res.status(403).json({ error: 'No autorizado' });
      next(error);
    }
  }

  static async deleteSection(req: Request, res: Response, next: NextFunction) {
    try {
      await ProjectsService.deleteSection(req.user!.id, req.params.id as string);
      return res.status(200).json({ message: 'Sección eliminada' });
    } catch (error: any) {
      if (error.message === 'NOT_FOUND_OR_UNAUTHORIZED') {
        return res.status(404).json({ error: 'Sección no encontrada' });
      }
      next(error);
    }
  }

  static async upsertAsset(req: Request, res: Response, next: NextFunction) {
    try {
      const asset = await ProjectsService.upsertAsset(req.user!.id, req.body);
      return res.status(200).json(asset);
    } catch (error: any) {
      if (error.message === 'UNAUTHORIZED') return res.status(403).json({ error: 'No autorizado' });
      next(error);
    }
  }

  static async reorder(req: Request, res: Response, next: NextFunction) {
    try {
      const { type, orders } = req.body;
      await ProjectsService.reorderItems(req.user!.id, type, orders);
      return res.status(200).json({ success: true });
    } catch (error) {
      next(error);
    }
  }
}
