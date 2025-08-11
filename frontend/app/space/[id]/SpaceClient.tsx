'use client'

import { useEffect, useRef, useState } from 'react'
import { PlayApp } from '@/utils/pixi/PlayApp'
import { defaultSkin } from '@/utils/pixi/Player/skins'
import { formatEmailToName } from '@/utils/formatEmailToName'

interface SpaceClientProps {
  spaceId: string
  user: any
  space: any
}

export default function SpaceClient({ spaceId, user, space }: SpaceClientProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const playAppRef = useRef<PlayApp | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!containerRef.current || !user) return

    const initializePixiApp = async () => {
      try {
        console.log('🚀 Starting Pixi initialization...')
        console.log('👤 User:', user)
        console.log('🏠 Space ID:', spaceId)
        
        // Create default realm data for the space
        const defaultRealmData = {
          spawnpoint: {
            roomIndex: 0,
            x: 10,
            y: 10
          },
          rooms: [{
            name: 'Main Room',
            tilemap: createDefaultTilemap()
          }]
        }
        
        console.log('🗺️ Default realm data:', defaultRealmData)

        // Initialize PlayApp with the default data
        const playApp = new PlayApp(
          user.id,
          spaceId,
          defaultRealmData,
          formatEmailToName(user.user_metadata?.email) || user.email,
          defaultSkin
        )

        playAppRef.current = playApp
        console.log('🎮 PlayApp created, initializing...')
        
        // Initialize the Pixi app
        await playApp.init()
        console.log('✅ PlayApp initialized successfully')
        
        // Add the Pixi view to the container
        if (containerRef.current && playApp.getApp().view) {
          console.log('🎨 Adding Pixi view to container')
          containerRef.current.appendChild(playApp.getApp().view)
          console.log('✅ Pixi view added to container')
        } else {
          console.error('❌ Container or Pixi view not found')
          console.log('Container ref:', containerRef.current)
          console.log('Pixi view:', playApp.getApp().view)
        }

        setIsLoading(false)
        console.log('🎯 Loading complete!')
      } catch (error) {
        console.error('❌ Failed to initialize Pixi app:', error)
        console.error('Error details:', error)
        setIsLoading(false)
      }
    }

    initializePixiApp()

    return () => {
      if (playAppRef.current) {
        playAppRef.current.destroy()
      }
    }
  }, [spaceId, user, space])

  // Create a default tilemap for new spaces
  const createDefaultTilemap = () => {
    const tilemap: { [key: string]: any } = {}
    
    // Create a 20x15 grid with grass tiles
    for (let x = 0; x < 20; x++) {
      for (let y = 0; y < 15; y++) {
        const key = `${x}, ${y}` // Note the space after comma
        
        // Create a path in the center
        if (x >= 8 && x <= 11 && y >= 6 && y <= 8) {
          tilemap[key] = {
            floor: 'ground',
            above_floor: 'path'
          }
        } else {
          tilemap[key] = {
            floor: 'ground',
            above_floor: 'grass'
          }
        }
      }
    }

    // Add some decorative elements
    tilemap['5, 5'] = { 
      floor: 'ground', 
      above_floor: 'grass',
      object: 'tree',
      impassable: true
    }
    tilemap['15, 5'] = { 
      floor: 'ground', 
      above_floor: 'grass',
      object: 'tree',
      impassable: true
    }
    tilemap['5, 10'] = { 
      floor: 'ground', 
      above_floor: 'grass',
      object: 'tree',
      impassable: true
    }
    tilemap['15, 10'] = { 
      floor: 'ground', 
      above_floor: 'grass',
      object: 'tree',
      impassable: true
    }
    
    // Add a table in the center
    tilemap['9, 7'] = { 
      floor: 'ground', 
      above_floor: 'path',
      object: 'table'
    }
    tilemap['10, 7'] = { 
      floor: 'ground', 
      above_floor: 'path',
      object: 'table'
    }

    return tilemap
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Loading virtual environment...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full">
      <div 
        id="app-container"
        ref={containerRef} 
        className="w-full h-full flex items-center justify-center"
        style={{ minHeight: '600px' }}
      />
    </div>
  )
}
