import { useState, useEffect } from 'react'
import Modal from '../common/Modal'
import Button from '../common/Button'
import useJobAnalysis from '../../hooks/useJobAnalysis'
import api from '../../services/api'

export default function JobAnalysisModal({ open, onClose }) {
  const { analyzeJob, loading, result, reset } = useJobAnalysis()
  const [cvList, setCvList] = useState([])
  const [selectedCvId, setSelectedCvId] = useState('')
  const [jobDescription, setJobDescription] = useState('')

  useEffect(() => {
    if (open) {
      fetchCVList()
      reset()
      setSelectedCvId('')
      setJobDescription('')
    }
  }, [open])

  const fetchCVList = async () => {
    try {
      const response = await api.get('/api/cv')
      setCvList(response.data.data || [])
    } catch (err) {
      console.error('Failed to fetch CV list:', err)
    }
  }

  const handleAnalyze = async () => {
    if (!selectedCvId) {
      return
    }
    await analyzeJob({ cvId: selectedCvId, jobDescription })
  }

  const handleClose = () => {
    reset()
    setSelectedCvId('')
    setJobDescription('')
    onClose()
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'match':
        return 'bg-green-100 text-green-800 border-green-300'
      case 'partial':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'mismatch':
        return 'bg-red-100 text-red-800 border-red-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getStatusLabel = (status) => {
    switch (status) {
      case 'match':
        return 'Cocok'
      case 'partial':
        return 'Sebagian'
      case 'mismatch':
        return 'Tidak Cocok'
      default:
        return '-'
    }
  }

  return (
    <Modal open={open} onClose={handleClose} title="Analisis Lowongan Pekerjaan" size="xl">
      <div className="space-y-4">
        {!result ? (
          <>
            <div>
              <label className="block text-sm font-medium text-ink mb-2">
                Pilih CV <span className="text-danger">*</span>
              </label>
              <select
                value={selectedCvId}
                onChange={(e) => setSelectedCvId(e.target.value)}
                className="field w-full"
                disabled={loading}
              >
                <option value="">-- Pilih CV --</option>
                {cvList.map((cv) => (
                  <option key={cv.id} value={cv.id}>
                    {cv.title || 'CV Tanpa Judul'}
                  </option>
                ))}
              </select>
              {cvList.length === 0 && (
                <p className="text-xs text-muted mt-1">
                  Anda belum memiliki CV. Silakan buat CV terlebih dahulu.
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-ink mb-2">
                Deskripsi Lowongan <span className="text-danger">*</span>
              </label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Tempel deskripsi lowongan pekerjaan di sini..."
                rows={8}
                className="field w-full resize-none"
                disabled={loading}
              />
              <p className="text-xs text-muted mt-1">
                Salin dan tempel seluruh deskripsi lowongan dari situs pencarian kerja.
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <Button variant="secondary" onClick={handleClose} className="flex-1" disabled={loading}>
                Batal
              </Button>
              <Button
                onClick={handleAnalyze}
                className="flex-1"
                disabled={!selectedCvId || !jobDescription.trim() || loading}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-paper border-t-transparent rounded-full animate-spin" />
                    Menganalisis...
                  </>
                ) : (
                  'Analisis'
                )}
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="space-y-4">
              {result.extracted && (
                <div className="card p-4 border-2 border-primary/20">
                  <h4 className="font-semibold text-ink mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Informasi Lowongan
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium text-ink">Posisi:</span>{' '}
                      <span className="text-muted">{result.extracted.position || '-'}</span>
                    </div>
                    {result.extracted.generalQualifications?.length > 0 && (
                      <div>
                        <span className="font-medium text-ink">Kualifikasi Umum:</span>
                        <ul className="list-disc list-inside mt-1 text-muted">
                          {result.extracted.generalQualifications.map((qual, i) => (
                            <li key={i}>{qual}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {result.extracted.specificQualifications?.length > 0 && (
                      <div>
                        <span className="font-medium text-ink">Kualifikasi Khusus:</span>
                        <ul className="list-disc list-inside mt-1 text-muted">
                          {result.extracted.specificQualifications.map((qual, i) => (
                            <li key={i}>{qual}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {result.matchAnalysis && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-ink flex items-center gap-2">
                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Analisis Kecocokan
                  </h4>

                  {['education', 'experience', 'skills'].map((category) => {
                    const analysis = result.matchAnalysis[category]
                    if (!analysis) return null

                    const categoryLabels = {
                      education: 'Pendidikan',
                      experience: 'Pengalaman',
                      skills: 'Keahlian',
                    }

                    return (
                      <div key={category} className={`card p-4 border-2 ${getStatusColor(analysis.status)}`}>
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-semibold">{categoryLabels[category]}</h5>
                          <span className="px-2 py-1 text-xs font-medium rounded">
                            {getStatusLabel(analysis.status)}
                          </span>
                        </div>
                        <p className="text-sm text-ink mb-2">{analysis.detail}</p>
                        {analysis.suggestion && (
                          <div className="mt-2 p-2 bg-white/50 rounded">
                            <p className="text-xs font-medium text-ink mb-1">Saran:</p>
                            <p className="text-xs text-muted">{analysis.suggestion}</p>
                          </div>
                        )}
                      </div>
                    )
                  })}

                  {result.matchAnalysis.overall && (
                    <div className={`card p-4 border-2 ${getStatusColor(result.matchAnalysis.overall.status)}`}>
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="font-semibold text-base">Kesimpulan Umum</h5>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-bold">
                            {result.matchAnalysis.overall.score}%
                          </span>
                          <span className="px-2 py-1 text-xs font-medium rounded">
                            {getStatusLabel(result.matchAnalysis.overall.status)}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-ink mb-2">{result.matchAnalysis.overall.detail}</p>
                      {result.matchAnalysis.overall.suggestion && (
                        <div className="mt-3 p-3 bg-white/50 rounded">
                          <p className="text-xs font-medium text-ink mb-1">Saran Keseluruhan:</p>
                          <p className="text-xs text-muted">{result.matchAnalysis.overall.suggestion}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <Button variant="secondary" onClick={handleClose} className="flex-1">
                Tutup
              </Button>
              <Button onClick={() => { reset(); setSelectedCvId(''); setJobDescription('') }} className="flex-1">
                Analisis Lagi
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  )
}
