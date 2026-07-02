import type { Request, Response, NextFunction } from 'express'
import { updateRoleSchema } from './admin.validation.js'
import { listUsers, updateUserRole } from './admin.service.js'

export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const search = req.query['search'] as string | undefined
    const users = await listUsers(search)
    res.json(users)
  } catch (err) {
    next(err)
  }
}

export async function updateRole(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = Number(req.params['userId'])
    const data = updateRoleSchema.parse(req.body)
    const user = await updateUserRole(userId, data.role)
    res.json(user)
  } catch (err) {
    next(err)
  }
}
