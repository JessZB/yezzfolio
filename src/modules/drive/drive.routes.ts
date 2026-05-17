import { Router } from 'express';
import { DriveController } from './drive.controller.js';
import { requireAuth } from '../../core/middlewares/auth.middleware.js';
import multer from 'multer';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// Public Proxy (for Portfolio frontend)
router.get('/proxy/:driveId', DriveController.proxy);

// Private Endpoints (for Admin UI)
router.get('/check/:driveId', requireAuth, DriveController.check);
router.post('/upload', requireAuth, upload.single('file'), DriveController.upload);

export default router;
