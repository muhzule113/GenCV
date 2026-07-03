import { useEffect, useRef, useState } from 'react'

const ZOOM_STEPS = [0.5, 0.65, 0.8, 0.9, 1, 1.15, 1.3, 1.5]

function formatDate(value) {
  if (!value || value === 'Sekarang') return value
  const m = String(value).match(/^(\d{4})-(\d{2})$/)
  if (m) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
    return `${months[parseInt(m[2], 10) - 1]} ${m[1]}`
  }
  return value
}

function formatPeriod(start, end, isCurrent) {
  const s = formatDate(start)
  const e = isCurrent ? 'Sekarang' : formatDate(end)
  return `${s} — ${e}`
}

function CVPreviewHTML({ data }) {
  const p = data.personal || {}
  const exps = data.experiences || []
  const edus = data.educations || []
  const skills = data.skills || {}
  const techSkills = Array.isArray(skills.technical) ? skills.technical : []
  const softSkills = Array.isArray(skills.soft) ? skills.soft : []
  const projects = data.projects || []
  const certs = data.certifications || []
  const langs = data.languages || []

  return (
    <div style={{ fontFamily: 'Helvetica, Arial, sans-serif', fontSize: 10, color: '#000', lineHeight: 1.4 }}>
      <div style={{ textAlign: 'center', marginBottom: 16 }}>
        <div style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 2 }}>{p.name || ''}</div>
        {p.jobTitle && <div style={{ fontSize: 11, color: '#333', marginBottom: 6 }}>{p.jobTitle}</div>}
        <div style={{ fontSize: 9, color: '#444' }}>
          {[p.city, p.phone, p.email].filter(Boolean).join(' | ')}
        </div>
        <div style={{ fontSize: 9, color: '#444' }}>
          {[p.linkedin, p.github, p.portfolio].filter(Boolean).join(' | ')}
        </div>
      </div>

      {data.summary && (
        <div style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase', borderBottom: '1px solid #1D4ED8', paddingBottom: 2, marginBottom: 6 }}>Ringkasan Profil</div>
          <div style={{ lineHeight: 1.4 }}>{data.summary}</div>
        </div>
      )}

      {exps.length > 0 && (
        <div style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase', borderBottom: '1px solid #1D4ED8', paddingBottom: 2, marginBottom: 6 }}>Pengalaman Kerja</div>
          {exps.map((exp, i) => (
            <div key={i} style={{ marginBottom: 7 }}>
              <div style={{ fontWeight: 'bold' }}>{exp.position || exp.jabatan}</div>
              <div style={{ fontSize: 9, color: '#444' }}>
                {(exp.company || exp.perusahaan)} — {formatPeriod(exp.startDate || exp.start_date, exp.endDate || exp.end_date, exp.isCurrent)}
              </div>
              {(exp.description || exp.deskripsi || []).map((point, j) => (
                <div key={j} style={{ marginLeft: 12, marginBottom: 1 }}>• {point}</div>
              ))}
            </div>
          ))}
        </div>
      )}

      {edus.length > 0 && (
        <div style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase', borderBottom: '1px solid #1D4ED8', paddingBottom: 2, marginBottom: 6 }}>Pendidikan</div>
          {edus.map((edu, i) => (
            <div key={i} style={{ marginBottom: 5 }}>
              <div style={{ fontWeight: 'bold' }}>{edu.degree} — {edu.institution}</div>
              <div style={{ fontSize: 9, color: '#444' }}>
                {edu.startYear || edu.start_year} – {edu.endYear || edu.end_year || 'Sekarang'}
              </div>
              {edu.field && <div style={{ fontSize: 9, color: '#333' }}>{edu.field}{edu.gpa ? `, IPK: ${edu.gpa}` : ''}</div>}
            </div>
          ))}
        </div>
      )}

      {(techSkills.length > 0 || softSkills.length > 0) && (
        <div style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase', borderBottom: '1px solid #1D4ED8', paddingBottom: 2, marginBottom: 6 }}>Keahlian</div>
          <div style={{ display: 'flex' }}>
            {techSkills.length > 0 && (
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 'bold', fontSize: 10, marginBottom: 2 }}>Keahlian Teknis</div>
                {techSkills.map((s, i) => <div key={i} style={{ fontSize: 9 }}>• {typeof s === 'string' ? s : s.name || ''}</div>)}
              </div>
            )}
            {softSkills.length > 0 && (
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 'bold', fontSize: 10, marginBottom: 2 }}>Interpersonal</div>
                {softSkills.map((s, i) => <div key={i} style={{ fontSize: 9 }}>• {typeof s === 'string' ? s : s.name || ''}</div>)}
              </div>
            )}
          </div>
        </div>
      )}

      {(certs.length > 0 || langs.length > 0) && (
        <div style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase', borderBottom: '1px solid #1D4ED8', paddingBottom: 2, marginBottom: 6 }}>Bahasa & Sertifikasi</div>
          {langs.length > 0 && <div style={{ fontSize: 9 }}>Bahasa: {langs.map(l => `${l.name}${l.level ? ` (${l.level})` : ''}`).join(', ')}</div>}
          {certs.length > 0 && <div style={{ fontSize: 9 }}>Sertifikasi: {certs.map(c => c.name + (c.issuer ? ` — ${c.issuer}` : '')).join(', ')}</div>}
        </div>
      )}

      {projects.length > 0 && (
        <div>
          <div style={{ fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase', borderBottom: '1px solid #1D4ED8', paddingBottom: 2, marginBottom: 6 }}>Proyek & Portofolio</div>
          {projects.map((proj, i) => (
            <div key={i} style={{ marginBottom: 5 }}>
              <div style={{ fontWeight: 'bold' }}>{proj.name}</div>
              {(proj.techStack || proj.tech_stack)?.length > 0 && <div style={{ fontSize: 9, fontStyle: 'italic', color: '#555' }}>Teknologi: {(proj.techStack || proj.tech_stack).join(', ')}</div>}
              {proj.description && <div style={{ fontSize: 9 }}>{proj.description}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function CVPreview({ data, templateId = 'ats-clean-v1', noBorder = false }) {
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
          <svg className="w-4 h-4 text-muted shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span className="font-mono text-[11px] tracking-widest text-clip uppercase">Pratinjau CV</span>
        </div>
        <div className="flex items-center gap-1">
          <button type="button" onClick={handleZoomOut} disabled={autoFit}
            className="w-7 h-7 flex items-center justify-center text-muted hover:bg-ink/5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-150" aria-label="Zoom out">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" /></svg>
          </button>
          <button type="button" onClick={handleZoomIn} disabled={autoFit}
            className="w-7 h-7 flex items-center justify-center text-muted hover:bg-ink/5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-150" aria-label="Zoom in">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
          </button>
          <span className="text-xs text-muted tabular-nums min-w-[2.5rem] text-center">{Math.round(zoom * 100)}%</span>
          <button type="button" onClick={handleReset}
            className="text-xs text-primary hover:text-primary/80 transition-colors duration-150 ml-1">Reset</button>
        </div>
      </div>
      <div ref={containerRef} className="overflow-auto bg-grid" style={{ minHeight: '400px' }}>
        <div className="cv-scaler" style={{ minHeight: '100%', height: `calc(${297 * zoom}mm + 16px)` }}>
          <div className="cv-page-wrap bg-white p-[40px]" style={{ transform: `scale(${zoom})`, transformOrigin: 'top center', width: '210mm', height: '297mm' }}>
            <CVPreviewHTML data={data} />
          </div>
        </div>
      </div>
    </div>
  )
}
