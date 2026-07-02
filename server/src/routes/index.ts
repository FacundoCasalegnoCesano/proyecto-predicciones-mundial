import { Router } from 'express'
import authRoutes from '../modules/auth/auth.routes.js'
import adminRoutes from '../modules/admin/admin.routes.js'
import matchesRoutes from '../modules/matches/matches.routes.js'
import teamsRoutes from '../modules/teams/teams.routes.js'

const router = Router()

router.use('/auth', authRoutes)
router.use('/admin', adminRoutes)
router.use('/matches', matchesRoutes)
router.use('/teams', teamsRoutes)

export default router
