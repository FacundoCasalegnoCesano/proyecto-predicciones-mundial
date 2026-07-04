import { z } from 'zod'

const passwordSchema = z.string()
  .min(8, 'Mínimo 8 caracteres')
  .max(100)
  .regex(/[A-Z]/, 'Debe contener una mayúscula')
  .regex(/[a-z]/, 'Debe contener una minúscula')
  .regex(/[0-9]/, 'Debe contener un número')
  .regex(/[^A-Za-z0-9]/, 'Debe contener un carácter especial')

export const registerSchema = z.object({
  username: z.string().min(3).max(30),
  email: z.string().email(),
  password: passwordSchema,
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
  newPassword: passwordSchema,
})

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
})

export const resetPasswordSchema = z.object({
  token: z.string(),
  password: passwordSchema,
})
