import { useState, useCallback } from 'react'
import api from '../services/api'
import useToastStore from '../store/toastStore'
import useAuthStore from '../store/authStore'

export default function useJobAnalysis() {
  const addToast = useToastStore((s) => s.addToast)
  const fetchTokenBalance = useAuthStore((s) => s.fetchTokenBalance)

  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const analyzeJob = useCallback(async ({ cvId, jobDescription }) => {
    if (!cvId) {
      addToast('Pilih CV terlebih dahulu', 'error')
      return null
    }
    if (!jobDescription?.trim()) {
      addToast('Masukkan deskripsi lowongan', 'error')
      return null
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await api.post('/api/cv/analyze-job-match', {
        cvId,
        jobDescription: jobDescription.trim(),
      })
      fetchTokenBalance()
      addToast('Analisis lowongan berhasil!', 'success')
      setResult(response.data.data)
      return response.data.data
    } catch (err) {
      const message = err.response?.data?.error || 'Gagal menganalisis lowongan'
      setError(message)
      addToast(message, 'error')
      return null
    } finally {
      setLoading(false)
    }
  }, [addToast, fetchTokenBalance])

  const reset = useCallback(() => {
    setResult(null)
    setError(null)
  }, [])

  return { analyzeJob, loading, result, error, reset }
}
