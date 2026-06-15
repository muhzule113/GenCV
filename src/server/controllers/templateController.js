import { insforge } from '../config/insforge.js';

export async function listTemplates(req, res) {
  const { data, error } = await insforge.database
    .from('templates')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: true });

  if (error) return res.status(500).json({ error: error.message });

  res.json({ success: true, data });
}
