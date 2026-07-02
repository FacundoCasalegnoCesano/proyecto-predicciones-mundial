import { Router } from 'express'
import { list } from './teams.controller.js'

const router = Router()

router.get('/', list)

export default router
