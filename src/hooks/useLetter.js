import { useState, useCallback } from 'react'
import useToastStore from '../store/toastStore'
import api from '../services/api'

export default function useLetter() {
  const [letterContent, setLetterContent] = useState('')
  const [letterId, setLetterId] = useState(null)
  const [loading, setLoading] = useState(false)
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
      })
      const content = response.data.data.content
      setLetterContent(content)
      addToast('Surat lamaran berhasil digenerate!', 'success')
      return content
    } catch (err) {
      const message = err.response?.data?.error || 'Gagal generate surat'
      addToast(message, 'error')
      return null
    } finally {
      setLoading(false)
    }
  }, [addToast])

  const saveLetter = useCallback(async ({ position, company }) => {
    try {
      if (letterId) {
        await api.put(`/api/letter/${letterId}`, {
          position,
          company,
          content: letterContent,
        })
      } else {
        const response = await api.post('/api/letter', {
          position,
          company,
          content: letterContent,
        })
        setLetterId(response.data.data.id)
      }
      addToast('Surat berhasil disimpan!', 'success')
    } catch (err) {
      const message = err.response?.data?.error || 'Gagal menyimpan surat'
      addToast(message, 'error')
    }
  }, [letterId, letterContent, addToast])

  return { letterContent, setLetterContent, generateLetter, saveLetter, loading }
}
