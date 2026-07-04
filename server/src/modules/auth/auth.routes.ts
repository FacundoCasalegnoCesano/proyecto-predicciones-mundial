import { Router } from 'express'
import { register, login, me, updateProfileHandler, changePasswordHandler, deleteAccountHandler, forgotPasswordHandler, resetPasswordHandler } from './auth.controller.js'
import { authenticate } from '../../middlewares/auth.js'

/**
 * @openapi
 * tags:
 *   - name: Auth
 *     description: Autenticación y usuarios
 */

const router = Router()

/**
 * @openapi
 * /auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Registrar nuevo usuario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, email, password]
 *             properties:
 *               username: { type: string }
 *               email: { type: string }
 *               password: { type: string }
 *               firstName: { type: string }
 *               lastName: { type: string }
 *     responses:
 *       201:
 *         description: Usuario creado
 */
router.post('/register', register)
/**
 * @openapi
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Iniciar sesión
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       200:
 *         description: JWT token + datos del usuario
 */
router.post('/login', login)
/**
 * @openapi
 * /auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Obtener perfil del usuario actual
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Datos del usuario
 */
router.get('/me', authenticate, me)
router.patch('/profile', authenticate, updateProfileHandler)
router.patch('/password', authenticate, changePasswordHandler)
router.delete('/account', authenticate, deleteAccountHandler)
/**
 * @openapi
 * /auth/forgot-password:
 *   post:
 *     tags: [Auth]
 *     summary: Solicitar reseteo de contraseña
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email: { type: string }
 *     responses:
 *       200:
 *         description: Email enviado si el usuario existe
 */
router.post('/forgot-password', forgotPasswordHandler)
/**
 * @openapi
 * /auth/reset-password:
 *   post:
 *     tags: [Auth]
 *     summary: Resetear contraseña con token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token: { type: string }
 *               password: { type: string }
 *     responses:
 *       200:
 *         description: Contraseña actualizada
 */
router.post('/reset-password', resetPasswordHandler)

export default router
