import { useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import useToastStore from '../store/toastStore'
import useAuthStore from '../store/authStore'
import api from '../services/api'

export const letterKeys = {
  all: ['letters'],
  list: (cvId) => ['letters', 'list', cvId],
  detail: (id) => ['letters', 'detail', id],
}

export default function useLetter() {
  const [letter, setLetter] = useState(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [existingLetter, setExistingLetter] = useState(null)
  const fetchTokenBalance = useAuthStore((s) => s.fetchTokenBalance)
  const addToast = useToastStore((s) => s.addToast)
  const queryClient = useQueryClient()

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

  const generateMutation = useMutation({
    mutationFn: (form) => api.post('/api/letter/generate', {
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
    }),
    onSuccess: (response) => {
      const data = response.data.data
      setLetter(data)
      setExistingLetter({ id: data.cv_id })
      fetchTokenBalance()
      queryClient.invalidateQueries({ queryKey: letterKeys.all })
      addToast('Surat lamaran berhasil digenerate!', 'success')
    },
    onError: (err) => {
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
    },
  })

  const generateLetter = useCallback(async (form) => {
    setLoading(true)
    try {
      const res = await generateMutation.mutateAsync(form)
      return res.data?.data
    } catch {
      return null
    } finally {
      setLoading(false)
    }
  }, [generateMutation])

  const clearLetter = useCallback(() => {
    setLetter(null)
    setExistingLetter(null)
  }, [])

  const saveMutation = useMutation({
    mutationFn: async ({ formData, letterData }) => {
      const data = formData || letterData
      const payload = {
        cv_id: data.cv_id,
        position: data.position || '',
        company: data.company || '',
        content: data.content || (letterData?.content || ''),
        companyField: data.companyField || '',
        infoSource: data.infoSource || '',
        recipientTitle: data.recipientTitle || 'HRD',
        city: data.city || '',
        letterDate: data.letterDate || '',
        personal: data.personal || {},
        highlights: data.highlights || [],
        attachments: data.attachments || [],
        relevantExperience: data.relevantExperience || '',
        skills: data.skills || null,
      }
      if (letterData?.id) {
        return api.put(`/api/letter/${letterData.id}`, payload)
      }
      return api.post('/api/letter', payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: letterKeys.all })
    },
  })

  const saveLetter = useCallback(async (formData, { silent = false } = {}) => {
    const data = formData || letter
    if (!data) return
    setSaving(true)
    try {
      await saveMutation.mutateAsync({ formData: data, letterData: letter || data })
      if (!silent) addToast('Surat Berhasil Disimpan', 'success')
      return true
    } catch (err) {
      const message = err.response?.data?.error || 'Gagal menyimpan surat'
      addToast(message, 'error')
      return false
    } finally {
      setSaving(false)
    }
  }, [letter, saveMutation, addToast])

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/api/letter/${id}`),
    onSuccess: () => {
      setLetter(null)
      setExistingLetter(null)
      queryClient.invalidateQueries({ queryKey: letterKeys.all })
      addToast('Surat berhasil dihapus', 'success')
    },
    onError: (err) => {
      const message = err.response?.data?.error || 'Gagal menghapus surat'
      addToast(message, 'error')
    },
  })

  const deleteLetter = useCallback(async (id) => {
    try {
      await deleteMutation.mutateAsync(id)
      return true
    } catch {
      return false
    }
  }, [deleteMutation])

  return { letter, setLetter, clearLetter, generateLetter, saveLetter, deleteLetter, loading, saving, existingLetter, checkExistingLetter }
}
