import crypto from 'crypto';
import postgres from 'postgres';
import { config } from '../config/env.js';
import { refundToken } from '../middleware/tokenMiddleware.js';

const sql = postgres(config.database.url);

export async function listCVs(req, res) {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const from = (page - 1) * limit;

  try {
    const rows = await sql`
      SELECT id, title, template_id, share_token, created_at, updated_at,
             COUNT(*) OVER() AS total_count
      FROM cvs
      WHERE user_id = ${req.user.id}
      ORDER BY created_at DESC
      LIMIT ${limit}
      OFFSET ${from}
    `;

    const data = rows.map(({ total_count, ...rest }) => rest);
    const count = rows.length > 0 ? Number(rows[0].total_count) : 0;

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
  } catch (error) {
    console.error('[DB]', error);
    return res.status(500).json({ error: 'Terjadi kesalahan' });
  }
}

export async function createCV(req, res) {
  const { title, template_id, data: cvData } = req.body;
  if (!title) return res.status(400).json({ error: 'Title is required' });

  try {
    const [data] = await sql`
      INSERT INTO cvs (user_id, title, template_id, data)
      VALUES (${req.user.id}, ${title}, ${template_id || 'ats-clean-v1'}, ${sql.json(cvData || {})})
      RETURNING *
    `;

    res.status(201).json({ success: true, data });
  } catch (error) {
    console.error('[DB]', error);
    return res.status(500).json({ error: 'Terjadi kesalahan' });
  }
}

export async function getCV(req, res) {
  try {
    const [data] = await sql`
      SELECT *
      FROM cvs
      WHERE id = ${req.params.id}
        AND user_id = ${req.user.id}
      LIMIT 1
    `;

    if (!data) return res.status(404).json({ error: 'CV not found' });

    res.json({ success: true, data });
  } catch (error) {
    console.error('[DB]', error);
    return res.status(500).json({ error: 'Terjadi kesalahan' });
  }
}

export async function updateCV(req, res) {
  const { title, template_id, data: cvData } = req.body;

  try {
    const updates = [];
    if (title !== undefined) updates.push(sql`title = ${title}`);
    if (template_id !== undefined) updates.push(sql`template_id = ${template_id}`);
    if (cvData !== undefined) updates.push(sql`data = ${sql.json(cvData)}`);
    updates.push(sql`updated_at = ${new Date().toISOString()}`);

    const [data] = await sql`
      UPDATE cvs
      SET ${sql(updates)}
      WHERE id = ${req.params.id}
        AND user_id = ${req.user.id}
      RETURNING *
    `;

    if (!data) return res.status(404).json({ error: 'CV not found' });

    res.json({ success: true, data });
  } catch (error) {
    console.error('[DB]', error);
    return res.status(500).json({ error: 'Terjadi kesalahan' });
  }
}

export async function deleteCV(req, res) {
  try {
    const [existing] = await sql`
      SELECT id FROM cvs
      WHERE id = ${req.params.id}
        AND user_id = ${req.user.id}
      LIMIT 1
    `;

    if (!existing) return res.status(404).json({ error: 'CV not found' });

    await sql`
      DELETE FROM cvs
      WHERE id = ${req.params.id}
    `;

    res.json({ success: true, message: 'CV deleted' });
  } catch (error) {
    console.error('[DB]', error);
    return res.status(500).json({ error: 'Terjadi kesalahan' });
  }
}

export async function duplicateCV(req, res) {
  const { title: newTitle } = req.body;

  try {
    const [original] = await sql`
      SELECT * FROM cvs
      WHERE id = ${req.params.id}
        AND user_id = ${req.user.id}
      LIMIT 1
    `;

    if (!original) return res.status(404).json({ error: 'CV not found' });

    const [data] = await sql`
      INSERT INTO cvs (user_id, title, template_id, data)
      VALUES (${req.user.id}, ${newTitle || `${original.title} (Copy)`}, ${original.template_id}, ${sql.json(original.data)})
      RETURNING *
    `;

    res.status(201).json({ success: true, data });
  } catch (error) {
    console.error('[DB]', error);
    return res.status(500).json({ error: 'Terjadi kesalahan' });
  }
}

export async function analyzeJobMatch(req, res) {
  const { cvData, cvId, jobDescription } = req.body;

  if (!jobDescription) {
    return res.status(400).json({ error: 'Job description is required' });
  }

  try {
    // If cvId is provided, fetch CV data from database
    let finalCvData = cvData || {};
    if (cvId) {
      const [cv] = await sql`
        SELECT data FROM cvs
        WHERE id = ${cvId}
          AND user_id = ${req.user.id}
        LIMIT 1
      `;

      if (!cv) {
        return res.status(404).json({ error: 'CV not found' });
      }
      finalCvData = cv.data || {};
    }

    const { analyzeJobMatch: analyzeFn } = await import('../services/aiService.js');
    const raw = await analyzeFn({ cvData: finalCvData, jobDescription });
    let result;
    try {
      result = JSON.parse(raw);
    } catch {
      await refundToken(req);
      return res.status(500).json({ error: 'AI returned invalid format' });
    }
    res.json({ success: true, data: result, tokenBalance: req.tokenBalance });
  } catch (err) {
    await refundToken(req);
    console.error('[AI]', err);
    res.status(500).json({ error: 'AI analysis failed' });
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
    res.json({ success: true, data: { summary }, tokenBalance: req.tokenBalance });
  } catch (err) {
    await refundToken(req);
    console.error('[AI]', err);
    res.status(500).json({ error: 'AI generation failed' });
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

    res.json({ success: true, data: { skills: filtered }, tokenBalance: req.tokenBalance });
  } catch (err) {
    await refundToken(req);
    console.error('[AI]', err);
    res.status(500).json({ error: 'AI recommendation failed' });
  }
}

export async function toggleShare(req, res) {
  try {
    // Check current share state
    const [cv] = await sql`
      SELECT id, share_token FROM cvs
      WHERE id = ${req.params.id}
        AND user_id = ${req.user.id}
      LIMIT 1
    `;

    if (!cv) return res.status(404).json({ error: 'CV not found' });

    const newToken = cv.share_token ? null : crypto.randomBytes(16).toString('hex');

    const [data] = await sql`
      UPDATE cvs
      SET share_token = ${newToken}, updated_at = ${new Date().toISOString()}
      WHERE id = ${req.params.id}
        AND user_id = ${req.user.id}
      RETURNING id, share_token
    `;

    res.json({
      success: true,
      data: {
        shared: !!data.share_token,
        share_token: data.share_token,
      },
    });
  } catch (error) {
    console.error('[DB]', error);
    return res.status(500).json({ error: 'Terjadi kesalahan' });
  }
}

export async function getSharedCV(req, res) {
  const { token } = req.params;
  if (!token || token.length < 16) return res.status(400).json({ error: 'Invalid token' });

  try {
    const [data] = await sql`
      SELECT title, template_id, data
      FROM cvs
      WHERE share_token = ${token}
      LIMIT 1
    `;

    if (!data) return res.status(404).json({ error: 'Shared CV not found or link has been disabled' });

    res.json({ success: true, data });
  } catch (error) {
    console.error('[DB]', error);
    return res.status(500).json({ error: 'Terjadi kesalahan' });
  }
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
      await refundToken(req);
      return res.status(500).json({ error: 'AI mengembalikan format tidak valid. Coba lagi.' });
    }
    res.json({ success: true, data: parsed, tokenBalance: req.tokenBalance });
  } catch (err) {
    await refundToken(req);
    console.error('[AI]', err);
    res.status(500).json({ error: 'Gagal mem-parse teks CV' });
  }
}
