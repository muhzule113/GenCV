import crypto from 'crypto';
import { insforge } from '../config/insforge.js';

export async function listCVs(req, res) {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error, count } = await insforge.database
    .from('cvs')
    .select('id, title, template_id, share_token, created_at, updated_at', { count: 'exact' })
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

export async function analyzeJobMatch(req, res) {
  const { cvData, jobDescription } = req.body;

  if (!jobDescription) {
    return res.status(400).json({ error: 'Job description is required' });
  }

  try {
    const { analyzeJobMatch: analyzeFn } = await import('../services/aiService.js');
    const raw = await analyzeFn({ cvData: cvData || {}, jobDescription });

    let result;
    try {
      result = JSON.parse(raw);
    } catch {
      return res.status(500).json({ error: 'AI returned invalid format' });
    }

    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ error: 'AI analysis failed', details: err.message });
  }
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

export async function recommendSkills(req, res) {
  const { position, existingSkills } = req.body;

  if (!position) {
    return res.status(400).json({ error: 'Position is required' });
  }

  try {
    const { recommendSkills: recommendFn } = await import('../services/aiService.js');
    const raw = await recommendFn({ position, existingSkills: existingSkills || [] });

    let skills = [];
    try {
      skills = JSON.parse(raw);
      if (!Array.isArray(skills)) throw new Error('Not an array');
    } catch {
      const fallbackMap = {
        'software engineer': ['JavaScript', 'TypeScript', 'React', 'Node.js', 'PostgreSQL', 'Git', 'REST API', 'Docker', 'AWS', 'Agile'],
        'frontend': ['JavaScript', 'TypeScript', 'React', 'Vue.js', 'Tailwind CSS', 'HTML5', 'CSS3', 'Git', 'Responsive Design', 'Figma'],
        'backend': ['Node.js', 'Python', 'PostgreSQL', 'REST API', 'Docker', 'Redis', 'AWS', 'Git', 'Microservices', 'CI/CD'],
        'data analyst': ['SQL', 'Python', 'Excel', 'Tableau', 'Power BI', 'Statistics', 'Data Visualization', 'Pandas', 'ETL', 'Communication'],
        'data scientist': ['Python', 'Machine Learning', 'TensorFlow', 'PyTorch', 'SQL', 'Statistics', 'Pandas', 'NumPy', 'Deep Learning', 'NLP'],
        'devops': ['Docker', 'Kubernetes', 'AWS', 'CI/CD', 'Terraform', 'Linux', 'Git', 'Jenkins', 'Monitoring', 'Ansible'],
        'admin': ['Microsoft Office', 'Administrasi Perkantoran', 'Komunikasi', 'Kearsipan', 'Disiplin', 'Teliti'],
        'staff': ['Microsoft Office', 'Kerja Tim', 'Komunikasi', 'Administrasi', 'Disiplin', 'Tanggung Jawab'],
        'marketing': ['Digital Marketing', 'SEO', 'Google Analytics', 'Content Marketing', 'Social Media', 'Copywriting', 'Meta Ads', 'Google Ads', 'CRM', 'Communication'],
        'designer': ['Figma', 'Adobe Photoshop', 'Adobe Illustrator', 'UI/UX', 'Typography', 'Color Theory', 'Prototyping', 'Branding', 'Canva', 'Wireframing'],
        'product manager': ['Product Strategy', 'Agile', 'Scrum', 'Roadmapping', 'Stakeholder Management', 'Data Analysis', 'User Research', 'Jira', 'Communication', 'Leadership'],
      };
      const key = Object.keys(fallbackMap).find(k => position.toLowerCase().includes(k));
      skills = key ? fallbackMap[key] : ['Komunikasi', 'Kerja Tim', 'Problem Solving', 'Microsoft Office', 'Administrasi', 'Tanggung Jawab', 'Disiplin', 'Adaptif'];
    }

    const filtered = existingSkills?.length
      ? skills.filter((s) => !existingSkills.some((e) => e.toLowerCase() === s.toLowerCase()))
      : skills;

    res.json({ success: true, data: { skills: filtered } });
  } catch (err) {
    res.status(500).json({ error: 'AI recommendation failed', details: err.message });
  }
}

export async function toggleShare(req, res) {
  // Check current share state
  const { data: cv, error: fetchErr } = await insforge.database
    .from('cvs')
    .select('id, share_token')
    .eq('id', req.params.id)
    .eq('user_id', req.user.id)
    .maybeSingle();

  if (fetchErr) return res.status(500).json({ error: fetchErr.message });
  if (!cv) return res.status(404).json({ error: 'CV not found' });

  const newToken = cv.share_token ? null : crypto.randomBytes(16).toString('hex');

  const { data, error } = await insforge.database
    .from('cvs')
    .update({ share_token: newToken, updated_at: new Date().toISOString() })
    .eq('id', req.params.id)
    .eq('user_id', req.user.id)
    .select('id, share_token')
    .single();

  if (error) return res.status(500).json({ error: error.message });

  res.json({
    success: true,
    data: {
      shared: !!data.share_token,
      share_token: data.share_token,
    },
  });
}

export async function getSharedCV(req, res) {
  const { token } = req.params;
  if (!token || token.length < 16) return res.status(400).json({ error: 'Invalid token' });

  const { data, error } = await insforge.database
    .from('cvs')
    .select('title, template_id, data')
    .eq('share_token', token)
    .maybeSingle();

  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ error: 'Shared CV not found or link has been disabled' });

  res.json({ success: true, data });
}

export async function parseOCRText(req, res) {
  const { text } = req.body;
  if (!text || text.trim().length < 20) {
    return res.status(400).json({ error: 'Teks terlalu pendek untuk di-parse' });
  }

  try {
    const { parseOCRTextToCV } = await import('../services/aiService.js');
    const raw = await parseOCRTextToCV(text.trim());

    let parsed;
    try {
      const cleaned = raw.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '');
      parsed = JSON.parse(cleaned);
    } catch {
      return res.status(500).json({ error: 'AI mengembalikan format tidak valid. Coba lagi.' });
    }

    res.json({ success: true, data: parsed });
  } catch (err) {
    res.status(500).json({ error: 'Gagal mem-parse teks CV', details: err.message });
  }
}
