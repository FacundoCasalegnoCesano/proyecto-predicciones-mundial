import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { AppError } from './errorHandler.js'

const secret: string = process.env['JWT_SECRET'] ?? 'fallback-dev-only-change-me'
if (!process.env['JWT_SECRET']) {
  console.warn('WARNING: JWT_SECRET not set, using insecure fallback. Set it in production.')
}

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
  const payload = jwt.verify(token, secret) as unknown as JwtPayload
  req.user = payload
  next()
}

export function requireAdmin(req: Request, _res: Response, next: NextFunction): void {
  if (req.user?.role !== 'ADMIN') {
    throw new AppError(403, 'Admin access required')
  }
  next()
}
