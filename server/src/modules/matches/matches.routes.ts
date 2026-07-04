import { Router } from 'express'
import { list, create, update } from './matches.controller.js'
import { authenticate, requireAdmin } from '../../middlewares/auth.js'

/**
 * @openapi
 * tags:
 *   - name: Matches
 *     description: Partidos del Mundial
 */

const router = Router()

/**
 * @openapi
 * /matches:
 *   get:
 *     tags: [Matches]
 *     summary: Listar partidos
 *     parameters:
 *       - in: query
 *         name: phase
 *         schema:
 *           type: string
 *         description: Filtrar por fase (group, round_of_32, round_of_16, quarter_final, semi_final, third_place, final)
 *     responses:
 *       200:
 *         description: Lista de partidos
 */
router.get('/', list)
/**
 * @openapi
 * /matches:
 *   post:
 *     tags: [Matches]
 *     summary: Crear partido (admin)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [phase, date, homeTeamId, awayTeamId]
 *             properties:
 *               phase:
 *                 type: string
 *                 enum: [round_of_32, round_of_16, quarter_final, semi_final, third_place, final]
 *               date: { type: string, format: date-time }
 *               homeTeamId: { type: integer }
 *               awayTeamId: { type: integer }
 *     responses:
 *       201:
 *         description: Partido creado
 */
router.post('/', authenticate, requireAdmin, create)
/**
 * @openapi
 * /matches/{id}:
 *   patch:
 *     tags: [Matches]
 *     summary: Actualizar partido (admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               homeScore: { type: integer }
 *               awayScore: { type: integer }
 *               homeTeamId: { type: integer }
 *               awayTeamId: { type: integer }
 *               status:
 *                 type: string
 *                 enum: [scheduled, live, HT, FT, PEN]
 *     responses:
 *       200:
 *         description: Partido actualizado
 */
router.patch('/:id', authenticate, requireAdmin, update)

export default router
