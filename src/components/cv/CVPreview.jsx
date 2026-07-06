import { useEffect, useRef, useState } from 'react'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']

function formatDate(value) {
  if (!value || value === 'Sekarang') return value
  const m = String(value).match(/^(\d{4})-(\d{2})$/)
  if (m) return `${MONTHS[parseInt(m[2], 10) - 1]} ${m[1]}`
  return value
}

function formatPeriod(start, end, isCurrent) {
  const s = formatDate(start)
  const e = isCurrent ? 'Sekarang' : formatDate(end)
  return `${s} \u2014 ${e}`
}

function skillList(skills) {
  if (!skills) return []
  return Array.isArray(skills) ? skills : []
}

function getSkillsObj(data) {
  const tech = data.skills?.technical || []
  const soft = data.skills?.soft || []
  return {
    technical: Array.isArray(tech) ? tech : [],
    soft: Array.isArray(soft) ? soft : [],
  }
}

const ZOOM_STEPS = [0.5, 0.65, 0.8, 0.9, 1]

function SectionTitle({ label, color = '#111827' }) {
  return (
    <div style={{
      fontSize: 9.5, fontWeight: 'bold', textTransform: 'uppercase',
      borderBottom: `1px solid ${color}`, paddingBottom: 2,
      marginTop: 12, marginBottom: 5, color,
    }}>
      {label}
    </div>
  )
}

// ── 1. ATS Clean Layout (ats-clean-v1) ────────────────────────────────────
function ATSCleanLayout({ data, p }) {
  const exps = data.experiences || []
  const edus = data.educations || []
  const skills = getSkillsObj(data)
  const projects = data.projects || []
  const certs = data.certifications || []
  const langs = data.languages || []
  const accent = '#1A1A1A'

  return (
    <div style={{ fontFamily: 'Helvetica, Arial, sans-serif', fontSize: 8.5, color: '#1A1A1A', lineHeight: 1.4 }}>
      <div style={{ textAlign: 'center', marginBottom: 12, paddingBottom: 10, borderBottom: `2px solid ${accent}` }}>
        <div style={{ fontSize: 18, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 }}>{p.name || ''}</div>
        {p.jobTitle && <div style={{ fontSize: 9, color: '#555', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 6 }}>{p.jobTitle}</div>}
        <div style={{ fontSize: 7.5, color: '#555' }}>
          {[p.email, p.phone, p.city].filter(Boolean).join(' \u2022 ')}
        </div>
        <div style={{ fontSize: 7.5, color: '#555', marginTop: 1 }}>
          {[p.linkedin, p.github, p.portfolio].filter(Boolean).join(' \u2022 ')}
        </div>
      </div>

      {data.summary && (
        <div style={{ marginBottom: 6 }}>
          <SectionTitle label="Ringkasan Profesional" color={accent} />
          <div style={{ fontSize: 8, lineHeight: 1.4, color: '#333' }}>{data.summary}</div>
        </div>
      )}

      {exps.length > 0 && (
        <div style={{ marginBottom: 6 }}>
          <SectionTitle label="Pengalaman Kerja" color={accent} />
          {exps.map((exp, i) => (
            <div key={i} style={{ marginBottom: 4 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: 8.5 }}>
                <span>{exp.position}</span>
                <span style={{ fontSize: 7.5, color: '#666' }}>{formatPeriod(exp.startDate || exp.start_date, exp.endDate || exp.end_date, exp.isCurrent)}</span>
              </div>
              <div style={{ fontSize: 7.5, color: '#444', fontStyle: 'italic', marginBottom: 1 }}>{exp.company}</div>
              {(exp.description || []).map((point, j) => (
                <div key={j} style={{ marginLeft: 8, fontSize: 8, color: '#333' }}>{'\u2022'} {point}</div>
              ))}
            </div>
          ))}
        </div>
      )}

      {edus.length > 0 && (
        <div style={{ marginBottom: 6 }}>
          <SectionTitle label="Pendidikan" color={accent} />
          {edus.map((edu, i) => (
            <div key={i} style={{ marginBottom: 3 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: 8.5 }}>
                <span>{edu.degree}, {edu.field}</span>
                <span style={{ fontSize: 7.5, color: '#555' }}>{edu.startYear || edu.start_year} {'\u2013'} {edu.endYear || edu.end_year || 'Sekarang'}</span>
              </div>
              <div style={{ fontSize: 7.5, color: '#333' }}>{edu.institution}{edu.gpa ? ` — IPK: ${edu.gpa}` : ''}</div>
              {edu.thesis && <div style={{ fontSize: 7, color: '#555', fontStyle: 'italic' }}>Tugas Akhir: {edu.thesis}</div>}
            </div>
          ))}
        </div>
      )}

      {skills.technical.length > 0 && (
        <div style={{ marginBottom: 6 }}>
          <SectionTitle label="Keahlian" color={accent} />
          <div style={{ display: 'flex', flexWrap: 'wrap', marginLeft: 8 }}>
            {skills.technical.map((s, i) => (
              <div key={`t-${i}`} style={{ flex: '0 0 50%', fontSize: 8, color: '#333', marginBottom: 1 }}>{'\u2022'} {typeof s === 'string' ? s : s.name}</div>
            ))}
            {skills.soft.map((s, i) => (
              <div key={`s-${i}`} style={{ flex: '0 0 50%', fontSize: 8, color: '#333', marginBottom: 1 }}>{'\u2022'} {typeof s === 'string' ? s : s.name || s}</div>
            ))}
          </div>
        </div>
      )}

      {projects.length > 0 && (
        <div style={{ marginBottom: 6 }}>
          <SectionTitle label="Proyek" color={accent} />
          {projects.map((proj, i) => (
            <div key={i} style={{ marginBottom: 3 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: 8.5 }}>
                <span>{proj.name}</span>
                {proj.period && <span style={{ fontSize: 7, color: '#555' }}>{proj.period}</span>}
              </div>
              {(proj.techStack || proj.tech_stack)?.length > 0 && <div style={{ fontSize: 7, fontStyle: 'italic', color: '#555' }}>{(proj.techStack || proj.tech_stack).join(', ')}</div>}
              {proj.description && <div style={{ fontSize: 8, color: '#333' }}>{proj.description}</div>}
            </div>
          ))}
        </div>
      )}

      {certs.length > 0 && (
        <div style={{ marginBottom: 6 }}>
          <SectionTitle label="Sertifikasi" color={accent} />
          {certs.map((c, i) => (
            <div key={i} style={{ fontSize: 8, color: '#333', marginBottom: 1 }}>{'\u2022'} {c.name}{c.issuer ? ` — ${c.issuer}` : ''}</div>
          ))}
        </div>
      )}

      {langs.length > 0 && (
        <div style={{ marginBottom: 6 }}>
          <SectionTitle label="Bahasa" color={accent} />
          <div style={{ fontSize: 8, color: '#333' }}>{langs.map(l => `${l.name}${l.level ? ` — ${l.level}` : ''}`).join('  \u2022  ')}</div>
        </div>
      )}
    </div>
  )
}

