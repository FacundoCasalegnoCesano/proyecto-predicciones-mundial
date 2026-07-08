import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { AppError } from './errorHandler.js'
import { env } from '../config/env.js'

const secret = env.JWT_SECRET

export interface JwtPayload {
  userId: number
  role: string
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload
    }
  }
}

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers['authorization']
  if (!header?.startsWith('Bearer ')) {
    throw new AppError(401, 'No token provided')
  }

  const token = header.slice(7)
  const payload = jwt.verify(token, secret, { algorithms: ['HS256'] }) as unknown as JwtPayload
  req.user = payload
  next()
}

export function requireAdmin(req: Request, _res: Response, next: NextFunction): void {
  if (req.user?.role !== 'ADMIN') {
    throw new AppError(403, 'Admin access required')
  }
  next()
}
