import type { Request, Response, NextFunction } from 'express'
import { getUserNotifications, markAsRead, markAllAsRead } from './notifications.service.js'

export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await getUserNotifications(req.user!.userId)
    res.json(result)
  } catch (err) {
    next(err)
  }
}

export async function read(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const notificationId = Number(req.params['id'])
    const result = await markAsRead(notificationId, req.user!.userId)
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
