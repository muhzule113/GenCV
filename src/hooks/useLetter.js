import { useState, useCallback } from 'react'
import useToastStore from '../store/toastStore'
import useAuthStore from '../store/authStore'
import api from '../services/api'

export default function useLetter() {
  const [letter, setLetter] = useState(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [existingLetter, setExistingLetter] = useState(null)
  const fetchTokenBalance = useAuthStore((s) => s.fetchTokenBalance)
  const addToast = useToastStore((s) => s.addToast)

  const checkExistingLetter = useCallback(async (cvId) => {
    if (!cvId) {
      setExistingLetter(null)
      return
    }
    try {
      const res = await api.get('/api/letter', { params: { cv_id: cvId, page: 1, limit: 1 } })
      const letters = res.data?.data || []
      if (letters.length > 0) {
        setExistingLetter(letters[0])
        return letters[0]
      }
      setExistingLetter(null)
      return null
    } catch {
      setExistingLetter(null)
      return null
    }
  }, [])

  const generateLetter = useCallback(async (form) => {
    setLoading(true)
    try {
      const response = await api.post('/api/letter/generate', {
        cv_id: form.cv_id,
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
      setExistingLetter({ id: data.cv_id })
      fetchTokenBalance()
      addToast('Surat lamaran berhasil digenerate!', 'success')
      return data
    } catch (err) {
      if (err.response?.status === 409) {
        const msg = 'Surat lamaran untuk CV ini sudah ada. Hapus surat yang ada terlebih dahulu.'
        addToast(msg, 'error')
        if (err.response.data?.existing_id) {
          setExistingLetter({ id: err.response.data.existing_id })
        }
      } else {
        const message = err.response?.data?.error || 'Gagal generate surat'
        addToast(message, 'error')
      }
      return null
    } finally {
      setLoading(false)
    }
  }, [addToast])

  const clearLetter = useCallback(() => {
    setLetter(null)
    setExistingLetter(null)
  }, [])

  const saveLetter = useCallback(async (formData, { silent = false } = {}) => {
    const data = formData || letter
    if (!data) return
    setSaving(true)
    try {
      await api.post('/api/letter', {
        cv_id: data.cv_id,
        position: data.position,
        company: data.company,
        company_field: data.companyField || '',
        info_source: data.infoSource || '',
        recipient_title: data.recipientTitle || 'HRD',
        city: data.city || '',
        letter_date: data.letterDate || '',
        relevant_experience: data.relevantExperience || '',
        highlights: data.highlights || [],
        attachments: data.attachments || [],
        custom_attachment: data.customAttachment || '',
        personal: data.personal || {},
        content: letter?.content || '',
      })
      if (!silent) addToast('Surat Berhasil Disimpan', 'success')
      return true
    } catch (err) {
      const message = err.response?.data?.error || 'Gagal menyimpan surat'
      addToast(message, 'error')
      return false
    } finally {
      setSaving(false)
    }
  }, [letter, addToast])

  const deleteLetter = useCallback(async (id) => {
    try {
      await api.delete(`/api/letter/${id}`)
      setLetter(null)
      setExistingLetter(null)
      addToast('Surat berhasil dihapus', 'success')
      return true
    } catch (err) {
      const message = err.response?.data?.error || 'Gagal menghapus surat'
      addToast(message, 'error')
      return false
    }
  }, [addToast])

  return { letter, setLetter, clearLetter, generateLetter, saveLetter, deleteLetter, loading, saving, existingLetter, checkExistingLetter }
}