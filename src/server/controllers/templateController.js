import postgres from 'postgres';
import { config } from '../config/env.js';

const sql = postgres(config.database.url);

export async function listTemplates(req, res) {
  try {
    const rows = await sql`
      SELECT * FROM templates WHERE is_active = true ORDER BY created_at ASC
    `;
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('[DB]', err);
    res.status(500).json({ error: 'Terjadi kesalahan' });
  }
}
