import { z } from 'zod'

export const registerSchema = z.object({
  username: z.string().min(3).max(30),
  email: z.string().email(),
  password: z.string().min(6).max(100),
  firstName: z.string().max(100).optional(),
  lastName: z.string().max(100).optional(),
})

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
})

export const updateProfileSchema = z.object({
  firstName: z.string().max(100).optional(),
  lastName: z.string().max(100).optional(),
  email: z.string().email().optional(),
  username: z.string().min(3).max(30).optional(),
})

export const changePasswordSchema = z.object({
  currentPassword: z.string(),
  newPassword: z.string().min(6).max(100),
})

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
})

export const resetPasswordSchema = z.object({
  token: z.string(),
  password: z.string().min(6).max(100),
})
