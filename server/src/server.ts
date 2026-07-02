import 'dotenv/config'
import app from './app.js'
import { prisma } from './config/prisma.js'

const port = Number(process.env['PORT']) || 3000

const start = async () => {
  await prisma.$connect()
  console.log('Database connected')

  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`)
  })
}

start()