// ── 2. ATS Modern Minimal Layout (ats-modern-minimal-v1) ──────────────────
function ATSModernMinimalLayout({ data, p }) {
  const exps = data.experiences || []
  const edus = data.educations || []
  const skills = getSkillsObj(data)
  const projects = data.projects || []
  const certs = data.certifications || []
  const langs = data.languages || []
  const accent = '#334155'
  return (
    <div style={{ fontFamily: 'Helvetica, Arial, sans-serif', fontSize: 8.5, color: '#1E293B', lineHeight: 1.4 }}>
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 18, fontWeight: 'bold', color: '#1E293B', marginBottom: 2 }}>{p.name || ''}</div>
        <div style={{ height: 2, backgroundColor: accent, width: 40, marginBottom: 4 }} />
        {p.jobTitle && <div style={{ fontSize: 9, color: '#64748B', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 }}>{p.jobTitle}</div>}
        <div style={{ fontSize: 7.5, color: '#64748B' }}>
          {[p.email, p.phone, p.city].filter(Boolean).join('  \u2022  ')}
        </div>
        <div style={{ fontSize: 7.5, color: '#64748B', marginTop: 1 }}>
          {[p.linkedin, p.github, p.portfolio].filter(Boolean).join('  \u2022  ')}
        </div>
      </div>
      {data.summary && (
        <div style={{ marginBottom: 6 }}>
          <SectionTitle label="Ringkasan Profesional" color="#1E293B" />
          <div style={{ fontSize: 8, lineHeight: 1.4, color: '#1E293B' }}>{data.summary}</div>
        </div>
      )}
      {exps.length > 0 && (
        <div style={{ marginBottom: 6 }}>
          <SectionTitle label="Pengalaman Kerja" color="#1E293B" />
          {exps.map((exp, i) => (
            <div key={i} style={{ marginBottom: 4 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: 8.5 }}>
                <span>{exp.position}</span>
                <span style={{ fontSize: 7, color: '#64748B' }}>{formatPeriod(exp.startDate || exp.start_date, exp.endDate || exp.end_date, exp.isCurrent)}</span>
              </div>
              <div style={{ fontSize: 7.5, color: '#64748B', fontStyle: 'italic', marginBottom: 1 }}>{exp.company}</div>
              {(exp.description || []).map((point, j) => (
                <div key={j} style={{ marginLeft: 8, fontSize: 8, color: '#1E293B' }}>{'\u2022'} {point}</div>
              ))}
            </div>
          ))}
        </div>
      )}
      {edus.length > 0 && (
        <div style={{ marginBottom: 6 }}>
          <SectionTitle label="Pendidikan" color="#1E293B" />
          {edus.map((edu, i) => (
            <div key={i} style={{ marginBottom: 3 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: 8.5 }}>
                <span>{edu.degree}, {edu.field}</span>
                <span style={{ fontSize: 7.5, color: '#64748B' }}>{edu.startYear || edu.start_year} {'\u2013'} {edu.endYear || edu.end_year || 'Sekarang'}</span>
              </div>
              <div style={{ fontSize: 7.5, color: '#64748B' }}>{edu.institution}{edu.gpa ? ` \u2014 IPK: ${edu.gpa}` : ''}</div>
            </div>
          ))}
        </div>
      )}
      {(skills.technical.length > 0 || skills.soft.length > 0) && (
        <div style={{ marginBottom: 6 }}>
          <SectionTitle label="Keahlian" color="#1E293B" />
          <div style={{ display: 'flex', flexWrap: 'wrap', marginLeft: 8 }}>
            {skills.technical.map((s, i) => (
              <div key={`t-${i}`} style={{ flex: '0 0 50%', fontSize: 8, color: '#374151', marginBottom: 1 }}>{'\u2022'} {typeof s === 'string' ? s : s.name}</div>
            ))}
            {skills.soft.map((s, i) => (
              <div key={`s-${i}`} style={{ flex: '0 0 50%', fontSize: 8, color: '#374151', marginBottom: 1 }}>{'\u2022'} {typeof s === 'string' ? s : s.name || s}</div>
            ))}
          </div>
        </div>
      )}
      {projects.length > 0 && (
        <div style={{ marginBottom: 6 }}>
          <SectionTitle label="Proyek" color="#1E293B" />
          {projects.map((proj, i) => (
            <div key={i} style={{ marginBottom: 3 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: 8.5 }}>
                <span>{proj.name}</span>
                {proj.period && <span style={{ fontSize: 7, color: '#64748B' }}>{proj.period}</span>}
              </div>
              {(proj.techStack || proj.tech_stack)?.length > 0 && <div style={{ fontSize: 7, fontStyle: 'italic', color: '#64748B' }}>{(proj.techStack || proj.tech_stack).join(', ')}</div>}
              {proj.description && <div style={{ fontSize: 8, color: '#1E293B' }}>{proj.description}</div>}
            </div>
          ))}
        </div>
      )}
      {certs.length > 0 && (
        <div style={{ marginBottom: 6 }}>
          <SectionTitle label="Sertifikasi" color="#1E293B" />
          {certs.map((c, i) => (
            <div key={i} style={{ fontSize: 8, color: '#1E293B', marginBottom: 1 }}>{'\u2022'} {c.name}{c.issuer ? ` — ${c.issuer}` : ''}</div>
          ))}
        </div>
      )}
      {langs.length > 0 && (
        <div style={{ marginBottom: 6 }}>
          <SectionTitle label="Bahasa" color="#1E293B" />
          <div style={{ fontSize: 8, color: '#1E293B' }}>{langs.map(l => `${l.name}${l.level ? ` — ${l.level}` : ''}`).join('  \u2022  ')}</div>
        </div>
      )}
    </div>
  )
}

