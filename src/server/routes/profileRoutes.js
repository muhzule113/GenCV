import express from 'express'
import postgres from 'postgres'
import { config } from '../config/env.js'
import { requireAuth } from '../middleware/authMiddleware.js'

const sql = postgres(config.database.url)
const router = express.Router()

router.get('/', requireAuth, async (req, res) => {
  try {
    const [row] = await sql`
      SELECT * FROM user_profiles WHERE user_id = ${req.user.id} LIMIT 1
    `
    res.json({ success: true, data: row || null })
  } catch (err) {
    console.error('[DB]', err)
    res.status(500).json({ error: 'Terjadi kesalahan' })
  }
})

router.put('/', requireAuth, async (req, res) => {
  const profileData = req.body

  try {
    const [row] = await sql`
      INSERT INTO user_profiles (user_id, data, updated_at)
      VALUES (${req.user.id}, ${sql.json(profileData)}, NOW())
      ON CONFLICT (user_id) DO UPDATE SET
        data = EXCLUDED.data,
        updated_at = NOW()
      RETURNING *
    `
    res.json({ success: true, data: row })
  } catch (err) {
    console.error('[DB]', err)
    res.status(500).json({ error: 'Terjadi kesalahan' })
  }
})

export default router
