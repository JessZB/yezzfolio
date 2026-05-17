import { Router } from 'express';
import { GeneratorController } from './generator.controller.js';
import { requireAuth } from '../../core/middlewares/auth.middleware.js';

const router = Router();

router.post('/build', requireAuth, GeneratorController.build);

export default router;
