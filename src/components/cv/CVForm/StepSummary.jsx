import { useState, useRef, useCallback } from 'react'
import { createWorker } from 'tesseract.js'
import Input from '../../common/Input'
import AIActionChip from '../../common/AIActionChip'
import useCVStore from '../../../store/cvStore'
import { analyzeJobMatch as analyzeJobApi } from '../../../services/aiService'
import useConfirmStore from '../../../store/confirmStore'

function StatusBadge({ status }) {
  const map = {
    match: { label: 'Sesuai', cls: 'border border-success text-success' },
    partial: { label: 'Sebagian', cls: 'border border-warning text-warning' },
    mismatch: { label: 'Tidak Sesuai', cls: 'border border-danger text-danger' },
  }
  const s = map[status] || map.mismatch
  return <span className={`inline-flex px-2 py-0.5 text-xs font-mono font-medium uppercase tracking-wider ${s.cls}`}>{s.label}</span>
}

function AnalysisSection({ title, data }) {
  if (!data) return null
  return (
    <div className="card p-4 space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-ink">{title}</h4>
        <StatusBadge status={data.status} />
      </div>
      <p className="text-sm text-muted">{data.detail}</p>
      {data.suggestion && (
        <div className="bg-sheet border border-border p-3">
          <p className="text-xs font-bold text-clip uppercase tracking-wider mb-0.5">Saran:</p>
          <p className="text-sm text-ink">{data.suggestion}</p>
        </div>
      )}
    </div>
  )
}

