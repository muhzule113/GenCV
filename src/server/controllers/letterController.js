import postgres from 'postgres';
import { config } from '../config/env.js';
import { refundToken } from '../middleware/tokenMiddleware.js';

const sql = postgres(config.database.url);

export async function listLetters(req, res) {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  try {
    let query = sql`
      SELECT id, position, company, cv_id, created_at, updated_at,
        COUNT(*) OVER() AS total_count
      FROM cover_letters
      WHERE user_id = ${req.user.id}
    `;

    if (req.query.cv_id) {
      query = sql`
        SELECT id, position, company, cv_id, created_at, updated_at,
          COUNT(*) OVER() AS total_count
        FROM cover_letters
        WHERE user_id = ${req.user.id} AND cv_id = ${req.query.cv_id}
      `;
    }

    query = sql`${query} ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`;
    const rows = await query;
    const count = rows.length > 0 ? Number(rows[0].total_count) : 0;

    res.json({
      success: true,
      data: rows.map(({ total_count, ...r }) => r),
      pagination: { page, limit, total: count, totalPages: Math.ceil(count / limit) },
    });
  } catch (err) {
    console.error('[DB]', err);
    res.status(500).json({ error: 'Terjadi kesalahan' });
  }
}

export async function createLetter(req, res) {
  const { cv_id, position, company, content } = req.body;
  if (!cv_id) return res.status(400).json({ error: 'cv_id is required' });

  try {
    // UPSERT on conflict (cv_id, user_id)
    const [row] = await sql`
      INSERT INTO cover_letters (user_id, cv_id, position, company, content)
      VALUES (${req.user.id}, ${cv_id}, ${position || ''}, ${company || ''}, ${content || ''})
      ON CONFLICT (cv_id, user_id) DO UPDATE SET
        position = EXCLUDED.position,
        company = EXCLUDED.company,
        content = EXCLUDED.content,
        updated_at = NOW()
      RETURNING *
    `;
    res.status(201).json({ success: true, data: row });
  } catch (err) {
    console.error('[DB]', err);
    res.status(500).json({ error: 'Terjadi kesalahan' });
  }
}

export async function getLetter(req, res) {
  try {
    const [row] = await sql`
      SELECT * FROM cover_letters WHERE id = ${req.params.id} AND user_id = ${req.user.id} LIMIT 1
    `;
    if (!row) return res.status(404).json({ error: 'Cover letter not found' });

    let cvData = null;
    if (row.cv_id) {
      const [cvRecord] = await sql`
        SELECT data FROM cvs WHERE id = ${row.cv_id} AND user_id = ${req.user.id} LIMIT 1
      `;
      cvData = cvRecord?.data || null;
    }

    const personal = cvData?.personal || {};
    const p = {
      name: personal.name || '',
      email: personal.email || '',
      phone: personal.phone || '',
      address: personal.address || '',
      birthPlace: personal.birthPlace || '',
      birthDate: personal.birthDate || '',
      gender: personal.gender || '',
      lastEducation: cvData?.educations?.[0] ? `${cvData.educations[0].degree || ''} ${cvData.educations[0].field || ''}`.trim() : '',
      portfolio: personal.portfolio || '',
    };

    res.json({
      success: true,
      data: {
        ...row,
        personal: p,
        experiences: cvData?.experiences || [],
        skills: cvData?.skills || { technical: [], soft: [] },
        cv_title: cvData?.title || '',
      },
    });
  } catch (err) {
    console.error('[DB]', err);
    res.status(500).json({ error: 'Terjadi kesalahan' });
  }
}

export async function updateLetter(req, res) {
  const { cv_id, position, company, content } = req.body;
  if (!req.params.id) return res.status(400).json({ error: 'id is required' });

  try {
    const [row] = await sql`
      UPDATE cover_letters SET
        cv_id = COALESCE(${cv_id}, cv_id),
        position = COALESCE(${position}, position),
        company = COALESCE(${company}, company),
        content = COALESCE(${content}, content),
        updated_at = NOW()
      WHERE id = ${req.params.id} AND user_id = ${req.user.id}
      RETURNING *
    `;
    if (!row) return res.status(404).json({ error: 'Cover letter not found' });
    res.json({ success: true, data: row });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Surat lamaran untuk CV ini sudah ada' });
    }
    console.error('[DB]', err);
    res.status(500).json({ error: 'Terjadi kesalahan' });
  }
}

export async function deleteLetter(req, res) {
  try {
    const [existing] = await sql`
      SELECT id FROM cover_letters WHERE id = ${req.params.id} AND user_id = ${req.user.id} LIMIT 1
    `;
    if (!existing) return res.status(404).json({ error: 'Cover letter not found' });

    await sql`DELETE FROM cover_letters WHERE id = ${req.params.id}`;
    res.json({ success: true, message: 'Cover letter deleted' });
  } catch (err) {
    console.error('[DB]', err);
    res.status(500).json({ error: 'Terjadi kesalahan' });
  }
}

