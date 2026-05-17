import { Router } from 'express';
import { AuthController } from './auth.controller.js';
import { validate } from '../../core/middlewares/validate.js';
import { googleLoginSchema } from './auth.schemas.js';
import { requireAuth } from '../../core/middlewares/auth.middleware.js';

const router = Router();

/**
 * Auth Routes
 * Handles user login and Google Drive OAuth flow.
 */

// Public login endpoint
router.post('/google', validate(googleLoginSchema), AuthController.googleLogin);

// Drive OAuth endpoints
router.get('/drive/connect', requireAuth, AuthController.connectDrive);
router.get('/callback', AuthController.driveCallback);

export default router;
