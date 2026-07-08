import { prisma } from '../../config/prisma.js'
import { getIO } from '../../config/socket.js'

export async function createNotification(userId: number, type: string, message: string, data?: string) {
  const notification = await prisma.notification.create({
    data: { userId, type, message, data },
  })

  getIO().to(`user:${userId}`).emit('notification', notification)

  return notification
}

export async function getUserNotifications(userId: number) {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })
}

export async function markAsRead(notificationId: number, userId: number) {
  const notification = await prisma.notification.findFirst({
    where: { id: notificationId, userId },
  })
  if (!notification) throw new Error('Notification not found')

  return prisma.notification.update({
    where: { id: notificationId },
    data: { read: true },
  })
}

export async function markAllAsRead(userId: number) {
  await prisma.notification.updateMany({
    where: { userId, read: false },
    data: { read: true },
  })
}
