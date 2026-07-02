import { Router } from 'express'
import { register, login, me, updateProfileHandler, changePasswordHandler, deleteAccountHandler } from './auth.controller.js'
import { authenticate } from '../../middlewares/auth.js'

const router = Router()

router.post('/register', register)
router.post('/login', login)
router.get('/me', authenticate, me)
router.patch('/profile', authenticate, updateProfileHandler)
router.patch('/password', authenticate, changePasswordHandler)
router.delete('/account', authenticate, deleteAccountHandler)

export default router