export default function StepSummary({ data, onChange, onGenerate, generating }) {
  const textareaRef = useRef(null)
  const [targetPosition, setTargetPosition] = useState('')
  const [tone, setTone] = useState('profesional')
  const [language, setLanguage] = useState('id')
  const [jobDescription, setJobDescription] = useState('')
  const [jobInputMode, setJobInputMode] = useState('text')
  const [analyzing, setAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState(null)
  const [showAnalysis, setShowAnalysis] = useState(false)
  const [ocrProgress, setOcrProgress] = useState(0)
  const [ocrFileName, setOcrFileName] = useState('')

  const cvData = useCVStore((s) => s.cvData)
  const requestConfirm = useConfirmStore((s) => s.requestConfirm)

  const handleGenerate = async () => {
    if (!targetPosition.trim()) return
    if (!await requestConfirm('Fitur ini akan menggunakan')) return
    const summary = await onGenerate({ targetPosition, tone, language })
    if (summary) {
      setTimeout(() => {
        textareaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        textareaRef.current?.focus()
      }, 200)
    }
  }

  const handleOcrImage = useCallback(async (file) => {
    setOcrFileName(file.name)
    setOcrProgress(0)
    setJobInputMode('image')
    try {
      const worker = await createWorker('ind', 1, {
        logger: (m) => {
          if (m.status === 'recognizing text') setOcrProgress(Math.round(m.progress * 100))
        },
      })
      const { data: text } = await worker.recognize(file)
      await worker.terminate()
      setJobDescription(text.text)
      setOcrProgress(100)
    } catch {
      setOcrFileName('')
      setOcrProgress(0)
    }
  }, [])

  const handleAnalyzeJob = async () => {
    if (!jobDescription.trim()) return
    if (!await requestConfirm('Fitur ini akan menggunakan')) return
    setAnalyzing(true)
    setAnalysisResult(null)
    setShowAnalysis(true)
    try {
      const result = await analyzeJobApi({ cvData, jobDescription })
      setAnalysisResult(result)
    } catch {
      setAnalysisResult(null)
    } finally {
      setAnalyzing(false)
    }
  }

  const extracted = analysisResult?.extracted
  const match = analysisResult?.matchAnalysis

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-lg font-semibold text-ink mb-1">Ringkasan Profil</h3>
        <p className="text-sm text-muted">Buat ringkasan dan analisis kecocokan dengan lowongan kerja.</p>
      </div>

        <div className="bg-sheet border border-border p-5 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-ink">Analisis Lowongan Kerja</p>
            <AIActionChip icon="sparkles" label="Cocokkan dengan AI" onClick={handleAnalyzeJob} loading={analyzing} disabled={!jobDescription.trim()} />
          </div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-clip">Bisa teks atau gambar</span>
        </div>

        <div className="flex gap-2 mb-2">
          <button
            type="button"
            onClick={() => setJobInputMode('text')}
            className={`px-3 py-1.5 text-xs font-medium transition-colors border ${jobInputMode === 'text' ? 'bg-ink text-paper border-ink' : 'bg-surface text-muted border-border hover:border-ink'}`}
          >
            Input Teks
          </button>
          <button
            type="button"
            onClick={() => setJobInputMode('image')}
            className={`px-3 py-1.5 text-xs font-medium transition-colors border ${jobInputMode === 'image' ? 'bg-ink text-paper border-ink' : 'bg-surface text-muted border-border hover:border-ink'}`}
          >
            Upload Gambar
          </button>
        </div>

        {jobInputMode === 'image' ? (
          <div className="space-y-2">
            <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-border cursor-pointer bg-surface hover:border-ink transition-colors">
              <div className="flex flex-col items-center gap-1">
                <svg className="w-5 h-5 text-ink" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
                <span className="text-xs text-muted">Upload gambar lowongan (JPG/PNG)</span>
              </div>
              <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleOcrImage(f) }} />
            </label>
            {ocrProgress > 0 && ocrProgress < 100 && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-muted">
                  <span>OCR: {ocrFileName}</span>
                  <span>{ocrProgress}%</span>
                </div>
                <div className="w-full h-1.5 bg-border overflow-hidden">
                  <div className="h-full bg-ink transition-all" style={{ width: `${ocrProgress}%` }} />
                </div>
              </div>
            )}
            {ocrProgress === 100 && <p className="text-xs text-success">✓ Teks berhasil diekstrak</p>}
          </div>
        ) : null}

        <div>
          <label className="block text-sm font-medium text-ink mb-1.5">
            Deskripsi Lowongan <span className="text-red-500">*</span>
          </label>
          <textarea
            placeholder="Tempel deskripsi lowongan di sini...&#10;Contoh:&#10;Posisi: Frontend Developer&#10;Kualifikasi Umum:&#10;- Pendidikan min D3/S1&#10;- Max 28 tahun&#10;Kualifikasi Khusus:&#10;- Menguasai React.js&#10;- Pengalaman 2 tahun"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            rows={5}
            className="field resize-y bg-surface"
          />
        </div>



        {showAnalysis && (
          <div className="space-y-3">
            {analyzing ? (
              <div className="py-6 text-center text-muted">
                <svg className="animate-spin h-5 w-5 mx-auto mb-2 text-ink" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                AI sedang membandingkan profil dengan lowongan...
              </div>
            ) : analysisResult ? (
              <div className="space-y-3">
                {extracted && (
                  <div className="card p-4 space-y-2">
                    <h4 className="text-sm font-semibold text-ink">Informasi Lowongan</h4>
                    {extracted.position && (
                      <p className="text-sm"><span className="font-medium">Posisi:</span> {extracted.position}</p>
                    )}
                    {extracted.generalQualifications?.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-ink mb-1">Kualifikasi Umum:</p>
                        <ul className="list-disc list-inside space-y-0.5">
                          {extracted.generalQualifications.map((q, i) => <li key={i} className="text-sm text-muted">{q}</li>)}
                        </ul>
                      </div>
                    )}
                    {extracted.specificQualifications?.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-ink mb-1">Kualifikasi Khusus:</p>
                        <ul className="list-disc list-inside space-y-0.5">
                          {extracted.specificQualifications.map((q, i) => <li key={i} className="text-sm text-muted">{q}</li>)}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                <h4 className="text-sm font-semibold text-ink">Hasil Analisis Kecocokan</h4>

                {match?.education && <AnalysisSection title="Pendidikan" data={match.education} />}
                {match?.experience && <AnalysisSection title="Pengalaman" data={match.experience} />}
                {match?.skills && <AnalysisSection title="Keahlian" data={match.skills} />}

                {match?.overall && (
                  <div className={`p-4 space-y-2 border ${
                    match.overall.status === 'match' ? 'bg-surface border-success' :
                    match.overall.status === 'partial' ? 'bg-surface border-warning' :
                    'bg-surface border-danger'
                  }`}>
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-ink">Kesimpulan</h4>
                      <div className="flex items-center gap-2">
                        {match.overall.score != null && (
                          <span className={`text-sm font-bold ${
                            match.overall.score >= 75 ? 'text-success' :
                            match.overall.score >= 50 ? 'text-warning' :
                            'text-danger'
                          }`}>{match.overall.score}%</span>
                        )}
                        <StatusBadge status={match.overall.status} />
                      </div>
                    </div>
                    <p className="text-sm text-muted">{match.overall.detail}</p>
                    {match.overall.suggestion && (
                      <div className="bg-sheet border border-border p-3 mt-2">
                        <p className="text-xs font-bold text-clip uppercase tracking-wider mb-0.5">Saran:</p>
                        <p className="text-sm text-ink">{match.overall.suggestion}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-danger">Analisis gagal. Coba lagi.</p>
            )}
          </div>
        )}
      </div>

      <div className="bg-sheet border border-border p-5 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-ink">Referensi untuk AI Ringkasan</p>
          <AIActionChip icon="sparkles" label="Generate dengan AI" onClick={handleGenerate} loading={generating} disabled={!targetPosition.trim()} pulse={generating} />
        </div>

        <div>
          <label className="block text-sm font-medium text-ink mb-1.5">
            Target Posisi yang Dilamar <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="contoh: Backend Developer, Staff Admin, Data Analyst"
            value={targetPosition}
            onChange={(e) => setTargetPosition(e.target.value)}
            className="field bg-surface"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-ink mb-2">
            Tone Ringkasan
          </label>
          <div className="flex flex-wrap gap-4">
            {[
              { value: 'profesional', label: 'Profesional', desc: 'formal, terstruktur, cocok untuk perusahaan korporat' },
              { value: 'percaya-diri', label: 'Percaya Diri', desc: 'tegas, menonjolkan pencapaian' },
              { value: 'adaptif', label: 'Adaptif', desc: 'fleksibel, cocok untuk multi-industri' },
            ].map((opt) => (
              <label key={opt.value} className="flex items-start gap-2 cursor-pointer group">
                <input
                  type="radio"
                  name="tone"
                  value={opt.value}
                  checked={tone === opt.value}
                  onChange={(e) => setTone(e.target.value)}
                  className="mt-1 accent-ink cursor-pointer"
                />
                <div>
                  <span className="text-sm font-medium text-ink group-hover:text-clip transition-colors">{opt.label}</span>
                  <p className="text-xs text-muted">{opt.desc}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-ink mb-2">
            Bahasa Output
          </label>
          <div className="flex gap-6">
            {[
              { value: 'id', label: 'Bahasa Indonesia' },
              { value: 'en', label: 'English' },
            ].map((opt) => (
              <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="language"
                  value={opt.value}
                  checked={language === opt.value}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="accent-ink cursor-pointer"
                />
                <span className="text-sm text-ink">{opt.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div ref={textareaRef}>
        <Input
          type="textarea"
          placeholder="Full Stack Developer dengan pengalaman 3 tahun dalam pengembangan web menggunakan React.js dan Node.js..."
          value={data.summary}
          onChange={(e) => onChange('summary', e.target.value)}
          rows={5}
        />
      </div>
    </div>
  )
}
