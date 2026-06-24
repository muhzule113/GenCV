import { useState, useCallback } from 'react'
import useToastStore from '../store/toastStore'
import api from '../services/api'

export default function useLetter() {
  const [letter, setLetter] = useState(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const addToast = useToastStore((s) => s.addToast)

  const generateLetter = useCallback(async (form) => {
    setLoading(true)
    try {
      const response = await api.post('/api/letter/generate', {
        cv_id: form.cv_id || '',
        position: form.position,
        company: form.company,
        company_field: form.companyField || '',
        info_source: form.infoSource || '',
        recipient_title: form.recipientTitle || 'HRD',
        highlights: form.highlights || [],
        personal: form.personal || {},
        attachments: form.attachments || [],
        custom_attachment: form.customAttachment || '',
        city: form.city || '',
        letter_date: form.letterDate || '',
        relevant_experience: form.relevantExperience || '',
      })
      const data = response.data.data
      setLetter(data)
      addToast('Surat lamaran berhasil digenerate!', 'success')
      return data
    } catch (err) {
      const message = err.response?.data?.error || 'Gagal generate surat'
      addToast(message, 'error')
      return null
    } finally {
      setLoading(false)
    }
  }, [addToast])

  const clearLetter = useCallback(() => setLetter(null), [])

  const saveLetter = useCallback(async () => {
    if (!letter) return
    setSaving(true)
    try {
      await api.post('/api/letter', {
        cv_id: letter.cv_id || null,
        position: letter.position,
        company: letter.company,
        content: letter.content || '',
      })
      addToast('Surat berhasil disimpan!', 'success')
    } catch (err) {
      const message = err.response?.data?.error || 'Gagal menyimpan surat'
      addToast(message, 'error')
    } finally {
      setSaving(false)
    }
  }, [letter, addToast])

  return { letter, setLetter, clearLetter, generateLetter, saveLetter, loading, saving }
}
