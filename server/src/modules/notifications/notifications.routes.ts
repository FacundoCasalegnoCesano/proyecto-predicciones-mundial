import { Router } from 'express'
import { list, read, readAll } from './notifications.controller.js'
import { authenticate } from '../../middlewares/auth.js'

const router = Router()

router.get('/', authenticate, list)
router.patch('/:id/read', authenticate, read)
router.patch('/read-all', authenticate, readAll)

export default router
