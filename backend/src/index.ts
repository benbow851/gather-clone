import express from 'express'
import cors from 'cors'
import http from 'http'
import { Server as SocketIOServer } from 'socket.io'
import { sockets } from './sockets/sockets'
import routes from './routes/routes'
import { supabase } from './supabase'
import { sessionManager } from './session'

require('dotenv').config()

const app = express()
const server = http.createServer(app)

app.use(cors({
    origin: process.env.FRONTEND_URL || '*'
}))
app.use(express.json())

// Health check route for Railway
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Gather Clone Backend is running' })
})

// WebSocket test endpoint
app.get('/ws-test', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'WebSocket test endpoint',
    socketIO: 'enabled',
    cors: process.env.FRONTEND_URL || '*'
  })
})

// Initialize Socket.IO server
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.FRONTEND_URL || '*',
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['websocket', 'polling'],
  allowEIO3: true
})

// Mount routes under /api prefix
app.use('/api', routes())

sockets(io)

// Only initialize Supabase if environment variables are available
if (process.env.SUPABASE_URL && process.env.SERVICE_ROLE) {
  function onRealmUpdate(payload: any) {
      const id = payload.new.id
      let refresh = false
      if (JSON.stringify(payload.new.map_data) !== JSON.stringify(payload.old.map_data)) {
          refresh = true
      }
      if (payload.new.share_id !== payload.old.share_id) {
          refresh = true
      }
      if (payload.new.only_owner) {
          refresh = true
      }
      if (refresh) {
          sessionManager.terminateSession(id, "This realm has been changed by the owner.")
      }
  }

  function onRealmDelete(payload: any) {
      sessionManager.terminateSession(payload.old.id, "This realm is no longer available.")
  }

  supabase
      .channel('realms')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'realms' }, onRealmUpdate)
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'realms' }, onRealmDelete)
      .subscribe()
} else {
  console.log('⚠️  Supabase environment variables not found. Skipping Supabase initialization.')
}

const PORT = process.env.PORT || 3001
server.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`)
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'Not configured'}`)
  console.log(`🔐 Supabase: ${process.env.SUPABASE_URL ? 'Configured' : 'Not configured'}`)
})

export { io }