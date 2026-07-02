import { Router } from 'express'
import { save, mine, calculate, ranking, allPredictions, userPredictions } from './predictions.controller.js'
import { authenticate, requireAdmin } from '../../middlewares/auth.js'

const router = Router()

router.post('/', authenticate, save)
router.get('/mine', authenticate, mine)
router.post('/calculate', authenticate, requireAdmin, calculate)
router.get('/ranking', ranking)
router.get('/user/:userId', authenticate, userPredictions)
router.get('/admin/all', authenticate, requireAdmin, allPredictions)

export default router
