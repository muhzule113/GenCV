const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']

function formatDate(value) {
  if (!value || value === 'Sekarang') return value
  const m = String(value).match(/^(\d{4})-(\d{2})$/)
  if (m) {
    const monthIdx = parseInt(m[2], 10) - 1
    return `${monthNames[monthIdx] || m[2]} ${m[1]}`
  }
  return value
}

function formatPeriod(start, end, isCurrent) {
  const s = formatDate(start)
  const e = isCurrent ? 'Sekarang' : formatDate(end)
  if (!s && !e) return ''
  return `${s || '?'} – ${e || '?'}`
}

function getSkills(data) {
  const tech = data.skills?.technical || []
  const soft = data.skills?.soft || []
  return {
    technical: Array.isArray(tech) && tech.length > 0 && typeof tech[0] === 'string'
      ? tech.map((t) => ({ name: t, level: null }))
      : tech,
    soft: Array.isArray(soft) && soft.length > 0 && typeof soft[0] === 'string' ? soft : data.skills?.interpersonal || [],
  }
}

export default function ATSCleanHTML({ data }) {
  const skills = getSkills(data)
  const p = data.personal || {}

  return (
    <div className="cv-page cv-clean">
      <header className="cv-header-clean">
        <h1 className="cv-name">{p.name || 'Nama Lengkap Anda'}</h1>
        {p.jobTitle && <p className="cv-jobtitle">{p.jobTitle}</p>}
        <p className="cv-contact">
          {[p.city, p.phone, p.email].filter(Boolean).join(' · ')}
        </p>
        <p className="cv-contact">
          {[p.linkedin, p.github, p.portfolio].filter(Boolean).join(' · ')}
        </p>
      </header>

      {data.summary && (
        <section className="cv-section">
          <h2 className="cv-section-title">Ringkasan Profil</h2>
          <p className="cv-text">{data.summary}</p>
        </section>
      )}

      {data.experiences?.length > 0 && (
        <section className="cv-section">
          <h2 className="cv-section-title">Pengalaman Kerja</h2>
          {data.experiences.map((exp, i) => (
            <div key={i} className="cv-item">
              <div className="cv-item-head">
                <span className="cv-item-title">{exp.position}</span>
              </div>
              <p className="cv-item-sub">
                {exp.company}{exp.company ? ' — ' : ''}
                {formatPeriod(exp.startDate || exp.start_date, exp.endDate || exp.end_date, exp.isCurrent)}
              </p>
              {exp.description?.length > 0 && (
                <ul className="cv-bullets">
                  {exp.description.map((point, j) => (
                    <li key={j}>{point}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </section>
      )}

      {data.educations?.length > 0 && (
        <section className="cv-section">
          <h2 className="cv-section-title">Pendidikan</h2>
          {data.educations.map((edu, i) => (
            <div key={i} className="cv-item">
              <div className="cv-row">
                <span className="cv-item-title">{edu.degree}{edu.institution ? ` — ${edu.institution}` : ''}</span>
                <span className="cv-meta">
                  {edu.startYear || edu.start_year} – {edu.endYear || edu.end_year || 'Sekarang'}
                </span>
              </div>
              <p className="cv-item-sub">
                {edu.field}{edu.gpa ? `, IPK: ${edu.gpa}` : ''}
              </p>
              {edu.thesis && <p className="cv-thesis">Tugas Akhir: {edu.thesis}</p>}
            </div>
          ))}
        </section>
      )}

      {(skills.technical.length > 0 || skills.soft.length > 0) && (
        <section className="cv-section">
          <h2 className="cv-section-title">Keahlian</h2>
          <div className="cv-cols">
            {skills.technical.length > 0 && (
              <div>
                <p className="cv-col-label">Keahlian Teknis</p>
                <ul className="cv-bullets">
                  {skills.technical.map((s, i) => (
                    <li key={i}>{s.name}{s.level ? ` (${s.level})` : ''}</li>
                  ))}
                </ul>
              </div>
            )}
            {skills.soft.length > 0 && (
              <div>
                <p className="cv-col-label">Interpersonal</p>
                <ul className="cv-bullets">
                  {skills.soft.map((s, i) => (
                    <li key={i}>{typeof s === 'string' ? s : s.name}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>
      )}

      {(data.certifications?.length > 0 || data.languages?.length > 0) && (
        <section className="cv-section">
          <h2 className="cv-section-title">Bahasa & Sertifikasi</h2>
          <p className="cv-text">
            {data.languages?.length > 0 && (
              <span>
                <strong>Bahasa: </strong>
                {data.languages.map((l) => `${l.name}${l.level ? ` (${l.level})` : ''}`).join(', ')}
              </span>
            )}
            {data.languages?.length > 0 && data.certifications?.length > 0 && <span> &nbsp;|&nbsp; </span>}
            {data.certifications?.length > 0 && (
              <span>
                <strong>Sertifikasi: </strong>
                {data.certifications.map((c) => c.name + (c.issuer ? ` — ${c.issuer}` : '')).join(', ')}
              </span>
            )}
          </p>
        </section>
      )}

      {data.projects?.length > 0 && (
        <section className="cv-section">
          <h2 className="cv-section-title">Proyek & Portofolio</h2>
          {data.projects.map((proj, i) => (
            <div key={i} className="cv-item">
              <div className="cv-row">
                <span className="cv-item-title">{proj.name}</span>
                <span className="cv-meta">
                  {proj.period || formatPeriod(proj.startDate, proj.endDate, false)}
                </span>
              </div>
              {(proj.techStack || proj.tech_stack)?.length > 0 && (
                <p className="cv-tech">Teknologi: {(proj.techStack || proj.tech_stack).join(', ')}</p>
              )}
              {proj.description && <p className="cv-text-sm">{proj.description}</p>}
            </div>
          ))}
        </section>
      )}
    </div>
  )
}
