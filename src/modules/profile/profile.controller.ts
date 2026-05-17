import { Request, Response, NextFunction } from 'express';
import { ProfileService } from './profile.service.js';

/**
 * ProfileController
 * Entry point for Artist Profile management.
 */
export class ProfileController {
  
  static async getFull(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await ProfileService.getFullProfile(req.user!.id);
      return res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }

  static async updateIdentity(req: Request, res: Response, next: NextFunction) {
    try {
      const profile = await ProfileService.upsertIdentity(req.user!.id, req.body);
      return res.status(200).json(profile);
    } catch (error) {
      next(error);
    }
  }

  static async updateSocials(req: Request, res: Response, next: NextFunction) {
    try {
      await ProfileService.updateSocials(req.user!.id, req.body.socials);
      return res.status(200).json({ success: true });
    } catch (error) {
      next(error);
    }
  }

  static async updateSoftware(req: Request, res: Response, next: NextFunction) {
    try {
      await ProfileService.updateSoftware(req.user!.id, req.body.software);
      return res.status(200).json({ success: true });
    } catch (error) {
      next(error);
    }
  }

  static async updateStats(req: Request, res: Response, next: NextFunction) {
    try {
      await ProfileService.updateStats(req.user!.id, req.body.stats);
      return res.status(200).json({ success: true });
    } catch (error) {
      next(error);
    }
  }

  static async updateLang(req: Request, res: Response, next: NextFunction) {
    try {
      await ProfileService.updatePreferredLang(req.user!.id, req.body.lang);
      return res.status(200).json({ success: true });
    } catch (error) {
      next(error);
    }
  }
}
