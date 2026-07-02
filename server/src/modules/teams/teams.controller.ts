import type { Request, Response, NextFunction } from 'express'
import { listTeams } from './teams.service.js'

export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const teams = await listTeams()
    res.json(teams)
  } catch (err) {
    next(err)
  }
}
