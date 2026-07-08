import 'dotenv/config'
import './config/env.js'
import { prisma } from './config/prisma.js'
import { createSocketServer } from './config/socket.js'

const port = Number(process.env['PORT']) || 3000

const start = async () => {
  await prisma.$connect()
  console.log('Database connected')

  const httpServer = createSocketServer()

  httpServer.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`)
  })
}

start()
