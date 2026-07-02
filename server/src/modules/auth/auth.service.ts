import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { prisma } from '../../config/prisma.js'
import { AppError } from '../../middlewares/errorHandler.js'
import type { JwtPayload } from '../../middlewares/auth.js'

const secret = process.env['JWT_SECRET'] ?? 'secret'

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
}

export async function deleteAccount(userId: number) {
  await prisma.user.delete({ where: { id: userId } })
}

function sanitize(user: { id: number; username: string; email: string; firstName: string | null; lastName: string | null; role: string }) {
  return { id: user.id, username: user.username, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role }
}

function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, secret, { expiresIn: '7d' })
}
