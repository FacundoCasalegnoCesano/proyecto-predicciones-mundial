import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import nodemailer from 'nodemailer'
import { prisma } from '../../config/prisma.js'
import { AppError } from '../../middlewares/errorHandler.js'
import { createNotification } from '../notifications/notifications.service.js'
import type { JwtPayload } from '../../middlewares/auth.js'

const secret = process.env['JWT_SECRET'] ?? 'secret'
const frontendUrl = process.env['FRONTEND_URL'] ?? 'http://localhost:5173'

const transporter = nodemailer.createTransport({
  host: process.env['SMTP_HOST'] ?? 'smtp.gmail.com',
  port: Number(process.env['SMTP_PORT']) || 587,
  secure: false,
  auth: {
    user: process.env['SMTP_USER'] ?? '',
    pass: process.env['SMTP_PASS'] ?? '',
  },
})

type RegisterInput = {
  username: string
  email: string
  password: string
  firstName?: string
  lastName?: string
}

export async function registerUser(input: RegisterInput) {
  const existing = await prisma.user.findFirst({
    where: { OR: [{ email: input.email }, { username: input.username }] },
  })
  if (existing) {
    throw new AppError(409, 'Email or username already taken')
  }

  const hashed = await bcrypt.hash(input.password, 10)
  const user = await prisma.user.create({
    data: {
      username: input.username,
      email: input.email,
      password: hashed,
      firstName: input.firstName,
      lastName: input.lastName,
    },
  })

  const token = signToken({ userId: user.id, role: user.role })

  await createNotification(user.id, 'register', 'Cuenta creada correctamente')

  return { token, user: sanitize(user) }
}

export async function loginUser(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    throw new AppError(401, 'Invalid credentials')
  }

  const valid = await bcrypt.compare(password, user.password)
  if (!valid) {
    throw new AppError(401, 'Invalid credentials')
  }

  const token = signToken({ userId: user.id, role: user.role })

  const displayName = user.firstName || user.username
  await createNotification(user.id, 'login', `Bienvenido de nuevo, ${displayName}!`)

  return { token, user: sanitize(user) }
}

export async function getProfile(userId: number) {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) {
    throw new AppError(404, 'User not found')
  }
  return sanitize(user)
}

export async function updateProfile(userId: number, data: { firstName?: string; lastName?: string; email?: string; username?: string }) {
  if (data.email || data.username) {
    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          ...(data.email ? [{ email: data.email }] : []),
          ...(data.username ? [{ username: data.username }] : []),
        ],
        NOT: { id: userId },
      },
    })
    if (existing) {
      throw new AppError(409, 'Email or username already taken')
    }
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data,
  })

  await createNotification(userId, 'profile_updated', 'Perfil actualizado correctamente')

  return sanitize(user)
}

export async function changePassword(userId: number, currentPassword: string, newPassword: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) {
    throw new AppError(404, 'User not found')
  }

  const valid = await bcrypt.compare(currentPassword, user.password)
  if (!valid) {
    throw new AppError(400, 'Current password is incorrect')
  }

  const hashed = await bcrypt.hash(newPassword, 10)
  await prisma.user.update({ where: { id: userId }, data: { password: hashed } })

  await createNotification(userId, 'password_changed', 'Contraseña cambiada correctamente')
}

export async function deleteAccount(userId: number) {
  await prisma.user.delete({ where: { id: userId } })
}

export async function forgotPassword(email: string) {
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return { message: 'If the email exists, a reset link has been sent' }

  const token = jwt.sign({ userId: user.id, type: 'reset' }, secret, { expiresIn: '1h' })

  const resetLink = `${frontendUrl}/reset-password?token=${token}`

  await transporter.sendMail({
    from: process.env['SMTP_USER'],
    to: email,
    subject: 'Recuperación de contraseña - Mundial 2026',
    html: `<p>Hacé click acá para restablecer tu contraseña:</p><p><a href="${resetLink}">${resetLink}</a></p><p>Este link expira en 1 hora.</p>`,
  })

  return { message: 'If the email exists, a reset link has been sent' }
}

export async function resetPassword(token: string, newPassword: string) {
  let payload: { userId: number; type: string }
  try {
    payload = jwt.verify(token, secret) as { userId: number; type: string }
  } catch {
    throw new AppError(400, 'Invalid or expired reset token')
  }

  if (payload.type !== 'reset') throw new AppError(400, 'Invalid token type')

  const hashed = await bcrypt.hash(newPassword, 10)
  await prisma.user.update({ where: { id: payload.userId }, data: { password: hashed } })
}

function sanitize(user: { id: number; username: string; email: string; firstName: string | null; lastName: string | null; role: string }) {
  return { id: user.id, username: user.username, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role }
}

function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, secret, { expiresIn: '7d' })
}
