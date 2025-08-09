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

  return router
}