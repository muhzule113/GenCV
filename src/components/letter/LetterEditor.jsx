import { useEffect, useRef, useState } from 'react'
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
      `${p.name || ''}`,
      p.email ? `Email: ${p.email}` : '',
      p.phone ? `Telp: ${p.phone}` : '',
      p.address ? `Alamat: ${p.address}` : '',
      '',
      `${letter.city || '...'}, ${letter.letterDate || letter.date || '...'}`,
      '',
      `Kepada Yth.`,
      `${letter.recipientTitle || 'HRD'}`,
      `Di ${letter.company || '...'}`,
      ``,
      `Perihal: Lamaran Pekerjaan sebagai ${(letter.position || '').toUpperCase()}`,
      '',
      'Dengan hormat,',
      '',
      'Saya yang bertanda tangan di bawah ini :',
      ...(p.name ? [`Nama                   : ${p.name}`] : []),
      ...(p.birthPlace && p.birthDate ? [`Tempat, Tgl Lahir : ${p.birthPlace}, ${p.birthDate}`] : []),
      ...(p.gender ? [`Jenis Kelamin     : ${p.gender}`] : []),
      ...(p.lastEducation ? [`Pendidikan           : ${p.lastEducation}`] : []),
      ...(p.address ? [`Alamat                  : ${p.address}`] : []),
      ...(p.phone ? [`No. HP                 : ${p.phone}`] : []),
      ...(p.email ? [`E-mail                   : ${p.email}`] : []),
      ...(p.portfolio ? [`Portofolio            : ${p.portfolio}`] : []),
    ].filter(Boolean)
    const attachments = (letter.attachments || []).map((a) => ` \u2022 ${a}`)
    const paragraphs = (letter.content || '').split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean)
    const tail = [
      `Bersama surat ini, saya melampirkan:`,
      ...attachments,
      ...(paragraphs.length > 0 ? ['', ...paragraphs] : []),
      '',
      'Hormat saya,',
      '',
      '',
      `(${p.name || '...'})`,
    ].join('\n')
    const text = [...lines, tail].join('\n')
    try {
      await navigator.clipboard.writeText(text)
      addToast('Teks surat disalin ke clipboard', 'success')
    } catch {
      addToast('Gagal menyalin ke clipboard', 'error')
    }
  }

  return (
    <>
      <div className="flex items-center justify-between gap-2 px-4 py-3 bg-surface border-b border-border">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-muted shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z M17 21v-8H7v8 M7 3v5h8" />
          </svg>
          <span className="font-mono text-[11px] tracking-widest text-clip uppercase">Pratinjau Surat</span>
        </div>
        {letter && (
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={handleCopy}>Salin</Button>
            {pdfButton}
          </div>
        )}
      </div>

      {letter ? (
        <div>
          <div className="flex items-center gap-1.5 px-4 py-2 bg-surface/50 border-b border-border">
            <div className="flex items-center gap-1.5 mr-auto">
              <svg className="w-3.5 h-3.5 text-muted shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="font-mono text-[10px] tracking-widest text-clip uppercase text-muted">A4 Preview</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleZoomOut}
                disabled={autoFit}
                className="w-7 h-7 flex items-center justify-center text-muted hover:bg-ink/5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-150"
                aria-label="Zoom out"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
                </svg>
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="min-w-[44px] h-7 px-2 font-mono text-xs text-muted hover:bg-ink/5 transition-colors duration-150"
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
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
          </div>

          <div
            ref={containerRef}
            className="overflow-auto bg-white p-8 min-h-[250px] max-sm:min-h-[200px] shadow-sm"
            style={{ fontSize: `${11 * zoom}pt`, lineHeight: 1.6 }}
          >
            {letter.content ? (
              <div className="prose prose-sm max-w-none">
                <p className="text-right text-sm text-gray-500 mb-4">
                  {letter.city || 'Barru'}, {letter.date || ''}
                </p>
                <p className="mb-1">Kepada Yth.</p>
                <p className="mb-1">{letter.recipientTitle || 'HRD'}</p>
                <p className="mb-4">Di {letter.company || '[NAMA PERUSAHAAN]'}</p>
                <p className="mb-2">
                  <span className="font-semibold">Perihal</span>: Lamaran Pekerjaan sebagai{' '}
                  <span className="font-semibold">{(letter.position || '').toUpperCase()}</span>
                </p>
                <p className="mb-4">Dengan hormat,</p>
                <p className="mb-4">Saya yang bertanda tangan di bawah ini :</p>
                {letter.personal?.name && (
                  <div className="mb-1"><span className="inline-block w-36">Nama</span>: {letter.personal.name}</div>
                )}
                {letter.personal?.email && (
                  <div className="mb-1"><span className="inline-block w-36">E-mail</span>: {letter.personal.email}</div>
                )}
                {letter.personal?.phone && (
                  <div className="mb-1"><span className="inline-block w-36">Nomor HP</span>: {letter.personal.phone}</div>
                )}
                <div className="mt-6 whitespace-pre-wrap text-justify">
                  {letter.content.split('\n\n').map((para, i) => (
                    <p key={i} className="mb-3">{para}</p>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-gray-400 text-center mt-8">Surat belum digenerate. Isi form lalu klik Generate.</p>
            )}
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center p-12">
          <div className="text-center max-w-xs">
            <svg className="w-10 h-10 sm:w-12 sm:h-12 text-muted/30 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <p className="text-muted text-sm leading-relaxed">
              Isi form di samping, lalu klik <span className="font-medium text-ink">"Generate Surat"</span> untuk menghasilkan surat lamaran.
            </p>
          </div>
        </div>
      )}
    </>
  )
}
