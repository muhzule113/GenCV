import { useEffect, useRef, useState } from 'react'
import CoverLetterHTML from './CoverLetterHTML'
import Button from '../common/Button'
import useToastStore from '../../store/toastStore'

const ZOOM_STEPS = [0.5, 0.65, 0.8, 0.9, 1, 1.15, 1.3, 1.5]

export default function LetterEditor({ letter, pdfButton }) {
  const containerRef = useRef(null)
  const [zoom, setZoom] = useState(1)
  const [autoFit, setAutoFit] = useState(true)
  const addToast = useToastStore((s) => s.addToast)

  useEffect(() => {
    if (!autoFit || !containerRef.current) return
    const el = containerRef.current
    const observer = new ResizeObserver(() => {
      const w = el.clientWidth
      if (!w) return
      const PAGE_PX = 210 * 3.7795275591
      const fit = (w - 32) / PAGE_PX
      const clamped = Math.min(1, Math.max(0.4, fit))
      setZoom(parseFloat(clamped.toFixed(2)))
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [autoFit])

  const handleZoomIn = () => {
    setAutoFit(false)
    const next = ZOOM_STEPS.find((z) => z > zoom + 0.01) || ZOOM_STEPS[ZOOM_STEPS.length - 1]
    setZoom(next)
  }
  const handleZoomOut = () => {
    setAutoFit(false)
    const next = [...ZOOM_STEPS].reverse().find((z) => z < zoom - 0.01) || ZOOM_STEPS[0]
    setZoom(next)
  }
  const handleReset = () => {
    setAutoFit(true)
    setZoom(1)
  }

  const handleCopy = async () => {
    if (!letter) return
    const p = letter.personal || {}
    const lines = [
      `${letter.city || 'Barru'}, ${letter.date || '12 Juni 2026'}`,
      '',
      'Kepada Yth.',
      letter.recipientTitle || 'HRD',
      `Di ${letter.company || '[NAMA PERUSAHAAN]'}`,
      '',
      `Perihal: Lamaran Pekerjaan sebagai ${(letter.position || '').toUpperCase()}`,
      '',
      'Dengan hormat,',
      '',
      'Saya yang bertanda tangan di bawah ini :',
      `Nama : ${p.name || ''}`,
      p.birthPlace || p.birthDate ? `Tempat, Tgl Lahir : ${p.birthPlace || ''}${p.birthPlace && p.birthDate ? ', ' : ''}${p.birthDate || ''}` : null,
      p.gender ? `Jenis Kelamin : ${p.gender}` : null,
      p.lastEducation ? `Pendidikan : ${p.lastEducation}` : null,
      p.address ? `Alamat : ${p.address}` : null,
      p.phone ? `Nomor HP : ${p.phone}` : null,
      p.email ? `E-mail : ${p.email}` : null,
      p.portfolio ? `Portofolio : ${p.portfolio}` : null,
      '',
      `Dengan ini mengajukan lamaran sebagai ${(letter.position || '').toUpperCase()}, bersama ini saya lampirkan dokumen persyaratan sebagai berikut:`,
    ].filter(Boolean)
    const attachments = (letter.attachments || []).map((a) => ` \u2022 ${a}`)
    const paragraphs = (letter.content || '').split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean)
    const tail = [
      '',
      paragraphs.join('\n\n'),
      '',
      ' Hormat saya,',
      '',
      '',
      ` ( ${p.name || '[Nama Lengkap]'} )`,
    ].join('\n')
    const text = [...lines, ...attachments, tail].join('\n')
    try {
      await navigator.clipboard.writeText(text)
      addToast('Teks surat disalin ke clipboard', 'success')
    } catch {
      addToast('Gagal menyalin ke clipboard', 'error')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <span className="font-mono text-[11px] tracking-widest text-clip uppercase">Hasil Surat</span>
        {letter && (
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" size="sm" onClick={handleCopy}>Salin</Button>
            {pdfButton}
          </div>
        )}
      </div>

      {letter ? (
        <div className="flex flex-col border border-border">
          <div className="flex flex-wrap items-center gap-1 px-3 py-2 bg-surface border-b border-border">
            <div className="flex items-center gap-1.5 mr-auto">
              <svg className="w-4 h-4 text-muted shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="font-mono text-[11px] tracking-widest text-clip uppercase">A4 Preview</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleZoomOut}
                disabled={autoFit}
                className="w-7 h-7 flex items-center justify-center text-muted hover:bg-ink/5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-150"
                aria-label="Zoom out"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
                </svg>
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="min-w-[48px] h-7 px-2 font-mono text-xs text-muted hover:bg-ink/5 transition-colors duration-150"
              >
                {Math.round(zoom * 100)}%
              </button>
              <button
                type="button"
                onClick={handleZoomIn}
                disabled={autoFit}
                className="w-7 h-7 flex items-center justify-center text-muted hover:bg-ink/5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-150"
                aria-label="Zoom in"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
          </div>

          <div
            ref={containerRef}
            className="overflow-auto bg-grid min-h-[250px] max-sm:min-h-[200px]"
          >
            <div className="cv-scaler" style={{ minHeight: '100%' }}>
              <div
                className="cv-page-wrap"
                style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}
              >
                <CoverLetterHTML data={letter} />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="card p-6 sm:p-8 text-center">
          <svg className="w-8 h-8 sm:w-12 sm:h-12 text-muted mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <p className="text-muted text-sm">Isi form di atas, lalu klik "Generate Surat" untuk menghasilkan surat lamaran.</p>
        </div>
      )}
    </div>
  )
}
