import api from './api'

export async function generateCoverLetter(params) {
  try {
    const response = await api.post('/api/letter/generate', {
      position: params.position,
      company: params.company,
      company_field: params.companyField || '',
      info_source: params.infoSource || '',
      recipient_title: params.recipientTitle || 'HRD',
      highlights: params.highlights || [],
      cv_id: params.cv_id || '',
    })
    return response.data.data.content
  } catch (error) {
    throw new Error('AI service tidak tersedia. Isi manual.')
  }
}

export async function recommendHighlights({ position, cv_id }) {
  try {
    const response = await api.post('/api/letter/recommend-highlights', {
      position,
      cv_id,
    })
    return response.data.data.highlights
  } catch (error) {
    throw new Error('Gagal memuat rekomendasi AI.')
  }
}

export async function generateProfileSummary({ experiences, skills, targetPosition, tone = 'profesional', language = 'id' }) {
  try {
    const response = await api.post('/api/cv/generate-summary', {
      experiences,
      skills,
      targetPosition,
      tone,
      language,
    })
    return response.data.data.summary
  } catch (error) {
    throw new Error('AI service tidak tersedia. Isi manual.')
  }
}

export async function recommendSkills({ position, existingSkills = [] }) {
  try {
    const response = await api.post('/api/cv/recommend-skills', {
      position,
      existingSkills,
    })
    return response.data.data.skills
  } catch (error) {
    throw new Error('Gagal memuat rekomendasi skill dari AI.')
  }
}
