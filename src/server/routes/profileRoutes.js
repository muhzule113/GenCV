import express from 'express'
import { insforge } from '../config/insforge.js'
import { requireAuth } from '../middleware/authMiddleware.js'

const router = express.Router()

router.get('/', requireAuth, async (req, res) => {
  const { data, error } = await insforge.database
    .from('user_profiles')
    .select('*')
    .eq('user_id', req.user.id)
    .single()

  if (error && error.code !== 'PGRST116') {
    console.error('[DB]', error);
    return res.status(500).json({ error: 'Terjadi kesalahan' })
  }

  res.json({ success: true, data: data || null })
})

router.put('/', requireAuth, async (req, res) => {
  const profileData = req.body

  const { data, error } = await insforge.database
    .from('user_profiles')
    .upsert({
      user_id: req.user.id,
      data: profileData,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' })
    .select()
    .single()

  if (error) {
    console.error('[DB]', error);
    return res.status(500).json({ error: 'Terjadi kesalahan' })
  }

  res.json({ success: true, data })
})

export default router
