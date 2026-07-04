import { io, type Socket } from 'socket.io-client'

let socket: Socket | null = null

export function connectSocket(): Socket {
  if (!socket) {
    const url = import.meta.env.VITE_WS_URL || (import.meta.env.DEV ? 'http://localhost:3000' : undefined)
    socket = io(url, {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    })
    socket.on('connect', () => console.log('Socket connected'))
    socket.on('disconnect', (reason) => console.log('Socket disconnected:', reason))
    socket.on('connect_error', (err) => console.error('Socket error:', err.message))
  }
  return socket
}

export function disconnectSocket() {
  if (socket) {
    socket.removeAllListeners()
    socket.disconnect()
    socket = null
  }
}
