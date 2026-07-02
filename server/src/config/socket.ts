import { Server as SocketServer } from 'socket.io'
import { createServer } from 'http'
import app from '../app.js'

let io: SocketServer

export function getIO(): SocketServer {
  return io
}

export function createSocketServer() {
  const httpServer = createServer(app)
  io = new SocketServer(httpServer, {
    cors: { origin: '*' },
  })
  return httpServer
}
