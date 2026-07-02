import { Router } from 'express'
import { list, updateRole } from './admin.controller.js'
import { authenticate, requireAdmin } from '../../middlewares/auth.js'

const router = Router()

router.get('/users', authenticate, requireAdmin, list)
router.patch('/users/:userId/role', authenticate, requireAdmin, updateRole)

export default router