function formatIndonesianDate(value) {
  if (!value) return '';
  const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  const m = String(value).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) {
    const day = parseInt(m[3], 10);
    const monthIdx = parseInt(m[2], 10) - 1;
    const year = m[1];
    return `${day} ${months[monthIdx] || m[2]} ${year}`;
  }
  return value;
}

const defaultAttachmentLabels = {
  cv: 'Curriculum Vitae (CV)',
  foto: 'Pas Foto 3x4',
  ktp: 'Fotokopi KTP',
  ijazah: 'Fotokopi Ijazah',
  transkrip: 'Fotokopi Transkrip Nilai',
  sertifikat: 'Sertifikat Pendukung',
};

function buildAttachmentLabels(rawAttachments, customAttachment) {
  const list = Array.isArray(rawAttachments) && rawAttachments.length > 0
    ? rawAttachments
    : ['cv', 'foto', 'ktp', 'ijazah', 'transkrip'];
  const labels = list.map((k) => defaultAttachmentLabels[k] || k);
  if (customAttachment && customAttachment.trim()) labels.push(customAttachment.trim());
  return labels;
}

export async function generateLetter(req, res) {
  const {
    cv_id, position, company, company_field, info_source, recipient_title, highlights,
    personal = {}, attachments = [], custom_attachment = '', city = '', letter_date = '',
    relevant_experience = '',
  } = req.body;

  if (!position || !company) return res.status(400).json({ error: 'Position and company are required' });
  if (!cv_id) return res.status(400).json({ error: 'CV harus dipilih untuk membuat surat lamaran' });

  try {
    const [cvRecord] = await sql`
      SELECT data FROM cvs WHERE id = ${cv_id} AND user_id = ${req.user.id} LIMIT 1
    `;
    if (!cvRecord) return res.status(404).json({ error: 'CV tidak ditemukan' });

    const cvData = cvRecord.data;

    const [existing] = await sql`
      SELECT id FROM cover_letters WHERE cv_id = ${cv_id} AND user_id = ${req.user.id} LIMIT 1
    `;
    if (existing) {
      return res.status(409).json({
        error: 'Surat lamaran untuk CV ini sudah ada. Hapus surat yang ada terlebih dahulu jika ingin membuat ulang.',
        existing_id: existing.id,
      });
    }

    const mergedPersonal = {
      name: cvData?.personal?.name || '',
      email: cvData?.personal?.email || '',
      phone: cvData?.personal?.phone || '',
      address: cvData?.personal?.address || personal.address || '',
      birthPlace: cvData?.personal?.birthPlace || personal.birthPlace || '',
      birthDate: cvData?.personal?.birthDate || personal.birthDate || '',
      gender: cvData?.personal?.gender || personal.gender || '',
      lastEducation: cvData?.educations?.[0] ? `${cvData.educations[0].degree || ''} ${cvData.educations[0].field || ''}`.trim() : '',
      portfolio: cvData?.personal?.portfolio || '',
    };

    const attachmentLabels = buildAttachmentLabels(attachments, custom_attachment);
    const formattedDate = formatIndonesianDate(letter_date);
    const experiences = cvData?.experiences || [];
    const skills = cvData?.skills || { technical: [], soft: [] };

    const { generateCoverLetter } = await import('../services/aiService.js');
    const content = await generateCoverLetter({
      position,
      company,
      companyField: company_field,
      infoSource: info_source,
      recipientTitle: recipient_title,
      highlights: highlights || [],
      cvData,
      personal: mergedPersonal,
      relevantExperience: relevant_experience,
    });

    await sql`
      INSERT INTO cover_letters (user_id, cv_id, position, company, content)
      VALUES (${req.user.id}, ${cv_id}, ${position}, ${company}, ${content})
      ON CONFLICT (cv_id, user_id) DO UPDATE SET
        position = EXCLUDED.position,
        company = EXCLUDED.company,
        content = EXCLUDED.content,
        updated_at = NOW()
    `;

    res.json({
      success: true,
      data: {
        content,
        cv_id,
        position,
        company,
        companyField: company_field || '',
        infoSource: info_source || '',
        recipientTitle: recipient_title || 'HRD',
        personal: mergedPersonal,
        attachments: attachmentLabels,
        city: city || '',
        date: formattedDate,
        highlights: highlights || [],
        experiences,
        skills,
      },
      tokenBalance: req.tokenBalance,
    });
  } catch (err) {
    await refundToken(req);
    console.error('[AI]', err);
    res.status(500).json({ error: 'AI generation failed' });
  }
}

export async function recommendHighlights(req, res) {
  const { position, cv_id } = req.body;
  if (!position) return res.status(400).json({ error: 'Position is required' });

  let cvData = null;
  if (cv_id) {
    try {
      const [row] = await sql`
        SELECT data FROM cvs WHERE id = ${cv_id} AND user_id = ${req.user.id} LIMIT 1
      `;
      cvData = row?.data || null;
    } catch (err) {
      console.error('[DB]', err);
    }
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

    res.json({ success: true, data: { highlights }, tokenBalance: req.tokenBalance });
  } catch (err) {
    await refundToken(req);
    console.error('[AI]', err);
    res.status(500).json({ error: 'AI recommendation failed' });
  }
}
