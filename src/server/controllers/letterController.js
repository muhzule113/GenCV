import { insforge } from '../config/insforge.js';

export async function listLetters(req, res) {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error, count } = await insforge.database
    .from('cover_letters')
    .select('id, position, company, cv_id, created_at, updated_at', { count: 'exact' })
    .eq('user_id', req.user.id)
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) return res.status(500).json({ error: error.message });

  res.json({
    success: true,
    data,
    pagination: { page, limit, total: count, totalPages: Math.ceil(count / limit) },
  });
}

export async function createLetter(req, res) {
  const { cv_id, position, company, content } = req.body;
  if (!position || !company) {
    return res.status(400).json({ error: 'Position and company are required' });
  }

  const { data, error } = await insforge.database
    .from('cover_letters')
    .insert({
      user_id: req.user.id,
      cv_id: cv_id || null,
      position,
      company,
      content: content || '',
    })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });

  res.status(201).json({ success: true, data });
}

export async function getLetter(req, res) {
  const { data, error } = await insforge.database
    .from('cover_letters')
    .select('*')
    .eq('id', req.params.id)
    .eq('user_id', req.user.id)
    .maybeSingle();

  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ error: 'Cover letter not found' });

  res.json({ success: true, data });
}

export async function updateLetter(req, res) {
  const { cv_id, position, company, content } = req.body;

  const { data, error } = await insforge.database
    .from('cover_letters')
    .update({
      ...(cv_id !== undefined && { cv_id }),
      ...(position && { position }),
      ...(company && { company }),
      ...(content !== undefined && { content }),
      updated_at: new Date().toISOString(),
    })
    .eq('id', req.params.id)
    .eq('user_id', req.user.id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ error: 'Cover letter not found' });

  res.json({ success: true, data });
}

export async function deleteLetter(req, res) {
  const { data, error } = await insforge.database
    .from('cover_letters')
    .delete()
    .eq('id', req.params.id)
    .eq('user_id', req.user.id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ error: 'Cover letter not found' });

  res.json({ success: true, message: 'Cover letter deleted' });
}

export async function generateLetter(req, res) {
  const { cv_id, position, company, company_field, info_source, recipient_title, highlights } = req.body;

  if (!position || !company) {
    return res.status(400).json({ error: 'Position and company are required' });
  }

  let cvData = null;
  if (cv_id) {
    const { data } = await insforge.database
      .from('cvs')
      .select('data')
      .eq('id', cv_id)
      .eq('user_id', req.user.id)
      .maybeSingle();
    cvData = data?.data || null;
  }

  try {
    const { generateCoverLetter } = await import('../services/aiService.js');
    const content = await generateCoverLetter({
      position,
      company,
      companyField: company_field,
      infoSource: info_source,
      recipientTitle: recipient_title,
      highlights: highlights || [],
      cvData,
    });

    res.json({ success: true, data: { content } });
  } catch (err) {
    res.status(500).json({ error: 'AI generation failed', details: err.message });
  }
}

export async function recommendHighlights(req, res) {
  const { position, cv_id } = req.body;

  if (!position) {
    return res.status(400).json({ error: 'Position is required' });
  }

  let cvData = null;
  if (cv_id) {
    const { data } = await insforge.database
      .from('cvs')
      .select('data')
      .eq('id', cv_id)
      .eq('user_id', req.user.id)
      .maybeSingle();
    cvData = data?.data || null;
  }

  try {
    const { recommendHighlights: recommendFn } = await import('../services/aiService.js');
    const raw = await recommendFn({ position, cvData });

    let highlights = [];
    try {
      highlights = JSON.parse(raw);
      if (!Array.isArray(highlights)) throw new Error('Not an array');
    } catch {
      const fallbackMap = {
        admin: ['Pengalaman administrasi perkantoran', 'Kemampuan komunikasi dan koordinasi tim', 'Terampil menggunakan MS Office', 'Teliti dan detail-oriented', 'Mampu bekerja dalam tekanan'],
        staff: ['Pengalaman operasional harian', 'Kemampuan problem solving', 'Kerja tim yang solid', 'Disiplin dan bertanggung jawab', 'Adaptif terhadap perubahan'],
      };
      const key = Object.keys(fallbackMap).find(k => position.toLowerCase().includes(k));
      highlights = key ? fallbackMap[key] : ['Pengalaman relevan di bidang terkait', 'Kemampuan belajar cepat', 'Komitmen terhadap target', 'Komunikasi efektif', 'Integritas dan etos kerja tinggi'];
    }

    res.json({ success: true, data: { highlights } });
  } catch (err) {
    res.status(500).json({ error: 'AI recommendation failed', details: err.message });
  }
}