// ── 3. Executive Serif Layout (executive-serif-v1) ──────────────────────
function ExecutiveSerifLayout({ data, p }) {
  const exps = data.experiences || []
  const edus = data.educations || []
  const skills = getSkillsObj(data)
  const projects = data.projects || []
  const certs = data.certifications || []
  const langs = data.languages || []
  return (
    <div style={{ fontFamily: 'Georgia, serif', fontSize: 8.5, color: '#000000', lineHeight: 1.4 }}>
      <div style={{ textAlign: 'center', marginBottom: 12 }}>
        <div style={{ fontSize: 18, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 2 }}>{p.name || ''}</div>
        {p.jobTitle && <div style={{ fontSize: 9, color: '#333', letterSpacing: 1, textTransform: 'uppercase', fontStyle: 'italic', marginBottom: 4 }}>{p.jobTitle}</div>}
        <div style={{ fontSize: 7.5, color: '#444' }}>
          {[p.email, p.phone, p.city, p.linkedin, p.github, p.portfolio].filter(Boolean).join('   \u2022   ')}
        </div>
      </div>
      {data.summary && (
        <div style={{ marginBottom: 6 }}>
          <SectionTitle label="Ringkasan Profesional" color="#000" />
          <div style={{ fontSize: 8, lineHeight: 1.4, color: '#111', textAlign: 'justify' }}>{data.summary}</div>
        </div>
      )}
      {exps.length > 0 && (
        <div style={{ marginBottom: 6 }}>
          <SectionTitle label="Pengalaman Kerja" color="#000" />
          {exps.map((exp, i) => (
            <div key={i} style={{ marginBottom: 5 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: 8.5 }}>
                <span>{exp.position}</span>
                <span style={{ fontSize: 7.5, fontStyle: 'italic' }}>{formatPeriod(exp.startDate || exp.start_date, exp.endDate || exp.end_date, exp.isCurrent)}</span>
              </div>
              <div style={{ fontSize: 7.5, color: '#222', fontStyle: 'italic', marginBottom: 1 }}>{exp.company}</div>
              {(exp.description || []).map((point, j) => (
                <div key={j} style={{ marginLeft: 8, fontSize: 8, color: '#111' }}>{'\u2022'} {point}</div>
              ))}
            </div>
          ))}
        </div>
      )}
      {edus.length > 0 && (
        <div style={{ marginBottom: 6 }}>
          <SectionTitle label="Pendidikan" color="#000" />
          {edus.map((edu, i) => (
            <div key={i} style={{ marginBottom: 3 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: 8.5 }}>
                <span>{edu.degree}, {edu.field}</span>
                <span style={{ fontSize: 7.5, fontStyle: 'italic' }}>{edu.startYear || edu.start_year} {'\u2013'} {edu.endYear || edu.end_year || 'Sekarang'}</span>
              </div>
              <div style={{ fontSize: 7.5, color: '#222' }}>{edu.institution}{edu.gpa ? ` \u2014 IPK: ${edu.gpa}` : ''}</div>
            </div>
          ))}
        </div>
      )}
      {skills.technical.length > 0 && (
        <div style={{ marginBottom: 6 }}>
          <SectionTitle label="Keahlian" color="#000" />
          <div style={{ display: 'flex', flexWrap: 'wrap', marginLeft: 8 }}>
            {skills.technical.map((s, i) => (
              <div key={`t-${i}`} style={{ flex: '0 0 50%', fontSize: 8, color: '#374151', marginBottom: 1 }}>{'\u2022'} {typeof s === 'string' ? s : s.name}</div>
            ))}
            {skills.soft.map((s, i) => (
              <div key={`s-${i}`} style={{ flex: '0 0 50%', fontSize: 8, color: '#374151', marginBottom: 1 }}>{'\u2022'} {typeof s === 'string' ? s : s.name || s}</div>
            ))}
          </div>
        </div>
      )}
      {projects.length > 0 && (
        <div style={{ marginBottom: 6 }}>
          <SectionTitle label="Proyek" color="#000" />
          {projects.map((proj, i) => (
            <div key={i} style={{ marginBottom: 3 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: 8.5 }}>
                <span>{proj.name}</span>
                {proj.period && <span style={{ fontSize: 7, color: '#555' }}>{proj.period}</span>}
              </div>
              {(proj.techStack || proj.tech_stack)?.length > 0 && <div style={{ fontSize: 7, fontStyle: 'italic', color: '#555' }}>{(proj.techStack || proj.tech_stack).join(', ')}</div>}
              {proj.description && <div style={{ fontSize: 8, color: '#333' }}>{proj.description}</div>}
            </div>
          ))}
        </div>
      )}
      {certs.length > 0 && (
        <div style={{ marginBottom: 6 }}>
          <SectionTitle label="Sertifikasi" color="#000" />
          {certs.map((c, i) => (
            <div key={i} style={{ fontSize: 8, color: '#333', marginBottom: 1 }}>{'\u2022'} {c.name}{c.issuer ? ` \u2014 ${c.issuer}` : ''}</div>
          ))}
        </div>
      )}
      {langs.length > 0 && (
        <div style={{ marginBottom: 6 }}>
          <SectionTitle label="Bahasa" color="#000" />
          <div style={{ fontSize: 8, color: '#333' }}>{langs.map(l => `${l.name}${l.level ? ` \u2014 ${l.level}` : ''}`).join('  \u2022  ')}</div>
        </div>
       )}
    </div>
  )
}

