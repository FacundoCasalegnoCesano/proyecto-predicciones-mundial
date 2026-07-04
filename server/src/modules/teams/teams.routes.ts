import { Router } from 'express'
import { list } from './teams.controller.js'

/**
 * @openapi
 * tags:
 *   - name: Teams
 *     description: Equipos
 */

const router = Router()

/**
 * @openapi
 * /teams:
 *   get:
 *     tags: [Teams]
 *     summary: Listar todos los equipos
 *     responses:
 *       200:
 *         description: Lista de equipos
 */
router.get('/', list)

export default router
