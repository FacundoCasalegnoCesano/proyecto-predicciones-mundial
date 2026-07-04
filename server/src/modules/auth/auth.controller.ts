import type { Request, Response, NextFunction } from 'express'
import { registerSchema, loginSchema, updateProfileSchema, changePasswordSchema, forgotPasswordSchema, resetPasswordSchema } from './auth.validation.js'
import { registerUser, loginUser, getProfile, updateProfile, changePassword, deleteAccount, forgotPassword, resetPassword } from './auth.service.js'

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = registerSchema.parse(req.body)
    const result = await registerUser(data)
    res.status(201).json(result)
  } catch (err) {
    next(err)
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = loginSchema.parse(req.body)
    const result = await loginUser(data.email, data.password)
    res.json(result)
  } catch (err) {
    next(err)
  }
}

export async function me(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await getProfile(req.user!.userId)
    res.json(user)
  } catch (err) {
    next(err)
  }
}

export async function updateProfileHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = updateProfileSchema.parse(req.body)
    const user = await updateProfile(req.user!.userId, data)
    res.json(user)
  } catch (err) {
    next(err)
  }
}

export async function changePasswordHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = changePasswordSchema.parse(req.body)
    await changePassword(req.user!.userId, data.currentPassword, data.newPassword)
    res.json({ message: 'Password changed' })
  } catch (err) {
    next(err)
  }
}

export async function deleteAccountHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await deleteAccount(req.user!.userId)
    res.json({ message: 'Account deleted' })
  } catch (err) {
    next(err)
  }
}

export async function forgotPasswordHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = forgotPasswordSchema.parse(req.body)
    const result = await forgotPassword(data.email)
    res.json(result)
  } catch (err) {
    next(err)
  }
}

export async function resetPasswordHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = resetPasswordSchema.parse(req.body)
    await resetPassword(data.token, data.password)
    res.json({ message: 'Password reset successfully' })
  } catch (err) {
    next(err)
  }
}
