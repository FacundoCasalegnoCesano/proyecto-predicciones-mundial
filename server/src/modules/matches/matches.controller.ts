import type { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { listMatches, createMatch, updateMatch } from './matches.service.js'
import { createMatchSchema, updateMatchSchema } from './matches.validation.js'

const phaseSchema = z.object({
  phase: z.enum(['group', 'round_of_32', 'round_of_16', 'quarter_final', 'semi_final', 'third_place', 'final']).optional(),
})

export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { phase } = phaseSchema.parse(req.query)
    const matches = await listMatches(phase)
    res.json(matches)
  } catch (err) {
    next(err)
  }
}

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = createMatchSchema.parse(req.body)
    const match = await createMatch({ ...data, adminUserId: req.user!.userId })
    res.status(201).json(match)
  } catch (err) {
    next(err)
  }
}

export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const matchId = Number(req.params['id'])
    if (isNaN(matchId)) throw new Error('Invalid match id')
    const data = updateMatchSchema.parse(req.body)
    const result = await updateMatch(matchId, data, req.user!.userId)
    res.json(result)
  } catch (err) {
    next(err)
  }
}
