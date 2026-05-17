import { Router } from 'express';
import { ProfileController } from './profile.controller.js';
import { requireAuth } from '../../core/middlewares/auth.middleware.js';
import { validate } from '../../core/middlewares/validate.js';
import { identitySchema, socialsSchema, softwareSchema, statsSchema } from './profile.schemas.js';
const router = Router();
// All profile routes require authentication
router.use(requireAuth);
router.get('/full', ProfileController.getFull);
router.post('/identity', validate(identitySchema), ProfileController.updateIdentity);
router.post('/socials', validate(socialsSchema), ProfileController.updateSocials);
router.post('/software', validate(softwareSchema), ProfileController.updateSoftware);
router.post('/stats', validate(statsSchema), ProfileController.updateStats);
export default router;
//# sourceMappingURL=profile.routes.js.map