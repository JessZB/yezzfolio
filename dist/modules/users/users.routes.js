import { Router } from 'express';
import { UsersController } from './users.controller.js';
import { validate } from '../../core/middlewares/validate.js';
import { inviteUserSchema } from './users.schemas.js';
import { requireAuth, requireSuperAdmin } from '../../core/middlewares/auth.middleware.js';
const router = Router();
// All routes here are admin-only
router.use(requireAuth, requireSuperAdmin);
router.post('/invite', validate(inviteUserSchema), UsersController.invite);
router.get('/stats', UsersController.getStats);
router.get('/', UsersController.list);
export default router;
//# sourceMappingURL=users.routes.js.map