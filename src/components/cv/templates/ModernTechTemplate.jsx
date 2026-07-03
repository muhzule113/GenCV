import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

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
  return `${s} \u2013 ${e}`
}

function getSkills(data) {
  const tech = data.skills?.technical || []
  const soft = data.skills?.soft || []
  return {
    technical: Array.isArray(tech) && tech.length > 0 && typeof tech[0] === 'string'
      ? tech.map((t) => ({ name: t, level: null }))
      : tech,
    soft: Array.isArray(soft) && soft.length > 0 && typeof soft[0] === 'string'
      ? soft
      : [],
  }
}

function SkillBar({ name, level }) {
  const lvl = level === 'expert' ? 100 : level === 'advanced' ? 80 : level === 'intermediate' ? 60 : 40
  return (
    <View style={mStyles.skillBarRow}>
      <Text style={mStyles.skillBarName}>{name}</Text>
      <View style={mStyles.skillBarTrack}>
        <View style={[mStyles.skillBarFill, { width: `${lvl}%` }]} />
      </View>
    </View>
  )
}

const accentColor = '#2563EB'
const darkBg = '#1E293B'

const mStyles = StyleSheet.create({
  page: { fontFamily: 'Helvetica', fontSize: 9, color: '#1E293B', flexDirection: 'row' },
  sidebar: { width: '32%', backgroundColor: darkBg, padding: 20, paddingTop: 24, color: '#F8FAFC' },
  sidebarName: { fontSize: 16, fontWeight: 'bold', color: '#F8FAFC', marginBottom: 2 },
  sidebarJobTitle: { fontSize: 10, color: '#93C5FD', marginBottom: 14 },
  sidebarSection: { marginTop: 14, marginBottom: 4 },
  sidebarSectionTitle: {
    fontSize: 9, fontWeight: 'bold', textTransform: 'uppercase',
    color: '#93C5FD', borderBottomWidth: 1, borderBottomColor: accentColor,
    paddingBottom: 3, marginBottom: 6,
  },
  sidebarText: { fontSize: 8, color: '#CBD5E1', lineHeight: 1.5, marginBottom: 2 },
  sidebarContactIcon: { width: 12, marginRight: 4 },
  sidebarContactRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 4 },
  skillBarRow: { marginBottom: 4 },
  skillBarName: { fontSize: 8, color: '#E2E8F0', marginBottom: 1 },
  skillBarTrack: { height: 3, backgroundColor: '#334155' },
  skillBarFill: { height: 3, backgroundColor: accentColor },

  main: { width: '68%', padding: 24, paddingTop: 24, backgroundColor: '#FFFFFF' },
  mainSectionTitle: {
    fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase',
    color: accentColor, marginTop: 14, marginBottom: 6, paddingBottom: 3,
    borderBottomWidth: 1, borderBottomColor: accentColor,
  },
  summary: { fontSize: 9, lineHeight: 1.4, color: '#475569', marginBottom: 4 },
  expCard: { marginBottom: 8 },
  expPosition: { fontSize: 10, fontWeight: 'bold', color: '#1E293B' },
  expCompanyPeriod: { fontSize: 8, color: '#64748B', marginBottom: 2 },
  expBullet: { fontSize: 8, color: '#475569', lineHeight: 1.4, marginLeft: 8, marginBottom: 1 },
  eduRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 1 },
  eduDegree: { fontSize: 9, fontWeight: 'bold', color: '#1E293B' },
  eduYear: { fontSize: 8, color: '#64748B' },
  eduDetail: { fontSize: 8, color: '#475569', marginBottom: 4 },
  eduThesis: { fontSize: 8, color: '#64748B', fontStyle: 'italic', marginBottom: 4, marginLeft: 1 },
  certItem: { fontSize: 8, color: '#475569', lineHeight: 1.4, marginBottom: 1 },
  langChip: { fontSize: 8, color: accentColor, marginBottom: 1 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 3, marginBottom: 3 },
  tag: { fontSize: 7, color: '#475569', backgroundColor: '#F1F5F9', paddingHorizontal: 5, paddingVertical: 2, marginRight: 3, marginBottom: 3 },
})

