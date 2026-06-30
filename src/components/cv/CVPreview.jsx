import { useEffect, useRef, useState } from 'react'
import ATSCleanHTML from './templates/ATSCleanHTML'
import ATSModernHTML from './templates/ATSModernHTML'

const ZOOM_STEPS = [0.5, 0.65, 0.8, 0.9, 1, 1.15, 1.3, 1.5]

export default function CVPreview({ data, templateId = 'ats-clean-v1', noBorder = false }) {
  const Template = templateId === 'ats-modern-v1' ? ATSModernHTML : ATSCleanHTML
  const containerRef = useRef(null)
  const [zoom, setZoom] = useState(1)
  const [autoFit, setAutoFit] = useState(true)

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

  return (
    <div className={`flex flex-col ${noBorder ? '' : 'border border-border'}`}>
      <div className="flex items-center justify-between gap-2 px-3 py-2 bg-surface border-b border-border">
        <div className="flex items-center gap-1.5">
          <svg className="w-4 h-4 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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
        className="overflow-auto bg-grid"
        style={{ minHeight: '400px' }}
      >
        <div className="cv-scaler" style={{ minHeight: '100%', height: `calc(${297 * zoom}mm + 16px)` }}>
          <div
            className="cv-page-wrap"
            style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}
          >
            <Template data={data} />
          </div>
        </div>
      </div>
    </div>
  )
}
