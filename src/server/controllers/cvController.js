import { insforge } from '../config/insforge.js';

export async function listCVs(req, res) {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error, count } = await insforge.database
    .from('cvs')
    .select('id, title, template_id, created_at, updated_at', { count: 'exact' })
    .eq('user_id', req.user.id)
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) return res.status(500).json({ error: error.message });

  res.json({
    success: true,
    data,
    pagination: {
      page,
      limit,
      total: count,
      totalPages: Math.ceil(count / limit),
    },
  });
}

export async function createCV(req, res) {
  const { title, template_id, data: cvData } = req.body;
  if (!title) return res.status(400).json({ error: 'Title is required' });

  const { data, error } = await insforge.database
    .from('cvs')
    .insert({
      user_id: req.user.id,
      title,
      template_id: template_id || 'ats-clean-v1',
      data: cvData || {},
    })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });

  res.status(201).json({ success: true, data });
}

export async function getCV(req, res) {
  const { data, error } = await insforge.database
    .from('cvs')
    .select('*')
    .eq('id', req.params.id)
    .eq('user_id', req.user.id)
    .maybeSingle();

  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ error: 'CV not found' });

  res.json({ success: true, data });
}

export async function updateCV(req, res) {
  const { title, template_id, data: cvData } = req.body;

  const { data, error } = await insforge.database
    .from('cvs')
    .update({
      ...(title && { title }),
      ...(template_id && { template_id }),
      ...(cvData && { data: cvData }),
      updated_at: new Date().toISOString(),
    })
    .eq('id', req.params.id)
    .eq('user_id', req.user.id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ error: 'CV not found' });

  res.json({ success: true, data });
}

export async function deleteCV(req, res) {
  const { data, error } = await insforge.database
    .from('cvs')
    .delete()
    .eq('id', req.params.id)
    .eq('user_id', req.user.id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ error: 'CV not found' });

  res.json({ success: true, message: 'CV deleted' });
}

export async function duplicateCV(req, res) {
  const { title: newTitle } = req.body;

  const { data: original, error: fetchError } = await insforge.database
    .from('cvs')
    .select('*')
    .eq('id', req.params.id)
    .eq('user_id', req.user.id)
    .maybeSingle();

  if (fetchError) return res.status(500).json({ error: fetchError.message });
  if (!original) return res.status(404).json({ error: 'CV not found' });

  const { data, error } = await insforge.database
    .from('cvs')
    .insert({
      user_id: req.user.id,
      title: newTitle || `${original.title} (Copy)`,
      template_id: original.template_id,
      data: original.data,
    })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });

  res.status(201).json({ success: true, data });
}

export async function generateSummary(req, res) {
  const { experiences, skills, target_position, targetPosition, tone, language } = req.body;

  try {
    const { generateProfileSummary } = await import('../services/aiService.js');
    const summary = await generateProfileSummary({
      experiences: experiences || [],
      skills: skills || { technical: [], soft: [] },
      targetPosition: targetPosition || target_position || '',
      tone: tone || 'profesional',
      language: language || 'id',
    });

    res.json({ success: true, data: { summary } });
  } catch (err) {
    res.status(500).json({ error: 'AI generation failed', details: err.message });
  }
}
