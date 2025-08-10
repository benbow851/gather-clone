import express from 'express'
import { generateGuestAgoraToken } from './tokens'

export default function routes() {
  const router = express.Router()

  router.post('/guest/agora-token', async (req, res) => {
    try {
      const { channelName } = req.body
      if (!channelName) return res.status(400).json({ error: 'channelName required' })
      const token = await generateGuestAgoraToken(channelName)
      return res.json({ token })
    } catch (e) {
      return res.status(500).json({ error: 'failed_to_generate_token' })
    }
  })

  // Spaces API
  router.get('/spaces', async (req, res) => {
    try {
      // For now, return mock data. Later you can integrate with Supabase
      const mockSpaces = [
        {
          id: '1',
          name: 'Welcome Lounge',
          description: 'A friendly space for new users to get started',
          created_by: 'system',
          created_at: new Date().toISOString(),
          is_public: true,
          participant_count: 0
        },
        {
          id: '2',
          name: 'Developer Hub',
          description: 'Space for developers to collaborate and share ideas',
          created_by: 'system',
          created_at: new Date().toISOString(),
          is_public: true,
          participant_count: 0
        }
      ]
      return res.json(mockSpaces)
    } catch (e) {
      return res.status(500).json({ error: 'failed_to_fetch_spaces' })
    }
  })

  router.post('/spaces', async (req, res) => {
    try {
      const { name, description, is_public, created_by } = req.body
      if (!name || !created_by) {
        return res.status(400).json({ error: 'name and created_by are required' })
      }

      // Create a new space (mock implementation)
      const newSpace = {
        id: Date.now().toString(),
        name,
        description: description || '',
        created_by,
        created_at: new Date().toISOString(),
        is_public: is_public !== false, // default to true
        participant_count: 0
      }

      // Here you would typically save to Supabase
      // For now, just return the created space
      return res.status(201).json(newSpace)
    } catch (e) {
      return res.status(500).json({ error: 'failed_to_create_space' })
    }
  })

  router.get('/spaces/:id', async (req, res) => {
    try {
      const { id } = req.params
      
      // Mock space data - later integrate with Supabase
      const mockSpace = {
        id,
        name: `Space ${id}`,
        description: 'A virtual space for collaboration',
        created_by: 'system',
        created_at: new Date().toISOString(),
        is_public: true
      }

      return res.json(mockSpace)
    } catch (e) {
      return res.status(500).json({ error: 'failed_to_fetch_space' })
    }
  })

  return router
}