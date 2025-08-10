'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import SpaceClient from './SpaceClient'

interface Space {
  id: string
  name: string
  description: string
  created_by: string
}

export default function SpacePage() {
  const [user, setUser] = useState<any>(null)
  const [space, setSpace] = useState<Space | null>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  
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

      setLoading(false)
    }

    initializeSpace()
  }, [spaceId])

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    // For now, just add message locally since PlayApp handles real-time
    const messageData = {
      userId: user.id,
      userName: user.user_metadata?.full_name || user.email,
      message: newMessage,
      timestamp: Date.now()
    }
    
    setMessages(prev => [...prev, messageData])
    setNewMessage('')
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
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm">
                {user?.user_metadata?.full_name || user?.email}
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex">
        {/* Main Virtual Environment Area */}
        <div className="flex-1 p-4">
          <div className="bg-gray-800 rounded-lg p-4 h-full">
            <h3 className="text-lg font-semibold mb-4">Virtual Environment</h3>
            <p className="text-gray-400 mb-4 text-sm">
              Use WASD or arrow keys to move. Get close to other users to start proximity chat.
            </p>
            
            <SpaceClient 
              spaceId={spaceId}
              user={user}
              space={space}
            />
          </div>
        </div>

        {/* Chat Sidebar */}
        <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
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
