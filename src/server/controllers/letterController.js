import { insforge } from '../config/insforge.js';
import { refundToken } from '../middleware/tokenMiddleware.js';
export async function listLetters(req, res) {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = insforge.database
    .from('cover_letters')
    .select('id, position, company, cv_id, created_at, updated_at', { count: 'exact' })
    .eq('user_id', req.user.id);

  if (req.query.cv_id) {
    query = query.eq('cv_id', req.query.cv_id);
  }

  const { data, error, count } = await query
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
  if (!cv_id) {
    return res.status(400).json({ error: 'cv_id is required' });
  }

  const { data, error } = await insforge.database
    .from('cover_letters')
    .upsert({
      user_id: req.user.id,
      cv_id,
      position,
      company,
      content: content || '',
    }, { onConflict: 'cv_id, user_id', ignoreDuplicates: false })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });

  res.status(201).json({ success: true, data });
}export async function getLetter(req, res) {
  const { data, error } = await insforge.database
    .from('cover_letters')
    .select('*')
    .eq('id', req.params.id)
    .eq('user_id', req.user.id)
    .maybeSingle();

  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ error: 'Cover letter not found' });

  let cvData = null;
  if (data.cv_id) {
    const { data: cvRecord } = await insforge.database
      .from('cvs')
      .select('data')
      .eq('id', data.cv_id)
      .eq('user_id', req.user.id)
      .maybeSingle();
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
      ...data,
      personal: p,
      experiences: cvData?.experiences || [],
      skills: cvData?.skills || { technical: [], soft: [] },
      cv_title: cvData?.title || '',
    },
  });
}

export async function updateLetter(req, res) {
  const { cv_id, position, company, content, companyField, infoSource, recipientTitle, city, letterDate, personal, highlights, attachments, relevantExperience, skills } = req.body;
  if (!req.params.id) return res.status(400).json({ error: 'id is required' });

  const updateData = {
    updated_at: new Date().toISOString(),
  };
  
  if (cv_id !== undefined) updateData.cv_id = cv_id;
  if (position !== undefined) updateData.position = position;
  if (company !== undefined) updateData.company = company;
  if (content !== undefined) updateData.content = content;
  if (companyField !== undefined) updateData.companyField = companyField;
  if (infoSource !== undefined) updateData.infoSource = infoSource;
  if (recipientTitle !== undefined) updateData.recipientTitle = recipientTitle;
  if (city !== undefined) updateData.city = city;
  if (letterDate !== undefined) updateData.letterDate = letterDate;
  if (personal !== undefined) updateData.personal = personal;
  if (highlights !== undefined) updateData.highlights = highlights;
  if (attachments !== undefined) updateData.attachments = attachments;
  if (relevantExperience !== undefined) updateData.relevantExperience = relevantExperience;
  if (skills !== undefined) updateData.skills = skills;

  const { data, error } = await insforge.database
    .from('cover_letters')
    .update(updateData)
    .eq('id', req.params.id)
    .eq('user_id', req.user.id)
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Surat lamaran untuk CV ini sudah ada' });
    }
    return res.status(500).json({ error: error.message });
  }
  if (!data) return res.status(404).json({ error: 'Cover letter not found' });

  res.json({ success: true, data });
}
  const { data: existing } = await insforge.database
    .from('cover_letters')
    .select('id')
    .eq('id', req.params.id)
    .eq('user_id', req.user.id)
    .maybeSingle();

  if (!existing) return res.status(404).json({ error: 'Cover letter not found' });

  const { error } = await insforge.database
    .from('cover_letters')
    .delete()
    .eq('id', req.params.id);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true, message: 'Cover letter deleted' });
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

  if (!position || !company) {
    return res.status(400).json({ error: 'Position and company are required' });
  }
  if (!cv_id) {
    return res.status(400).json({ error: 'CV harus dipilih untuk membuat surat lamaran' });
  }

  const { data: cvRecord, error: cvError } = await insforge.database
    .from('cvs')
    .select('data')
    .eq('id', cv_id)
    .eq('user_id', req.user.id)
    .maybeSingle();

  if (cvError) return res.status(500).json({ error: cvError.message });
  if (!cvRecord) return res.status(404).json({ error: 'CV tidak ditemukan' });

  const cvData = cvRecord.data;

  const { data: existing } = await insforge.database
    .from('cover_letters')
    .select('id')
    .eq('cv_id', cv_id)
    .eq('user_id', req.user.id)
    .maybeSingle();

  if (existing) {
    return res.status(409).json({ error: 'Surat lamaran untuk CV ini sudah ada. Hapus surat yang ada terlebih dahulu jika ingin membuat ulang.', existing_id: existing.id });
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
      personal: mergedPersonal,
      relevantExperience: relevant_experience,
    });

    await insforge.database
      .from('cover_letters')
      .upsert({
        user_id: req.user.id,
        cv_id,
        position,
        company,
        content,
      }, { onConflict: 'cv_id, user_id', ignoreDuplicates: false });

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
    }, tokenBalance: req.tokenBalance });
  } catch (err) {
    await refundToken(req);
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

    res.json({ success: true, data: { highlights }, tokenBalance: req.tokenBalance });
  } catch (err) {
    await refundToken(req);
    res.status(500).json({ error: 'AI recommendation failed', details: err.message });
  }
}
