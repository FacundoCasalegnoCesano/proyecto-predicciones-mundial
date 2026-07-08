import type { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { getUserNotifications, markAsRead, markAllAsRead } from './notifications.service.js'

export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await getUserNotifications(req.user!.userId)
    res.json(result)
  } catch (err) {
    next(err)
  }
}

const idParamSchema = z.object({
  id: z.coerce.number().positive(),
})

export async function read(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = idParamSchema.parse(req.params)
    const result = await markAsRead(id, req.user!.userId)
    res.json(result)
  } catch (err) {
    next(err)
  }
}

export async function readAll(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await markAllAsRead(req.user!.userId)
    res.json({ success: true })
  } catch (err) {
    next(err)
  }
}
