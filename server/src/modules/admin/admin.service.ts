import { prisma } from '../../config/prisma.js'
import { AppError } from '../../middlewares/errorHandler.js'
import { createNotification } from '../notifications/notifications.service.js'

export async function listUsers(search?: string) {
  const where = search
    ? {
        OR: [
          { username: { contains: search } },
          { email: { contains: search } },
          { firstName: { contains: search } },
          { lastName: { contains: search } },
        ],
      }
    : {}

  const users = await prisma.user.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  })

  return users.map((u) => ({
    id: u.id,
    username: u.username,
    email: u.email,
    firstName: u.firstName,
    lastName: u.lastName,
    role: u.role,
    createdAt: u.createdAt,
  }))
}

export async function updateUserRole(userId: number, role: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) {
    throw new AppError(404, 'User not found')
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { role },
  })

  await createNotification(userId, 'role_changed', `Tu rol ha sido cambiado a ${role === 'ADMIN' ? 'Administrador' : 'Usuario'}`)

  return { id: updated.id, username: updated.username, email: updated.email, firstName: updated.firstName, lastName: updated.lastName, role: updated.role }
}
