import type { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { updateRoleSchema } from './admin.validation.js'
import { listUsers, updateUserRole } from './admin.service.js'

const searchSchema = z.object({
  search: z.string().max(100).optional(),
})

export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { search } = searchSchema.parse(req.query)
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
    const user = await updateUserRole(userId, data.role, req.user!.userId)
    res.json(user)
  } catch (err) {
    next(err)
  }
}
