'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Space {
  id: string
  name: string
  description: string
  created_by: string
  created_at: string
  is_public: boolean
  participant_count: number
}

export default function SpacesPage() {
  const [user, setUser] = useState<any>(null)
  const [spaces, setSpaces] = useState<Space[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  
  const supabase = createClientComponentClient()
  const router = useRouter()

  // Form state
  const [newSpace, setNewSpace] = useState({
    name: '',
    description: '',
    is_public: true
  })

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      if (!user) {
        router.push('/signin')
        return
      }
      await fetchSpaces()
    }
    getUser()

    // Check if we should show create form from URL params
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('create') === 'true') {
      setShowCreateForm(true)
    }
  }, [])

  const fetchSpaces = async () => {
    setLoading(true)
    try {
      // Fetch from your backend API
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL
      const fullBackendUrl = backendUrl?.startsWith('http') ? backendUrl : `https://${backendUrl}`
      
      const response = await fetch(`${fullBackendUrl}/api/spaces`)
      if (response.ok) {
        const spacesData = await response.json()
        setSpaces(spacesData)
      }
    } catch (error) {
      console.error('Failed to fetch spaces:', error)
    }
    setLoading(false)
  }

  const createSpace = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('🚀 Frontend: Create Space button clicked')
    console.log('📝 Form data:', newSpace)
    console.log('👤 User:', user)
    
    if (!user || !newSpace.name.trim()) {
      console.log('❌ Frontend: Missing user or space name')
      return
    }

    setCreating(true)
    console.log('🔄 Frontend: Sending request to backend...')
    
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL
      console.log('🌐 Backend URL:', backendUrl)
      
      // Ensure the backend URL has the correct protocol
      const fullBackendUrl = backendUrl?.startsWith('http') ? backendUrl : `https://${backendUrl}`
      console.log('🔗 Full Backend URL:', fullBackendUrl)
      
      const requestBody = {
        name: newSpace.name,
        description: newSpace.description,
        is_public: newSpace.is_public,
        created_by: user.id,
      }
      console.log('📤 Request body:', requestBody)
      
      const response = await fetch(`${fullBackendUrl}/api/spaces`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      console.log('📥 Response status:', response.status)
      console.log('📥 Response ok:', response.ok)

      if (response.ok) {
        const createdSpace = await response.json()
        console.log('✅ Frontend: Space created successfully:', createdSpace)
        setSpaces([createdSpace, ...spaces])
        setNewSpace({ name: '', description: '', is_public: true })
        setShowCreateForm(false)
        
        // Redirect to the new space
        router.push(`/space/${createdSpace.id}`)
      } else {
        const errorText = await response.text()
        console.error('❌ Frontend: Backend error:', response.status, errorText)
      }
    } catch (error) {
      console.error('❌ Frontend: Network error:', error)
    }
    setCreating(false)
  }

  const joinSpace = (spaceId: string) => {
    router.push(`/space/${spaceId}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Loading spaces...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold">Gather Clone Spaces</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-300">
                Welcome, {user?.user_metadata?.full_name || user?.email}
              </span>
              <button
                onClick={() => router.push('/game')}
                className="bg-gray-600 hover:bg-gray-700 px-3 py-1 rounded text-sm transition-colors"
              >
                Back to Game
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Create Space Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold">Virtual Spaces</h2>
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg font-semibold transition-colors"
            >
              {showCreateForm ? 'Cancel' : 'Create New Space'}
            </button>
          </div>

          {/* Create Space Form */}
          {showCreateForm && (
            <div className="bg-gray-800 rounded-lg p-6 mb-6">
              <h3 className="text-xl font-semibold mb-4">Create a New Space</h3>
              <form onSubmit={createSpace} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Space Name</label>
                  <input
                    type="text"
                    value={newSpace.name}
                    onChange={(e) => setNewSpace({ ...newSpace, name: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter space name..."
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Description (Optional)</label>
                  <textarea
                    value={newSpace.description}
                    onChange={(e) => setNewSpace({ ...newSpace, description: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Describe your space..."
                    rows={3}
                  />
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_public"
                    checked={newSpace.is_public}
                    onChange={(e) => setNewSpace({ ...newSpace, is_public: e.target.checked })}
                    className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="is_public" className="text-sm">
                    Make this space public (others can discover and join)
                  </label>
                </div>
                
                <div className="flex space-x-3">
                  <button
                    type="submit"
                    disabled={creating || !newSpace.name.trim()}
                    className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 px-6 py-2 rounded-md font-semibold transition-colors"
                  >
                    {creating ? 'Creating...' : 'Create Space'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="bg-gray-600 hover:bg-gray-700 px-6 py-2 rounded-md font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Spaces List */}
        <div>
          <h3 className="text-xl font-semibold mb-4">Available Spaces</h3>
          
          {spaces.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🏠</div>
              <h3 className="text-xl font-semibold mb-2">No spaces yet</h3>
              <p className="text-gray-400 mb-4">Create your first virtual space to get started!</p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg font-semibold transition-colors"
              >
                Create First Space
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {spaces.map((space) => (
                <div
                  key={space.id}
                  className="bg-gray-800 rounded-lg p-6 hover:bg-gray-750 transition-colors border border-gray-700"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="text-lg font-semibold truncate">{space.name}</h4>
                    {space.is_public ? (
                      <span className="bg-green-600 text-xs px-2 py-1 rounded">Public</span>
                    ) : (
                      <span className="bg-gray-600 text-xs px-2 py-1 rounded">Private</span>
                    )}
                  </div>
                  
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                    {space.description || 'No description provided'}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      {space.participant_count || 0} participants
                    </div>
                    <button
                      onClick={() => joinSpace(space.id)}
                      className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm font-semibold transition-colors"
                    >
                      Join Space
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
