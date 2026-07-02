import { Router } from 'express'
import { list, create, update } from './matches.controller.js'
import { authenticate, requireAdmin } from '../../middlewares/auth.js'

const router = Router()

router.get('/', list)
router.post('/', authenticate, requireAdmin, create)
router.patch('/:id', authenticate, requireAdmin, update)

export default router
