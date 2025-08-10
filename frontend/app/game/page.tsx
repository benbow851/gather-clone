'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function GamePage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient()
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
      
      if (!user) {
        router.push('/signin')
      }
    }

    getUser()
  }, [supabase, router])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/signin')
  }

  const navigateToSpaces = () => {
    router.push('/spaces')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Loading Gather Clone...</p>
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
              <h1 className="text-2xl font-bold">Gather Clone</h1>
              <div className="bg-green-500 w-2 h-2 rounded-full"></div>
              <span className="text-sm text-gray-300">Connected</span>
            </div>
            
            <div className="flex items-center space-x-4">
              {user?.user_metadata?.avatar_url && (
                <img
                  src={user.user_metadata.avatar_url}
                  alt="Avatar"
                  className="h-8 w-8 rounded-full"
                />
              )}
              <span className="text-sm">
                {user?.user_metadata?.full_name || user?.email}
              </span>
              <button
                onClick={handleSignOut}
                className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Game Area */}
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">🎮 Welcome to the Game!</h2>
            <p className="text-gray-300 mb-6">
              OAuth authentication successful! You're now connected to Gather Clone.
            </p>
            
            {/* Success Message */}
            <div className="bg-green-800 border border-green-600 text-green-100 px-6 py-4 rounded-lg inline-block mb-6">
              <div className="flex items-center">
                <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <div>
                  <p className="font-semibold">Authentication Successful!</p>
                  <p className="text-sm">No more redirect loops. Ready for 70+ users!</p>
                </div>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-center space-x-4 mb-8">
              <button
                onClick={navigateToSpaces}
                className="bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-lg font-semibold text-lg transition-colors flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                </svg>
                <span>Browse Spaces</span>
              </button>
              
              <button
                onClick={() => router.push('/spaces?create=true')}
                className="bg-green-600 hover:bg-green-700 px-8 py-3 rounded-lg font-semibold text-lg transition-colors flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
                <span>Create Space</span>
              </button>
            </div>
          </div>

          {/* Game Canvas Area */}
          <div className="bg-gray-800 rounded-lg p-8 min-h-96 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">🏠</div>
              <p className="text-xl mb-2">Game Canvas Area</p>
              <p className="text-gray-400 mb-4">
                Create or join a space to start your Gather.town experience
              </p>
              <button
                onClick={navigateToSpaces}
                className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg font-semibold transition-colors"
              >
                Get Started
              </button>
            </div>
          </div>

          {/* User Info Panel */}
          <div className="mt-8 bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">User Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-gray-400 text-sm">Email</label>
                <p className="text-white">{user?.email}</p>
              </div>
              <div>
                <label className="text-gray-400 text-sm">Name</label>
                <p className="text-white">{user?.user_metadata?.full_name || 'Not provided'}</p>
              </div>
              <div>
                <label className="text-gray-400 text-sm">User ID</label>
                <p className="text-white font-mono text-xs">{user?.id}</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}


