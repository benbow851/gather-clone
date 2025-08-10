'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { io, Socket } from 'socket.io-client'

interface User {
  id: string
  name: string
  avatar: string
  x: number
  y: number
  color: string
}

interface Space {
  id: string
  name: string
  description: string
  created_by: string
}

export default function SpacePage() {
  const [user, setUser] = useState<any>(null)
  const [space, setSpace] = useState<Space | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const [loading, setLoading] = useState(true)
  
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const socketRef = useRef<Socket | null>(null)
  const router = useRouter()
  const params = useParams()
  const spaceId = params.id as string
  
  const supabase = createClientComponentClient()

  useEffect(() => {
    const initializeSpace = async () => {
      // Get authenticated user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/signin')
        return
      }
      setUser(user)

      // Fetch space details
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/spaces/${spaceId}`)
        if (response.ok) {
          const spaceData = await response.json()
          setSpace(spaceData)
        }
      } catch (error) {
        console.error('Failed to fetch space:', error)
      }

      // Initialize socket connection
      initializeSocket(user)
      setLoading(false)
    }

    initializeSpace()

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect()
      }
    }
  }, [spaceId])

  const initializeSocket = (user: any) => {
    if (!process.env.NEXT_PUBLIC_BACKEND_URL) return

    const socket = io(process.env.NEXT_PUBLIC_BACKEND_URL)
    socketRef.current = socket

    socket.on('connect', () => {
      setIsConnected(true)
      // Join the specific space
      socket.emit('join-space', {
        spaceId,
        user: {
          id: user.id,
          name: user.user_metadata?.full_name || user.email,
          avatar: user.user_metadata?.avatar_url,
          x: 400, // Starting position
          y: 300,
          color: getRandomColor()
        }
      })
    })

    socket.on('disconnect', () => {
      setIsConnected(false)
    })

    socket.on('users-update', (updatedUsers: User[]) => {
      setUsers(updatedUsers)
      drawCanvas(updatedUsers)
    })

    socket.on('user-moved', (movedUser: User) => {
      setUsers(prev => prev.map(u => u.id === movedUser.id ? movedUser : u))
    })

    socket.on('message', (message: any) => {
      setMessages(prev => [...prev, message])
    })

    socket.on('error', (error: any) => {
      console.error('Socket error:', error)
    })
  }

  const drawCanvas = (userList: User[]) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw background
    ctx.fillStyle = '#1f2937'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw grid
    ctx.strokeStyle = '#374151'
    ctx.lineWidth = 1
    for (let x = 0; x < canvas.width; x += 50) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, canvas.height)
      ctx.stroke()
    }
    for (let y = 0; y < canvas.height; y += 50) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(canvas.width, y)
      ctx.stroke()
    }

    // Draw users
    userList.forEach(drawUser)
  }

  const drawUser = (user: User) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Draw user circle
    ctx.beginPath()
    ctx.arc(user.x, user.y, 20, 0, 2 * Math.PI)
    ctx.fillStyle = user.color
    ctx.fill()
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 2
    ctx.stroke()

    // Draw user name
    ctx.fillStyle = '#ffffff'
    ctx.font = '12px Arial'
    ctx.textAlign = 'center'
    ctx.fillText(user.name, user.x, user.y - 30)
  }

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!socketRef.current || !user) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Emit movement to server
    socketRef.current.emit('move-user', {
      spaceId,
      userId: user.id,
      x,
      y
    })
  }

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !socketRef.current || !user) return

    socketRef.current.emit('send-message', {
      spaceId,
      userId: user.id,
      userName: user.user_metadata?.full_name || user.email,
      message: newMessage,
      timestamp: Date.now()
    })

    setNewMessage('')
  }

  const getRandomColor = () => {
    const colors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899']
    return colors[Math.floor(Math.random() * colors.length)]
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Loading space...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Header */}
      <header className="bg-gray-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/spaces')}
                className="text-gray-300 hover:text-white"
              >
                ← Back to Spaces
              </button>
              <h1 className="text-xl font-bold">{space?.name || 'Virtual Space'}</h1>
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm text-gray-300">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-300">
                {users.length} user{users.length !== 1 ? 's' : ''} online
              </span>
              <span className="text-sm">
                {user?.user_metadata?.full_name || user?.email}
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex">
        {/* Main Canvas Area */}
        <div className="flex-1 p-4">
          <div className="bg-gray-800 rounded-lg p-4 h-full">
            <h3 className="text-lg font-semibold mb-4">Virtual Environment</h3>
            <p className="text-gray-400 mb-4 text-sm">
              Click anywhere to move your avatar. Get close to other users to start proximity chat.
            </p>
            
            <canvas
              ref={canvasRef}
              width={800}
              height={600}
              onClick={handleCanvasClick}
              className="border border-gray-600 rounded cursor-pointer bg-gray-700 w-full max-w-4xl mx-auto"
            />
          </div>
        </div>

        {/* Chat Sidebar */}
        <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
          {/* Online Users */}
          <div className="p-4 border-b border-gray-700">
            <h3 className="font-semibold mb-3">Online Users ({users.length})</h3>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {users.map((spaceUser) => (
                <div key={spaceUser.id} className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: spaceUser.color }}
                  ></div>
                  <span className="text-sm truncate">{spaceUser.name}</span>
                  {spaceUser.id === user?.id && (
                    <span className="text-xs text-gray-400">(you)</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 p-4 overflow-y-auto">
            <h3 className="font-semibold mb-3">Chat</h3>
            <div className="space-y-2 mb-4">
              {messages.map((msg, index) => (
                <div key={index} className="text-sm">
                  <span className="text-blue-400">{msg.userName}:</span>
                  <span className="ml-2">{msg.message}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Chat Input */}
          <div className="p-4 border-t border-gray-700">
            <form onSubmit={sendMessage} className="flex space-x-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={!newMessage.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-3 py-2 rounded text-sm font-semibold transition-colors"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
