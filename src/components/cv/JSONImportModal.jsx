import { useState, useRef } from 'react'
import Modal from '../../components/common/Modal'
import Button from '../../components/common/Button'
import { parseCVImport, parseLinkedInJSON } from '../../utils/importParser'

export default function JSONImportModal({ open, onClose, onImport }) {
  const [step, setStep] = useState('upload')
  const [parsed, setParsed] = useState(null)
  const [error, setError] = useState(null)
  const [source, setSource] = useState('custom')
  const fileRef = useRef(null)

  const reset = () => {
    setStep('upload')
    setParsed(null)
    setError(null)
    setSource('custom')
    if (fileRef.current) fileRef.current.value = ''
  }

  const handleFile = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const raw = ev.target.result
        const result = source === 'linkedin'
          ? parseLinkedInJSON(raw)
          : parseCVImport(raw)
        setParsed(result)
        setError(null)
        setStep('preview')
      } catch (err) {
        setError(err.message || 'Gagal parsing file')
        setParsed(null)
        setStep('upload')
      }
    }
    reader.onerror = () => setError('Gagal membaca file')
    reader.readAsText(file)
  }

  const handleConfirm = () => {
    if (parsed) {
      onImport(parsed)
      onClose()
      reset()
    }
  }

  const handleSample = async () => {
    const { dummyCVs } = await import('../../data/dummyData')
    const sample = dummyCVs[0].data
    setParsed(sample)
    setError(null)
    setStep('preview')
  }

  if (!open) return null

  return (
    <Modal
      open={open}
      onClose={() => { reset(); onClose() }}
      title="Import Data JSON"
      size="lg"
      actions={
        step === 'preview' ? (
          <>
            <Button variant="ghost" size="sm" onClick={() => setStep('upload')}>Kembali</Button>
            <Button size="sm" onClick={handleConfirm}>Import Data</Button>
          </>
        ) : null
      }
    >
      {step === 'upload' ? (
        <div className="space-y-4">
          <div className="flex gap-2 mb-3">
            <button
              type="button"
              onClick={() => setSource('custom')}
              className={`px-3 py-1.5 text-xs font-medium transition-colors border ${source === 'custom' ? 'bg-ink text-paper border-ink' : 'bg-surface text-muted border-border hover:border-ink'}`}
            >
              JSON CV
            </button>
            <button
              type="button"
              onClick={() => setSource('linkedin')}
              className={`px-3 py-1.5 text-xs font-medium transition-colors border ${source === 'linkedin' ? 'bg-ink text-paper border-ink' : 'bg-surface text-muted border-border hover:border-ink'}`}
            >
              LinkedIn Export
            </button>
          </div>

          <p className="text-sm text-muted">
            {source === 'custom'
              ? 'Upload file JSON dengan data CV Anda. Field akan otomatis dipetakan ke form.'
              : 'Upload hasil export LinkedIn dalam format JSON.'}
          </p>

          <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-border cursor-pointer bg-surface hover:border-ink transition-colors">
            <div className="flex flex-col items-center gap-2">
              <svg className="w-8 h-8 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
              <span className="text-sm text-muted">Klik untuk upload file JSON</span>
              <span className="text-xs text-muted/60">atau drag & drop file di sini</span>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleFile}
            />
          </label>

          <div className="text-center">
            <button
              onClick={handleSample}
              className="text-xs text-primary underline hover:no-underline"
            >
              Coba dengan data sampel
            </button>
          </div>

          {error && (
            <div className="border border-danger p-3">
              <p className="text-xs text-danger">{error}</p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3 max-h-[60vh] overflow-y-auto">
          {parsed.personal && Object.keys(parsed.personal).length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-ink mb-2">Data Diri</h4>
              <div className="grid grid-cols-2 gap-1 text-xs">
                {Object.entries(parsed.personal).map(([k, v]) => (
                  v && <div key={k}><span className="text-muted">{k}:</span> <span className="text-ink">{v}</span></div>
                ))}
              </div>
            </div>
          )}

          {parsed.summary && (
            <div>
              <h4 className="text-sm font-semibold text-ink mb-1">Ringkasan</h4>
              <p className="text-xs text-muted line-clamp-3">{parsed.summary}</p>
            </div>
          )}

          {parsed.experiences?.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-ink mb-1">Pengalaman ({parsed.experiences.length})</h4>
              {parsed.experiences.slice(0, 3).map((exp, i) => (
                <div key={i} className="text-xs text-muted pl-2 border-l-2 border-border mb-1">
                  <span className="text-ink font-medium">{exp.position}</span> di {exp.company}
                </div>
              ))}
              {parsed.experiences.length > 3 && <p className="text-xs text-muted">+{parsed.experiences.length - 3} lainnya</p>}
            </div>
          )}

          {parsed.educations?.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-ink mb-1">Pendidikan ({parsed.educations.length})</h4>
              {parsed.educations.slice(0, 2).map((edu, i) => (
                <div key={i} className="text-xs text-muted">{edu.degree} - {edu.institution}</div>
              ))}
            </div>
          )}

          {parsed.skills && (
            <div>
              <h4 className="text-sm font-semibold text-ink mb-1">Keahlian</h4>
              <p className="text-xs text-muted">
                {(parsed.skills.technical || []).length} teknis, {(parsed.skills.soft || []).length} interpersonal
              </p>
            </div>
          )}

          {parsed.projects?.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-ink mb-1">Proyek ({parsed.projects.length})</h4>
              {parsed.projects.slice(0, 2).map((p, i) => (
                <div key={i} className="text-xs text-muted">{p.name}</div>
              ))}
            </div>
          )}

          {parsed.certifications?.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-ink mb-1">Sertifikasi ({parsed.certifications.length})</h4>
              {parsed.certifications.slice(0, 2).map((c, i) => (
                <div key={i} className="text-xs text-muted">{c.name}</div>
              ))}
            </div>
          )}
        </div>
      )}
    </Modal>
  )
}