// ── 4. Compact One Page Layout (compact-onepage-v1) ──────────────────────
function CompactOnePageLayout({ data, p }) {
  const exps = data.experiences || []
  const edus = data.educations || []
  const skills = getSkillsObj(data)
  const projects = data.projects || []
  const certs = data.certifications || []
  const langs = data.languages || []
  return (
    <div style={{ fontFamily: 'Helvetica, Arial, sans-serif', fontSize: 7.5, color: '#111', lineHeight: 1.3 }}>
      <div style={{ marginBottom: 6, borderBottom: '1.5px solid #111', paddingBottom: 4 }}>
        <div style={{ fontSize: 14, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 1 }}>{p.name || ''}</div>
        {p.jobTitle && <div style={{ fontSize: 8, color: '#444', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 2 }}>{p.jobTitle}</div>}
        <div style={{ fontSize: 7, color: '#555', display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {[p.email, p.phone, p.city, p.linkedin, p.github, p.portfolio].filter(Boolean).map((c, i) => (
            <span key={i}>{c}</span>
          ))}
        </div>
      </div>
      {data.summary && (
        <div style={{ marginBottom: 4 }}>
          <div style={{ fontSize: 8, fontWeight: 'bold', textTransform: 'uppercase', borderBottom: '0.8px solid #111', paddingBottom: 1, marginTop: 6, marginBottom: 2 }}>Ringkasan Profesional</div>
          <div style={{ fontSize: 7.5, color: '#222' }}>{data.summary}</div>
        </div>
      )}
      {exps.length > 0 && (
        <div style={{ marginBottom: 4 }}>
          <div style={{ fontSize: 8, fontWeight: 'bold', textTransform: 'uppercase', borderBottom: '0.8px solid #111', paddingBottom: 1, marginTop: 6, marginBottom: 2 }}>Pengalaman Kerja</div>
          {exps.map((exp, i) => (
            <div key={i} style={{ marginBottom: 3 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: 8 }}>
                <span>{exp.position}</span>
                <span style={{ fontSize: 7, color: '#555' }}>{formatPeriod(exp.startDate || exp.start_date, exp.endDate || exp.end_date, exp.isCurrent)}</span>
              </div>
              <div style={{ fontSize: 7.5, color: '#444', fontStyle: 'italic' }}>{exp.company}</div>
              {(exp.description || []).map((point, j) => (
                <div key={j} style={{ marginLeft: 6, fontSize: 7.5, color: '#222' }}>{'\u2022'} {point}</div>
              ))}
            </div>
          ))}
        </div>
      )}
      {edus.length > 0 && (
        <div style={{ marginBottom: 4 }}>
          <div style={{ fontSize: 8, fontWeight: 'bold', textTransform: 'uppercase', borderBottom: '0.8px solid #111', paddingBottom: 1, marginTop: 6, marginBottom: 2 }}>Pendidikan</div>
          {edus.map((edu, i) => (
            <div key={i} style={{ marginBottom: 2 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: 7.5 }}>
                <span>{edu.degree}, {edu.field}</span>
                <span style={{ fontSize: 7, color: '#555' }}>{edu.startYear || edu.start_year} {'\u2013'} {edu.endYear || edu.end_year || 'Sekarang'}</span>
              </div>
              <div style={{ fontSize: 7.5, color: '#444' }}>{edu.institution}{edu.gpa ? ` — IPK: ${edu.gpa}` : ''}</div>
            </div>
          ))}
        </div>
      )}
      {(skills.technical.length > 0 || skills.soft.length > 0) && (
        <div style={{ marginBottom: 4 }}>
          <div style={{ fontSize: 8, fontWeight: 'bold', textTransform: 'uppercase', borderBottom: '0.8px solid #111', paddingBottom: 1, marginTop: 6, marginBottom: 2 }}>Keahlian</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', marginLeft: 6 }}>
            {skills.technical.map((s, i) => (
              <div key={`t-${i}`} style={{ flex: '0 0 50%', fontSize: 7, color: '#374151', marginBottom: 1 }}>{'\u2022'} {typeof s === 'string' ? s : s.name}</div>
            ))}
            {skills.soft.map((s, i) => (
              <div key={`s-${i}`} style={{ flex: '0 0 50%', fontSize: 7, color: '#374151', marginBottom: 1 }}>{'\u2022'} {typeof s === 'string' ? s : s.name || s}</div>
            ))}
          </div>
        </div>
      )}
      {projects.length > 0 && (
        <div style={{ marginBottom: 4 }}>
          <div style={{ fontSize: 8, fontWeight: 'bold', textTransform: 'uppercase', borderBottom: '0.8px solid #111', paddingBottom: 1, marginTop: 6, marginBottom: 2 }}>Proyek</div>
          {projects.map((proj, i) => (
            <div key={i} style={{ marginBottom: 3 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: 7.5 }}>
                <span>{proj.name}</span>
                {proj.period && <span style={{ fontSize: 7, color: '#555' }}>{proj.period}</span>}
              </div>
              {(proj.techStack || proj.tech_stack)?.length > 0 && <div style={{ fontSize: 7, fontStyle: 'italic', color: '#555' }}>{(proj.techStack || proj.tech_stack).join(', ')}</div>}
              {proj.description && <div style={{ fontSize: 7.5, color: '#222' }}>{proj.description}</div>}
            </div>
          ))}
        </div>
      )}
      {certs.length > 0 && (
        <div style={{ marginBottom: 4 }}>
          <div style={{ fontSize: 8, fontWeight: 'bold', textTransform: 'uppercase', borderBottom: '0.8px solid #111', paddingBottom: 1, marginTop: 6, marginBottom: 2 }}>Sertifikasi</div>
          {certs.map((c, i) => (
            <div key={i} style={{ fontSize: 7.5, color: '#222', marginBottom: 1 }}>{'\u2022'} {c.name}{c.issuer ? ` — ${c.issuer}` : ''}</div>
          ))}
        </div>
      )}
      {langs.length > 0 && (
        <div style={{ marginBottom: 4 }}>
          <div style={{ fontSize: 8, fontWeight: 'bold', textTransform: 'uppercase', borderBottom: '0.8px solid #111', paddingBottom: 1, marginTop: 6, marginBottom: 2 }}>Bahasa</div>
          <div style={{ fontSize: 7.5, color: '#222' }}>{langs.map(l => `${l.name}${l.level ? ` — ${l.level}` : ''}`).join('  \u2022  ')}</div>
        </div>
      )}
    </div>
  )
}

// ── 5. Sidebar Slim Layout (sidebar-slim-v1) ──────────────────────────────
function SidebarSlimLayout({ data, p }) {
  const exps = data.experiences || []
  const edus = data.educations || []
  const skills = getSkillsObj(data)
  const langs = data.languages || []
  const certs = data.certifications || []
  const projects = data.projects || []
  return (
    <div style={{ fontFamily: 'Helvetica, Arial, sans-serif', fontSize: 8, color: '#1E293B', display: 'flex', minHeight: '275mm', margin: '-40px' }}>
      {/* Sidebar */}
      <div style={{ width: '28%', backgroundColor: '#F4F4F5', padding: 16, borderRight: '1px solid #D4D4D8' }}>
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 8, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 0.5, borderBottom: '1px solid #D4D4D8', paddingBottom: 2, marginBottom: 4, color: '#27272A' }}>Kontak</div>
          {p.email && <div style={{ fontSize: 7.5, color: '#27272A', marginBottom: 2 }}><strong>Email:</strong><br />{p.email}</div>}
          {p.phone && <div style={{ fontSize: 7.5, color: '#27272A', marginBottom: 2 }}><strong>Telp:</strong><br />{p.phone}</div>}
          {p.city && <div style={{ fontSize: 7.5, color: '#27272A', marginBottom: 2 }}><strong>Lokasi:</strong><br />{p.city}</div>}
        </div>
        {(skills.technical.length > 0 || skills.soft.length > 0) && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 8, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 0.5, borderBottom: '1px solid #D4D4D8', paddingBottom: 2, marginBottom: 4, color: '#27272A' }}>Keahlian</div>
            <div style={{ display: 'flex', flexWrap: 'wrap' }}>
              {skills.technical.map((s, i) => (
                <div key={`t-${i}`} style={{ flex: '0 0 50%', fontSize: 7, color: '#27272A', marginBottom: 1 }}>{'\u2022'} {typeof s === 'string' ? s : s.name}</div>
              ))}
              {skills.soft.map((s, i) => (
                <div key={`s-${i}`} style={{ flex: '0 0 50%', fontSize: 7, color: '#27272A', marginBottom: 1 }}>{'\u2022'} {typeof s === 'string' ? s : s.name || s}</div>
              ))}
            </div>
          </div>
        )}
        {certs.length > 0 && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 8, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 0.5, borderBottom: '1px solid #D4D4D8', paddingBottom: 2, marginBottom: 4, color: '#27272A' }}>Sertifikasi</div>
            {certs.map((c, i) => (
              <div key={i} style={{ fontSize: 7.5, color: '#27272A', marginBottom: 1 }}>{'\u2022'} {c.name}{c.issuer ? ` — ${c.issuer}` : ''}</div>
            ))}
          </div>
        )}
        {langs.length > 0 && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 8, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 0.5, borderBottom: '1px solid #D4D4D8', paddingBottom: 2, marginBottom: 4, color: '#27272A' }}>Bahasa</div>
            {langs.map((l, i) => (
              <div key={i} style={{ fontSize: 7.5, color: '#27272A' }}>{'\u2022'} {l.name}{l.level ? ` (${l.level})` : ''}</div>
            ))}
          </div>
        )}
      </div>
      {/* Main */}
      <div style={{ flex: 1, padding: 20, backgroundColor: '#FFFFFF' }}>
        <div style={{ fontSize: 18, fontWeight: 'bold', color: '#09090B', marginBottom: 2 }}>{p.name || ''}</div>
        {p.jobTitle && <div style={{ fontSize: 9.5, color: '#52525B', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>{p.jobTitle}</div>}
        
        {data.summary && (
          <div style={{ marginBottom: 6 }}>
            <SectionTitle label="Ringkasan Profesional" color="#09090B" />
            <div style={{ fontSize: 8, lineHeight: 1.4, color: '#27272A' }}>{data.summary}</div>
          </div>
        )}
        {exps.length > 0 && (
          <div style={{ marginBottom: 6 }}>
            <SectionTitle label="Pengalaman Kerja" color="#09090B" />
            {exps.map((exp, i) => (
              <div key={i} style={{ marginBottom: 4 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: 8.5 }}>
                  <span>{exp.position}</span>
                  <span style={{ fontSize: 7, color: '#71717A' }}>{formatPeriod(exp.startDate || exp.start_date, exp.endDate || exp.end_date, exp.isCurrent)}</span>
                </div>
                <div style={{ fontSize: 7.5, color: '#52525B', fontStyle: 'italic', marginBottom: 1 }}>{exp.company}</div>
                {(exp.description || []).map((point, j) => (
                  <div key={j} style={{ marginLeft: 8, fontSize: 8, color: '#27272A' }}>{'\u2022'} {point}</div>
                ))}
              </div>
            ))}
          </div>
        )}
        {edus.length > 0 && (
          <div style={{ marginBottom: 6 }}>
            <SectionTitle label="Pendidikan" color="#09090B" />
            {edus.map((edu, i) => (
              <div key={i} style={{ marginBottom: 3 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: 8.5 }}>
                  <span>{edu.degree}, {edu.field}</span>
                  <span style={{ fontSize: 7, color: '#71717A' }}>{edu.startYear || edu.start_year} {'\u2013'} {edu.endYear || edu.end_year || 'Sekarang'}</span>
                </div>
                <div style={{ fontSize: 7.5, color: '#52525B' }}>{edu.institution}{edu.gpa ? ` \u2014 IPK: ${edu.gpa}` : ''}</div>
              </div>
            ))}
          </div>
        )}
        {projects.length > 0 && (
          <div style={{ marginBottom: 6 }}>
            <SectionTitle label="Proyek" color="#09090B" />
            {projects.map((proj, i) => (
              <div key={i} style={{ marginBottom: 3 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: 8.5 }}>
                  <span>{proj.name}</span>
                  {proj.period && <span style={{ fontSize: 7, color: '#71717A' }}>{proj.period}</span>}
                </div>
                {(proj.techStack || proj.tech_stack)?.length > 0 && <div style={{ fontSize: 7, fontStyle: 'italic', color: '#71717A' }}>{(proj.techStack || proj.tech_stack).join(', ')}</div>}
                {proj.description && <div style={{ fontSize: 8, color: '#27272A' }}>{proj.description}</div>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ── 6. Academic Minimal Layout (academic-minimal-v1) ──────────────────────
function AcademicMinimalLayout({ data, p }) {
  const exps = data.experiences || []
  const edus = data.educations || []
  const pubs = data.publications || []
  const skills = getSkillsObj(data)
  const projects = data.projects || []
  const certs = data.certifications || []
  const langs = data.languages || []
  return (
    <div style={{ fontFamily: 'Georgia, serif', fontSize: 8.5, color: '#000000', lineHeight: 1.4 }}>
      <div style={{ textAlign: 'center', marginBottom: 12 }}>
        <div style={{ fontSize: 18, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 }}>{p.name || ''}</div>
        {p.jobTitle && <div style={{ fontSize: 9, color: '#333', letterSpacing: 1, textTransform: 'uppercase', fontStyle: 'italic', marginBottom: 4 }}>{p.jobTitle}</div>}
        <div style={{ fontSize: 7.5, color: '#444' }}>
          {[p.email, p.phone, p.city, p.linkedin, p.github, p.portfolio].filter(Boolean).join('   \u2022   ')}
        </div>
      </div>
      {data.summary && (
        <div style={{ marginBottom: 6 }}>
          <SectionTitle label="Ringkasan Profesional" color="#000" />
          <div style={{ fontSize: 8, lineHeight: 1.4, color: '#111', textAlign: 'justify' }}>{data.summary}</div>
        </div>
      )}
      {edus.length > 0 && (
        <div style={{ marginBottom: 6 }}>
          <SectionTitle label="Pendidikan" color="#000" />
          {edus.map((edu, i) => (
            <div key={i} style={{ marginBottom: 3 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: 8.5 }}>
                <span>{edu.degree}, {edu.field}</span>
                <span style={{ fontSize: 7.5, fontStyle: 'italic' }}>{edu.startYear || edu.start_year} {'\u2013'} {edu.endYear || edu.end_year || 'Sekarang'}</span>
              </div>
              <div style={{ fontSize: 7.5, color: '#222' }}>{edu.institution}{edu.gpa ? ` \u2014 IPK: ${edu.gpa}` : ''}</div>
            </div>
          ))}
        </div>
      )}
      {exps.length > 0 && (
        <div style={{ marginBottom: 6 }}>
          <SectionTitle label="Pengalaman Akademik & Kerja" color="#000" />
          {exps.map((exp, i) => (
            <div key={i} style={{ marginBottom: 4 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: 8.5 }}>
                <span>{exp.position}</span>
                <span style={{ fontSize: 7.5, fontStyle: 'italic' }}>{formatPeriod(exp.startDate || exp.start_date, exp.endDate || exp.end_date, exp.isCurrent)}</span>
              </div>
              <div style={{ fontSize: 7.5, color: '#222', fontStyle: 'italic', marginBottom: 1 }}>{exp.company}</div>
            </div>
          ))}
        </div>
      )}
      {pubs.length > 0 && (
        <div style={{ marginBottom: 6 }}>
          <SectionTitle label="Publikasi" color="#000" />
          {pubs.map((pub, i) => (
            <div key={i} style={{ fontSize: 8, color: '#111', marginBottom: 3 }}>
              {pub.authors ? `${pub.authors}. ` : ''}
              {pub.year ? `(${pub.year}). ` : ''}
              {pub.title ? `"${pub.title}". ` : ''}
              {pub.venue ? `${pub.venue}.` : ''}
            </div>
          ))}
        </div>
      )}
      {(skills.technical.length > 0 || skills.soft.length > 0) && (
        <div style={{ marginBottom: 6 }}>
          <SectionTitle label="Keahlian" color="#000" />
          <div style={{ display: 'flex', flexWrap: 'wrap', marginLeft: 8 }}>
            {skills.technical.map((s, i) => (
              <div key={`t-${i}`} style={{ flex: '0 0 50%', fontSize: 8, color: '#374151', marginBottom: 1 }}>{'\u2022'} {typeof s === 'string' ? s : s.name}</div>
            ))}
            {skills.soft.map((s, i) => (
              <div key={`s-${i}`} style={{ flex: '0 0 50%', fontSize: 8, color: '#374151', marginBottom: 1 }}>{'\u2022'} {typeof s === 'string' ? s : s.name || s}</div>
            ))}
          </div>
        </div>
      )}
      {projects.length > 0 && (
        <div style={{ marginBottom: 6 }}>
          <SectionTitle label="Proyek" color="#000" />
          {projects.map((proj, i) => (
            <div key={i} style={{ marginBottom: 3 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: 8.5 }}>
                <span>{proj.name}</span>
                {proj.period && <span style={{ fontSize: 7, color: '#444' }}>{proj.period}</span>}
              </div>
              {(proj.techStack || proj.tech_stack)?.length > 0 && <div style={{ fontSize: 7, fontStyle: 'italic', color: '#444' }}>{(proj.techStack || proj.tech_stack).join(', ')}</div>}
              {proj.description && <div style={{ fontSize: 8, color: '#111' }}>{proj.description}</div>}
            </div>
          ))}
        </div>
      )}
      {certs.length > 0 && (
        <div style={{ marginBottom: 6 }}>
          <SectionTitle label="Sertifikasi" color="#000" />
          {certs.map((c, i) => (
            <div key={i} style={{ fontSize: 8, color: '#111', marginBottom: 1 }}>{'\u2022'} {c.name}{c.issuer ? ` \u2014 ${c.issuer}` : ''}</div>
          ))}
        </div>
      )}
      {langs.length > 0 && (
        <div style={{ marginBottom: 6 }}>
          <SectionTitle label="Bahasa" color="#000" />
          <div style={{ fontSize: 8, color: '#111' }}>{langs.map(l => `${l.name}${l.level ? ` \u2014 ${l.level}` : ''}`).join('  \u2022  ')}</div>
        </div>
      )}
    </div>
  )
}

// ── 7. Technical Minimal Layout (technical-minimal-v1) ────────────────────
function TechnicalMinimalLayout({ data, p }) {
  const exps = data.experiences || []
  const edus = data.educations || []
  const skills = getSkillsObj(data)
  const projects = data.projects || []
  const certs = data.certifications || []
  const langs = data.languages || []
  return (
    <div style={{ fontFamily: 'Helvetica, Arial, sans-serif', fontSize: 8.5, color: '#111827', lineHeight: 1.4 }}>
      <div style={{ marginBottom: 10, borderBottom: '1px solid #E5E7EB', paddingBottom: 6 }}>
        <div style={{ fontSize: 18, fontWeight: 'bold', color: '#111827', marginBottom: 2 }}>{p.name || ''}</div>
        {p.jobTitle && <div style={{ fontSize: 9, color: '#4B5563', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 }}>{p.jobTitle}</div>}
        <div style={{ fontSize: 7.5, color: '#4B5563', display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {[p.email, p.phone, p.city, p.linkedin, p.github, p.portfolio].filter(Boolean).map((c, i) => (
            <span key={i}>{c}</span>
          ))}
        </div>
      </div>
      {exps.length > 0 && (
        <div style={{ marginBottom: 6 }}>
          <SectionTitle label="Pengalaman Kerja" color="#111827" />
          {exps.map((exp, i) => (
            <div key={i} style={{ marginBottom: 4 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: 8.5 }}>
                <span>{exp.position}</span>
                <span style={{ fontSize: 7, color: '#6B7280' }}>{formatPeriod(exp.startDate || exp.start_date, exp.endDate || exp.end_date, exp.isCurrent)}</span>
              </div>
              <div style={{ fontSize: 7.5, color: '#4B5563', fontStyle: 'italic', marginBottom: 1 }}>{exp.company}</div>
              {(exp.description || []).map((point, j) => (
                <div key={j} style={{ marginLeft: 8, fontSize: 8, color: '#374151' }}>{'\u2022'} {point}</div>
              ))}
            </div>
          ))}
        </div>
      )}
      {projects.length > 0 && (
        <div style={{ marginBottom: 6 }}>
          <SectionTitle label="Proyek" color="#111827" />
          {projects.map((proj, i) => (
            <div key={i} style={{ marginBottom: 4 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: 8.5 }}>
                <span>{proj.name}</span>
                {proj.period && <span style={{ fontSize: 7, color: '#6B7280' }}>{proj.period}</span>}
              </div>
              {(proj.techStack || proj.tech_stack)?.length > 0 && <div style={{ fontSize: 7.5, color: '#6B7280', fontStyle: 'italic' }}>{(proj.techStack || proj.tech_stack).join(', ')}</div>}
              {proj.description && <div style={{ fontSize: 8, color: '#374151' }}>{proj.description}</div>}
            </div>
          ))}
        </div>
      )}

      {edus.length > 0 && (
        <div style={{ marginBottom: 6 }}>
          <SectionTitle label="Pendidikan" color="#111827" />
          {edus.map((edu, i) => (
            <div key={i} style={{ marginBottom: 3 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: 8.5 }}>
                <span>{edu.degree}, {edu.field}</span>
                <span style={{ fontSize: 7, color: '#6B7280' }}>{edu.startYear || edu.start_year} {'\u2013'} {edu.endYear || edu.end_year || 'Sekarang'}</span>
              </div>
              <div style={{ fontSize: 7.5, color: '#4B5563' }}>{edu.institution}{edu.gpa ? ` — IPK: ${edu.gpa}` : ''}</div>
            </div>
          ))}
        </div>
      )}
      {(skills.technical.length > 0 || skills.soft.length > 0) && (
        <div style={{ marginBottom: 6 }}>
          <SectionTitle label="Keahlian" color="#111827" />
          <div style={{ display: 'flex', flexWrap: 'wrap', marginLeft: 8 }}>
            {skills.technical.map((s, i) => (
              <div key={`t-${i}`} style={{ flex: '0 0 50%', fontSize: 8, color: '#374151', marginBottom: 1 }}>{'\u2022'} {typeof s === 'string' ? s : s.name}</div>
            ))}
            {skills.soft.map((s, i) => (
              <div key={`s-${i}`} style={{ flex: '0 0 50%', fontSize: 8, color: '#374151', marginBottom: 1 }}>{'\u2022'} {typeof s === 'string' ? s : s.name || s}</div>
            ))}
          </div>
        </div>
      )}
      {certs.length > 0 && (
        <div style={{ marginBottom: 4 }}>
          <div style={{ fontSize: 8, fontWeight: 'bold', textTransform: 'uppercase', borderBottom: '0.8px solid #111', paddingBottom: 1, marginTop: 6, marginBottom: 2 }}>Sertifikasi</div>
          {certs.map((c, i) => (
            <div key={i} style={{ fontSize: 7, color: '#222', marginBottom: 1 }}>{'\u2022'} {c.name}{c.issuer ? ` — ${c.issuer}` : ''}</div>
          ))}
        </div>
      )}
      {langs.length > 0 && (
        <div style={{ marginBottom: 4 }}>
          <div style={{ fontSize: 8, fontWeight: 'bold', textTransform: 'uppercase', borderBottom: '0.8px solid #111', paddingBottom: 1, marginTop: 6, marginBottom: 2 }}>Bahasa</div>
          <div style={{ fontSize: 7, color: '#222' }}>{langs.map(l => `${l.name}${l.level ? ` — ${l.level}` : ''}`).join('  \u2022  ')}</div>
        </div>
      )}
    </div>
  )
}

// ── 8. Fresh Graduate Minimal Layout (fresh-graduate-minimal-v1) ──────────
function FreshGraduateMinimalLayout({ data, p }) {
  const exps = data.experiences || []
  const edus = data.educations || []
  const skills = getSkillsObj(data)
  const projects = data.projects || []
  const certs = data.certifications || []
  const langs = data.languages || []
  return (
    <div style={{ fontFamily: 'Helvetica, Arial, sans-serif', fontSize: 8.5, color: '#1F2937', lineHeight: 1.4 }}>
      <div style={{ marginBottom: 10, borderBottom: '1px solid #E5E7EB', paddingBottom: 6 }}>
        <div style={{ fontSize: 18, fontWeight: 'bold', color: '#111827', marginBottom: 2 }}>{p.name || ''}</div>
        {p.jobTitle && <div style={{ fontSize: 9, color: '#4B5563', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 }}>{p.jobTitle}</div>}
        <div style={{ fontSize: 7.5, color: '#4B5563', display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {[p.email, p.phone, p.city, p.linkedin, p.github, p.portfolio].filter(Boolean).map((c, i) => (
            <span key={i}>{c}</span>
          ))}
        </div>
      </div>
      {edus.length > 0 && (
        <div style={{ marginBottom: 6 }}>
          <SectionTitle label="Pendidikan" color="#111827" />
          {edus.map((edu, i) => (
            <div key={i} style={{ marginBottom: 3 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: 8.5 }}>
                <span>{edu.degree}, {edu.field}</span>
                <span style={{ fontSize: 7, color: '#6B7280' }}>{edu.startYear || edu.start_year} {'\u2013'} {edu.endYear || edu.end_year || 'Sekarang'}</span>
              </div>
              <div style={{ fontSize: 7.5, color: '#4B5563' }}>{edu.institution}{edu.gpa ? ` — IPK: ${edu.gpa}` : ''}</div>
            </div>
          ))}
        </div>
      )}
      {projects.length > 0 && (
        <div style={{ marginBottom: 6 }}>
          <SectionTitle label="Proyek Akademik & Portofolio" color="#111827" />
          {projects.map((proj, i) => (
            <div key={i} style={{ marginBottom: 4 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: 8.5 }}>
                <span>{proj.name}</span>
                {proj.period && <span style={{ fontSize: 7, color: '#6B7280' }}>{proj.period}</span>}
              </div>
              {proj.description && <div style={{ fontSize: 8, color: '#374151' }}>{proj.description}</div>}
            </div>
          ))}
        </div>
      )}
      {(data.organizations?.length > 0 || exps.length > 0) && (
        <div style={{ marginBottom: 6 }}>
          <SectionTitle label="Pengalaman Organisasi & Magang" color="#111827" />
          {(data.organizations || []).map((org, i) => (
            <div key={`org-${i}`} style={{ marginBottom: 3 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: 8.5 }}>
                <span>{org.role}{org.name ? ` — ${org.name}` : ''}</span>
                {org.period && <span style={{ fontSize: 7, color: '#6B7280' }}>{org.period}</span>}
              </div>
              {org.description && <div style={{ fontSize: 8, color: '#374151' }}>{org.description}</div>}
            </div>
          ))}
          {exps.map((exp, i) => (
            <div key={`exp-${i}`} style={{ marginBottom: 3 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: 8.5 }}>
                <span>{exp.position}{exp.company ? ` — ${exp.company}` : ''}</span>
                <span style={{ fontSize: 7, color: '#6B7280' }}>{formatPeriod(exp.startDate || exp.start_date, exp.endDate || exp.end_date, exp.isCurrent)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
      {(skills.technical.length > 0 || skills.soft.length > 0) && (
        <div style={{ marginBottom: 6 }}>
          <SectionTitle label="Keahlian" color="#111827" />
          <div style={{ display: 'flex', flexWrap: 'wrap', marginLeft: 8 }}>
            {skills.technical.map((s, i) => (
              <div key={`t-${i}`} style={{ flex: '0 0 50%', fontSize: 8, color: '#374151', marginBottom: 1 }}>{'\u2022'} {typeof s === 'string' ? s : s.name}</div>
            ))}
            {skills.soft.map((s, i) => (
              <div key={`s-${i}`} style={{ flex: '0 0 50%', fontSize: 8, color: '#374151', marginBottom: 1 }}>{'\u2022'} {typeof s === 'string' ? s : s.name || s}</div>
            ))}
          </div>
        </div>
      )}
      {certs.length > 0 && (
        <div style={{ marginBottom: 6 }}>
          <SectionTitle label="Sertifikasi" color="#111827" />
          {certs.map((c, i) => (
            <div key={i} style={{ fontSize: 8, color: '#374151', marginBottom: 1 }}>{'\u2022'} {c.name}{c.issuer ? ` — ${c.issuer}` : ''}</div>
          ))}
        </div>
      )}
      {langs.length > 0 && (
        <div style={{ marginBottom: 6 }}>
          <SectionTitle label="Bahasa" color="#111827" />
          <div style={{ fontSize: 8, color: '#374151' }}>{langs.map(l => `${l.name}${l.level ? ` — ${l.level}` : ''}`).join('  \u2022  ')}</div>
        </div>
      )}
    </div>
  )
}
function TimelineMinimalLayout({ data, p }) {
  const exps = data.experiences || []
  const edus = data.educations || []
  const skills = getSkillsObj(data)
  const projects = data.projects || []
  const certs = data.certifications || []
  const langs = data.languages || []
  return (
    <div style={{ fontFamily: 'Helvetica, Arial, sans-serif', fontSize: 8.5, color: '#1F2937', lineHeight: 1.4 }}>
      <div style={{ marginBottom: 10, borderBottom: '1px solid #E5E7EB', paddingBottom: 6 }}>
        <div style={{ fontSize: 18, fontWeight: 'bold', color: '#111827', marginBottom: 2 }}>{p.name || ''}</div>
        {p.jobTitle && <div style={{ fontSize: 9, color: '#4B5563', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 }}>{p.jobTitle}</div>}
        <div style={{ fontSize: 7.5, color: '#4B5563', display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {[p.email, p.phone, p.city].filter(Boolean).map((c, i) => (
            <span key={i}>{c}</span>
          ))}
        </div>
      </div>
      {exps.length > 0 && (
        <div style={{ marginBottom: 6 }}>
          <SectionTitle label="Pengalaman Kerja" color="#111827" />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {exps.map((exp, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 6 }}>
                <div style={{ width: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#111827', marginTop: 4 }} />
                  {i < exps.length - 1 && <div style={{ width: 1, flex: 1, backgroundColor: '#D1D5DB' }} />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: 8.5 }}>
                    <span>{exp.position}</span>
                    <span style={{ fontSize: 7, color: '#6B7280' }}>{formatPeriod(exp.startDate || exp.start_date, exp.endDate || exp.end_date, exp.isCurrent)}</span>
                  </div>
                  <div style={{ fontSize: 7.5, color: '#4B5563', fontStyle: 'italic' }}>{exp.company}</div>
                  {(exp.description || []).map((point, j) => (
                    <div key={j} style={{ fontSize: 8, color: '#374151' }}>{'\u2022'} {point}</div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {edus.length > 0 && (
        <div style={{ marginBottom: 6 }}>
          <SectionTitle label="Pendidikan" color="#111827" />
          {edus.map((edu, i) => (
            <div key={i} style={{ marginBottom: 3 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: 8.5 }}>
                <span>{edu.degree}, {edu.field}</span>
                <span style={{ fontSize: 7, color: '#6B7280' }}>{edu.startYear || edu.start_year} {'\u2013'} {edu.endYear || edu.end_year || 'Sekarang'}</span>
              </div>
              <div style={{ fontSize: 7.5, color: '#4B5563' }}>{edu.institution}{edu.gpa ? ` — IPK: ${edu.gpa}` : ''}</div>
            </div>
          ))}
        </div>
      )}
      {(skills.technical.length > 0 || skills.soft.length > 0) && (
        <div style={{ marginBottom: 6 }}>
          <SectionTitle label="Keahlian" color="#111827" />
          <div style={{ display: 'flex', flexWrap: 'wrap', marginLeft: 8 }}>
            {skills.technical.map((s, i) => (
              <div key={`t-${i}`} style={{ flex: '0 0 50%', fontSize: 8, color: '#374151', marginBottom: 1 }}>{'\u2022'} {typeof s === 'string' ? s : s.name}</div>
            ))}
            {skills.soft.map((s, i) => (
              <div key={`s-${i}`} style={{ flex: '0 0 50%', fontSize: 8, color: '#374151', marginBottom: 1 }}>{'\u2022'} {typeof s === 'string' ? s : s.name || s}</div>
            ))}
          </div>
        </div>
      )}
      {projects.length > 0 && (
        <div style={{ marginBottom: 6 }}>
          <SectionTitle label="Proyek" color="#111827" />
          {projects.map((proj, i) => (
            <div key={i} style={{ marginBottom: 3 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: 8.5 }}>
                <span>{proj.name}</span>
                {proj.period && <span style={{ fontSize: 7, color: '#6B7280' }}>{proj.period}</span>}
              </div>
              {(proj.techStack || proj.tech_stack)?.length > 0 && <div style={{ fontSize: 7, fontStyle: 'italic', color: '#6B7280' }}>{(proj.techStack || proj.tech_stack).join(', ')}</div>}
              {proj.description && <div style={{ fontSize: 8, color: '#374151' }}>{proj.description}</div>}
            </div>
          ))}
        </div>
      )}
      {certs.length > 0 && (
        <div style={{ marginBottom: 6 }}>
          <SectionTitle label="Sertifikasi" color="#111827" />
          {certs.map((c, i) => (
            <div key={i} style={{ fontSize: 8, color: '#374151', marginBottom: 1 }}>{'\u2022'} {c.name}{c.issuer ? ` — ${c.issuer}` : ''}</div>
          ))}
        </div>
      )}
      {langs.length > 0 && (
        <div style={{ marginBottom: 6 }}>
          <SectionTitle label="Bahasa" color="#111827" />
          <div style={{ fontSize: 8, color: '#374151' }}>{langs.map(l => `${l.name}${l.level ? ` — ${l.level}` : ''}`).join('  \u2022  ')}</div>
        </div>
      )}
    </div>
  )
}

// ── 10. Two-Tone Minimal Layout (two-tone-minimal-v1) ─────────────────────
function TwoToneMinimalLayout({ data, p }) {
  const exps = data.experiences || []
  return (
    <div style={{ fontFamily: 'Helvetica, Arial, sans-serif', fontSize: 8.5, color: '#111827', lineHeight: 1.4 }}>
      <div style={{ textAlign: 'center', marginBottom: 12, paddingBottom: 10, borderBottom: '1.5px solid #0F172A' }}>
        <div style={{ fontSize: 18, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 }}>{p.name || ''}</div>
        {p.jobTitle && <div style={{ fontSize: 9, color: '#6B7280', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 6 }}>{p.jobTitle}</div>}
        <div style={{ fontSize: 7.5, color: '#6B7280' }}>
          {[p.email, p.phone, p.city, p.linkedin, p.github, p.portfolio].filter(Boolean).join('  \u2022  ')}
        </div>
      </div>
      {data.summary && (
        <div style={{ marginBottom: 6 }}>
          <div style={{ fontSize: 9, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1, borderBottom: '1px solid #E5E7EB', paddingBottom: 2, marginTop: 12, marginBottom: 5 }}>Ringkasan Profesional</div>
          <div style={{ fontSize: 8, lineHeight: 1.4 }}>{data.summary}</div>
        </div>
      )}
      {exps.length > 0 && (
        <div style={{ marginBottom: 6 }}>
          <div style={{ fontSize: 9, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1, borderBottom: '1px solid #E5E7EB', paddingBottom: 2, marginTop: 12, marginBottom: 5 }}>Pengalaman Kerja</div>
          {exps.map((exp, i) => (
            <div key={i} style={{ marginBottom: 5 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: 8.5 }}>
                <span>{exp.position}</span>
                <span style={{ fontSize: 7, color: '#6B7280' }}>{formatPeriod(exp.startDate || exp.start_date, exp.endDate || exp.end_date, exp.isCurrent)}</span>
              </div>
              <div style={{ fontSize: 7.5, color: '#6B7280', fontStyle: 'italic' }}>{exp.company}</div>
              {(exp.description || []).map((point, j) => (
                <div key={j} style={{ marginLeft: 8, fontSize: 8 }}>{'\u2022'} {point}</div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Router ────────────────────────────────────────────────────────────────

function CVPreviewHTML({ data, templateId }) {
  const p = data.personal || {}

  switch (templateId) {
    case 'ats-modern-minimal-v1': return <ATSModernMinimalLayout data={data} p={p} />
    case 'executive-serif-v1': return <ExecutiveSerifLayout data={data} p={p} />
    case 'compact-onepage-v1': return <CompactOnePageLayout data={data} p={p} />
    case 'sidebar-slim-v1': return <SidebarSlimLayout data={data} p={p} />
    case 'academic-minimal-v1': return <AcademicMinimalLayout data={data} p={p} />
    case 'technical-minimal-v1': return <TechnicalMinimalLayout data={data} p={p} />
    case 'fresh-graduate-minimal-v1': return <FreshGraduateMinimalLayout data={data} p={p} />
    case 'timeline-minimal-v1': return <TimelineMinimalLayout data={data} p={p} />
    case 'two-tone-minimal-v1': return <TwoToneMinimalLayout data={data} p={p} />
    default: return <ATSCleanLayout data={data} p={p} variant="clean" />
  }
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
          <button type="button" onClick={handleZoomOut} disabled={zoom <= ZOOM_STEPS[0]}
            className="w-7 h-7 flex items-center justify-center text-muted hover:bg-ink/5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-150" aria-label="Zoom out">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" /></svg>
          </button>
          <button type="button" onClick={handleZoomIn} disabled={zoom >= 1}
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
            <CVPreviewHTML data={data} templateId={templateId} />
          </div>
        </div>
      </div>
    </div>
  )
}
