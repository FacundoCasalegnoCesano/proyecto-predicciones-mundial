import type { Request, Response, NextFunction } from 'express'
import { listMatches, createMatch, updateMatch } from './matches.service.js'
import { createMatchSchema } from './matches.validation.js'

export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const phase = req.query['phase'] as string | undefined
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
    const result = await updateMatch(matchId, req.body, req.user!.userId)
    res.json(result)
  } catch (err) {
    next(err)
  }
}
