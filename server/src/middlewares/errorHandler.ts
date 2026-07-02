import type { Request, Response, NextFunction } from 'express'
import type { ZodError } from 'zod'

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
  ) {
    super(message)
  }
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message })
    return
  }

  const zodError = err as ZodError
  if (zodError.issues) {
    res.status(400).json({ error: 'Validation error', details: zodError.issues })
    return
  }

  console.error(err)
  res.status(500).json({ error: 'Internal server error' })
}
