import { Router } from 'express'
import { save, mine, calculate, ranking, allPredictions, userPredictions, stats } from './predictions.controller.js'
import { authenticate, requireAdmin } from '../../middlewares/auth.js'

/**
 * @openapi
 * tags:
 *   - name: Predictions
 *     description: Pronósticos de usuarios
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

const router = Router()

/**
 * @openapi
 * /predictions:
 *   post:
 *     tags: [Predictions]
 *     summary: Crear o actualizar pronóstico
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [matchId, homeScore, awayScore]
 *             properties:
 *               matchId: { type: integer }
 *               homeScore: { type: integer }
 *               awayScore: { type: integer }
 *     responses:
 *       201:
 *         description: Pronóstico guardado
 */
router.post('/', authenticate, save)
/**
 * @openapi
 * /predictions/mine:
 *   get:
 *     tags: [Predictions]
 *     summary: Mis pronósticos
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de pronósticos del usuario
 */
router.get('/mine', authenticate, mine)
/**
 * @openapi
 * /predictions/stats:
 *   get:
 *     tags: [Predictions]
 *     summary: Estadísticas del usuario
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas de pronósticos
 */
router.get('/stats', authenticate, stats)
/**
 * @openapi
 * /predictions/ranking:
 *   get:
 *     tags: [Predictions]
 *     summary: Ranking de usuarios por puntos
 *     responses:
 *       200:
 *         description: Lista ordenada de usuarios
 */
router.get('/ranking', ranking)
/**
 * @openapi
 * /predictions/user/{userId}:
 *   get:
 *     tags: [Predictions]
 *     summary: Pronósticos de un usuario específico
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Pronósticos del usuario
 */
router.get('/user/:userId', authenticate, userPredictions)
/**
 * @openapi
 * /predictions/calculate:
 *   post:
 *     tags: [Predictions]
 *     summary: Recalcular puntos de todos los pronósticos (admin)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Puntos recalculados
 */
router.post('/calculate', authenticate, requireAdmin, calculate)
/**
 * @openapi
 * /predictions/admin/all:
 *   get:
 *     tags: [Predictions]
 *     summary: Todas las predicciones (admin)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista completa de pronósticos
 */
router.get('/admin/all', authenticate, requireAdmin, allPredictions)

export default router
