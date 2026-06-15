import { useCallback } from 'react'
import useCVStore from '../store/cvStore'
import useToastStore from '../store/toastStore'
import api from '../services/api'

export default function useCV() {
  const addToast = useToastStore((s) => s.addToast)
  const { cvData, setCvData, templateId, title, reset } = useCVStore()

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
      addToast('Ringkasan profil berhasil digenerate!', 'success')
      return summary
    } catch (err) {
      const message = err.response?.data?.error || 'Gagal generate ringkasan'
      addToast(message, 'error')
      return null
    }
  }, [cvData, setCvData, addToast])

  const saveDraft = useCallback(async () => {
    try {
      await api.post('/api/cv', {
        title,
        template_id: templateId,
        data: cvData,
      })
      addToast('Draft berhasil disimpan!', 'success')
    } catch (err) {
      const message = err.response?.data?.error || 'Gagal menyimpan draft'
      addToast(message, 'error')
    }
  }, [cvData, title, templateId, addToast])

  return { generateSummary, saveDraft, reset }
}
