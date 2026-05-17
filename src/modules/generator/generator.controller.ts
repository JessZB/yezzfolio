import { Request, Response, NextFunction } from 'express';
import { GeneratorService } from './generator.service.js';
import { env } from '../../config/env.js';

/**
 * GeneratorController
 * Entry point for triggering SSG builds.
 */
export class GeneratorController {
  
  static async build(req: Request, res: Response, next: NextFunction) {
    try {
      // 1. Generate compatible payload for Astro
      const payload = await GeneratorService.buildFullPayload(req.user!.id);

      // 2. Trigger Option B (Webhook) if configured
      if (env.ASTRO_WEBHOOK_URL) {
        GeneratorService.triggerWebhook(env.ASTRO_WEBHOOK_URL, payload);
        return res.status(200).json({
          message: 'Publicación disparada exitosamente vía Webhook.',
          status: 'webhook_sent'
        });
      }

      // 3. Fallback for local dev/preview
      return res.status(200).json({
        message: 'Payload generado exitosamente (Modo previsualización).',
        data: payload
      });
    } catch (error: any) {
      if (error.message === 'PROFILE_INCOMPLETE') {
        return res.status(400).json({ 
          error: 'Perfil incompleto. Asegúrate de configurar tu identidad antes de publicar.' 
        });
      }
      next(error);
    }
  }
}