export function ModernTechTemplate({ data }) {
  const skills = getSkills(data)
  const p = data.personal || {}

  return (
    <Document>
      <Page size="A4" style={mStyles.page}>
        {/* SIDEBAR */}
        <View style={mStyles.sidebar}>
          <Text style={mStyles.sidebarName}>{p.name || ''}</Text>
          {p.jobTitle && <Text style={mStyles.sidebarJobTitle}>{p.jobTitle}</Text>}

          {(p.email || p.phone || p.city) && (
            <View style={mStyles.sidebarSection}>
              <Text style={mStyles.sidebarSectionTitle}>Kontak</Text>
              {p.email && <Text style={mStyles.sidebarText}>{p.email}</Text>}
              {p.phone && <Text style={mStyles.sidebarText}>{p.phone}</Text>}
              {p.city && <Text style={mStyles.sidebarText}>{p.city}</Text>}
              {p.linkedin && <Text style={mStyles.sidebarText}>{p.linkedin}</Text>}
              {p.github && <Text style={mStyles.sidebarText}>{p.github}</Text>}
              {p.portfolio && <Text style={mStyles.sidebarText}>{p.portfolio}</Text>}
            </View>
          )}

          {skills.technical.length > 0 && (
            <View style={mStyles.sidebarSection}>
              <Text style={mStyles.sidebarSectionTitle}>Keahlian Teknis</Text>
              {skills.technical.map((s, i) => (
                <SkillBar key={i} name={s.name || s} level={typeof s === 'string' ? null : s.level} />
              ))}
            </View>
          )}

          {skills.soft.length > 0 && (
            <View style={mStyles.sidebarSection}>
              <Text style={mStyles.sidebarSectionTitle}>Interpersonal</Text>
              <View style={mStyles.tagRow}>
                {skills.soft.map((s, i) => (
                  <Text key={i} style={mStyles.tag}>{typeof s === 'string' ? s : s.name || s}</Text>
                ))}
              </View>
            </View>
          )}

          {(data.languages || []).length > 0 && (
            <View style={mStyles.sidebarSection}>
              <Text style={mStyles.sidebarSectionTitle}>Bahasa</Text>
              {data.languages.map((l, i) => (
                <Text key={i} style={mStyles.langChip}>{l.name}{l.level ? ` (${l.level})` : ''}</Text>
              ))}
            </View>
          )}
        </View>

        {/* MAIN */}
        <View style={mStyles.main}>
          {data.summary && (
            <View>
              <Text style={mStyles.mainSectionTitle}>Profil</Text>
              <Text style={mStyles.summary}>{data.summary}</Text>
            </View>
          )}

          {data.experiences?.length > 0 && (
            <View>
              <Text style={mStyles.mainSectionTitle}>Pengalaman</Text>
              {data.experiences.map((exp, i) => (
                <View key={i} style={mStyles.expCard}>
                  <Text style={mStyles.expPosition}>{exp.position}</Text>
                  <Text style={mStyles.expCompanyPeriod}>
                    {exp.company} \u2014 {formatPeriod(exp.startDate || exp.start_date, exp.endDate || exp.end_date, exp.isCurrent)}
                  </Text>
                  {(exp.description || []).map((point, j) => (
                    <Text key={j} style={mStyles.expBullet}>\u2022 {point}</Text>
                  ))}
                </View>
              ))}
            </View>
          )}

          {data.educations?.length > 0 && (
            <View>
              <Text style={mStyles.mainSectionTitle}>Pendidikan</Text>
              {data.educations.map((edu, i) => (
                <View key={i}>
                  <View style={mStyles.eduRow}>
                    <Text style={mStyles.eduDegree}>{edu.degree} \u2014 {edu.institution}</Text>
                    <Text style={mStyles.eduYear}>{edu.startYear || edu.start_year} \u2013 {edu.endYear || edu.end_year || 'Sekarang'}</Text>
                  </View>
                  <Text style={mStyles.eduDetail}>{edu.field}{edu.gpa ? `, IPK: ${edu.gpa}` : ''}</Text>
                  {edu.thesis && <Text style={mStyles.eduThesis}>Tugas Akhir: {edu.thesis}</Text>}
                </View>
              ))}
            </View>
          )}

          {(data.certifications || []).length > 0 && (
            <View>
              <Text style={mStyles.mainSectionTitle}>Sertifikasi</Text>
              {data.certifications.map((c, i) => (
                <Text key={i} style={mStyles.certItem}>\u2022 {c.name}{c.issuer ? ` \u2014 ${c.issuer}` : ''}</Text>
              ))}
            </View>
          )}

          {data.projects?.length > 0 && (
            <View>
              <Text style={mStyles.mainSectionTitle}>Proyek</Text>
              {data.projects.map((proj, i) => (
                <View key={i} style={{ marginBottom: 5 }}>
                  <Text style={mStyles.expPosition}>{proj.name}</Text>
                  <Text style={mStyles.expCompanyPeriod}>{proj.period || ''}</Text>
                  {proj.description && <Text style={mStyles.expBullet}>{proj.description}</Text>}
                </View>
              ))}
            </View>
          )}
        </View>
      </Page>
    </Document>
  )
}
