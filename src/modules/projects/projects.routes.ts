import { Router } from 'express'
import { ProjectsController } from './projects.controller.js'
import { requireAuth } from '../../core/middlewares/auth.middleware.js'
import { validate } from '../../core/middlewares/validate.js'
import {
  createProjectSchema,
  updateProjectSchema,
  upsertSectionSchema,
  upsertAssetSchema,
  reorderSchema,
} from './projects.schemas.js'

const router = Router()

// All project routes require authentication
router.use(requireAuth)

router.get('/', ProjectsController.listProjects)
router.get('/:id', ProjectsController.getProject)
router.post(
  '/',
  validate(createProjectSchema),
  ProjectsController.createProject,
)
router.put(
  '/:id',
  validate(updateProjectSchema),
  ProjectsController.updateProject,
)
router.delete('/:id', ProjectsController.deleteProject)

router.post(
  '/sections',
  validate(upsertSectionSchema),
  ProjectsController.upsertSection,
)
router.delete('/sections/:id', ProjectsController.deleteSection)

router.post(
  '/assets',
  validate(upsertAssetSchema),
  ProjectsController.upsertAsset,
)
router.delete('/assets/:id', ProjectsController.deleteAsset)
router.post('/reorder', validate(reorderSchema), ProjectsController.reorder)

export default router
