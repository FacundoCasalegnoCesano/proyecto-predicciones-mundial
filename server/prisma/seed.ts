import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  const existing = await prisma.user.findUnique({ where: { email: 'facu@test.com' } })

  if (existing) {
    await prisma.user.update({
      where: { email: 'facu@test.com' },
      data: { role: 'ADMIN' },
    })
    console.log('User facu@test.com promoted to ADMIN')
  } else {
    const hashed = await bcrypt.hash('123456', 10)
    await prisma.user.create({
      data: {
        username: 'facu',
        email: 'facu@test.com',
        password: hashed,
        firstName: 'Facundo',
        lastName: 'Admin',
        role: 'ADMIN',
      },
    })
    console.log('User facu@test.com created with ADMIN role')
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
