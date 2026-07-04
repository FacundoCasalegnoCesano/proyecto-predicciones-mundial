import { Router } from 'express'
import { list, updateRole } from './admin.controller.js'
import { authenticate, requireAdmin } from '../../middlewares/auth.js'

/**
 * @openapi
 * tags:
 *   - name: Admin
 *     description: Administración
 */

const router = Router()

/**
 * @openapi
 * /admin/users:
 *   get:
 *     tags: [Admin]
 *     summary: Listar usuarios (admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de usuarios
 */
router.get('/users', authenticate, requireAdmin, list)
/**
 * @openapi
 * /admin/users/{userId}/role:
 *   patch:
 *     tags: [Admin]
 *     summary: Cambiar rol de usuario (admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [USER, ADMIN]
 *     responses:
 *       200:
 *         description: Rol actualizado
 */
router.patch('/users/:userId/role', authenticate, requireAdmin, updateRole)

export default router
