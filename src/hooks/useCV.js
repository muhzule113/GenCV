import { useCallback } from 'react'
import useCVStore from '../store/cvStore'
import useToastStore from '../store/toastStore'
import useAuthStore from '../store/authStore'
import api from '../services/api'

export default function useCV() {
  const addToast = useToastStore((s) => s.addToast)
  const fetchTokenBalance = useAuthStore((s) => s.fetchTokenBalance)
  const { cvData, setCvData, setTitle, templateId, title, reset } = useCVStore()

  const generateSummary = useCallback(async ({ targetPosition, tone, language } = {}) => {
    const { experiences, skills, personal } = cvData
    try {
      const response = await api.post('/api/cv/generate-summary', {
        experiences,
        skills,
        targetPosition: targetPosition || personal?.jobTitle || '',
        tone: tone || 'profesional',
        language: language || 'id',
      })
      const summary = response.data.data.summary
      setCvData({ ...cvData, summary })
      fetchTokenBalance()
      addToast('Ringkasan profil berhasil digenerate!', 'success')
      return summary
    } catch (err) {
      const message = err.response?.data?.error || 'Gagal generate ringkasan'
      addToast(message, 'error')
      return null
    }
  }, [cvData, setCvData, addToast])

  const saveDraft = useCallback(async (id) => {
    try {
      if (id) {
        await api.put(`/api/cv/${id}`, {
          title,
          template_id: templateId,
          data: cvData,
        })
      } else {
        await api.post('/api/cv', {
          title,
          template_id: templateId,
          data: cvData,
        })
      }
      addToast(id ? 'CV berhasil diperbarui!' : 'Draft berhasil disimpan!', 'success')
      return { id }
    } catch (err) {
      const message = err.response?.data?.error || 'Gagal menyimpan CV'
      addToast(message, 'error')
      return null
    }
  }, [cvData, title, templateId, addToast])

  const loadCV = useCallback(async (id) => {
    try {
      const response = await api.get(`/api/cv/${id}`)
      const cv = response.data.data
      const defaultShape = {
        personal: { name: '', jobTitle: '', email: '', phone: '', city: '', linkedin: '', github: '', portfolio: '' },
        summary: '',
        experiences: [],
        educations: [],
        skills: { technical: [], soft: [] },
        projects: [],
        certifications: [],
        languages: [],
      }
      const loaded = cv.data || {}
      const merged = {
        ...defaultShape,
        ...loaded,
        personal: { ...defaultShape.personal, ...(loaded.personal || {}) },
        skills: { ...defaultShape.skills, ...(loaded.skills || {}) },
      }
      setCvData(merged)
      setTitle(cv.title || 'CV Baru')
      return cv
    } catch (err) {
      const message = err.response?.data?.error || 'Gagal memuat CV'
      addToast(message, 'error')
      return null
    }
  }, [setCvData, setTitle, addToast])

  const analyzeJobMatch = useCallback(async ({ jobDescription }) => {
    try {
      const response = await api.post('/api/cv/analyze-job-match', {
        cvData,
        jobDescription,
      })
      fetchTokenBalance()
      addToast('Analisis lowongan berhasil!', 'success')
      return response.data.data
    } catch (err) {
      const message = err.response?.data?.error || 'Gagal menganalisis lowongan'
      addToast(message, 'error')
      return null
    }
  }, [cvData, addToast])

  return { generateSummary, analyzeJobMatch, saveDraft, loadCV, reset }
}
