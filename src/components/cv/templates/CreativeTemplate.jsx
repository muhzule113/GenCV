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
  return Array.isArray(tech) && tech.length > 0 && typeof tech[0] === 'string'
    ? tech.map((t) => ({ name: t, level: null }))
    : tech
}

const accentColor = '#8B5CF6'
const darkSidebar = '#2D1B69'

const cStyles = StyleSheet.create({
  page: { fontFamily: 'Helvetica', fontSize: 9, color: '#1E293B', flexDirection: 'row' },
  sidebar: { width: '30%', backgroundColor: darkSidebar, padding: 20, paddingTop: 28, color: '#F8FAFC' },
  photoPlaceholder: {
    width: 70, height: 70, borderRadius: 35, backgroundColor: '#7C3AED',
    alignSelf: 'center', marginBottom: 12, alignItems: 'center', justifyContent: 'center',
  },
  sidebarName: { fontSize: 14, fontWeight: 'bold', color: '#F8FAFC', textAlign: 'center', marginBottom: 2 },
  sidebarSubtitle: { fontSize: 8, color: '#C4B5FD', textAlign: 'center', marginBottom: 16 },
  sidebarSection: { marginTop: 12, marginBottom: 4 },
  sidebarSectionTitle: {
    fontSize: 9, fontWeight: 'bold', textTransform: 'uppercase',
    color: '#C4B5FD', marginBottom: 6, paddingBottom: 3,
    borderBottomWidth: 1, borderBottomColor: accentColor,
  },
  sidebarText: { fontSize: 8, color: '#E2E8F0', lineHeight: 1.5, marginBottom: 3 },
  sidebarLink: { fontSize: 8, color: '#A78BFA', lineHeight: 1.5, marginBottom: 1 },
  skillChip: { fontSize: 7, color: '#E2E8F0', backgroundColor: '#4C1D95', paddingHorizontal: 6, paddingVertical: 2, marginRight: 3, marginBottom: 4 },
  skillChipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 2 },
  langChip: { fontSize: 8, color: '#C4B5FD', marginBottom: 2 },

  main: { width: '70%', padding: 24, backgroundColor: '#FAFAFA' },
  mainSectionTitle: {
    fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase',
    color: accentColor, marginTop: 14, marginBottom: 8, paddingBottom: 4,
    borderBottomWidth: 2, borderBottomColor: accentColor,
  },
  summary: { fontSize: 9, lineHeight: 1.5, color: '#475569', fontStyle: 'italic', marginBottom: 4 },
  expCard: { marginBottom: 8, paddingLeft: 8, borderLeftWidth: 2, borderLeftColor: accentColor },
  expPosition: { fontSize: 10, fontWeight: 'bold', color: '#1E293B' },
  expCompanyPeriod: { fontSize: 8, color: '#64748B', marginBottom: 3 },
  expBullet: { fontSize: 8, color: '#475569', lineHeight: 1.4, marginLeft: 8, marginBottom: 1 },
  eduCard: { marginBottom: 6, paddingLeft: 8, borderLeftWidth: 2, borderLeftColor: '#10B981' },
  eduRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 1 },
  eduDegree: { fontSize: 9, fontWeight: 'bold', color: '#1E293B' },
  eduYear: { fontSize: 8, color: '#64748B' },
  eduDetail: { fontSize: 8, color: '#475569', marginBottom: 4 },
  eduThesis: { fontSize: 8, color: '#64748B', fontStyle: 'italic', marginBottom: 4, marginLeft: 1 },
  certItem: { fontSize: 8, color: '#475569', lineHeight: 1.4, marginBottom: 1 },
  projCard: { marginBottom: 5, paddingLeft: 8, borderLeftWidth: 2, borderLeftColor: '#F59E0B' },
})

export function CreativeTemplate({ data }) {
  const skills = getSkills(data)
  const techSkills = skills
  const softSkills = data.skills?.soft || []
  const p = data.personal || {}

  return (
    <Document>
      <Page size="A4" style={cStyles.page}>
        {/* SIDEBAR */}
        <View style={cStyles.sidebar}>
          <View style={cStyles.photoPlaceholder}>
            <Text style={{ fontSize: 18, color: '#F8FAFC' }}>
              {(p.name || '  ').charAt(0).toUpperCase()}
            </Text>
          </View>

          <Text style={cStyles.sidebarName}>{p.name || ''}</Text>
          {p.jobTitle && <Text style={cStyles.sidebarSubtitle}>{p.jobTitle}</Text>}

          {(p.email || p.phone || p.city) && (
            <View style={cStyles.sidebarSection}>
              <Text style={cStyles.sidebarSectionTitle}>Kontak</Text>
              {p.email && <Text style={cStyles.sidebarText}>{"\u2709"}  {p.email}</Text>}
              {p.phone && <Text style={cStyles.sidebarText}>{"\u260E"}  {p.phone}</Text>}
              {p.city && <Text style={cStyles.sidebarText}>{"\u2302"}  {p.city}</Text>}
            </View>
          )}

          {(p.linkedin || p.github || p.portfolio) && (
            <View style={cStyles.sidebarSection}>
              <Text style={cStyles.sidebarSectionTitle}>Tautan</Text>
              {p.linkedin && <Text style={cStyles.sidebarLink}>{"\u2192"}  {p.linkedin}</Text>}
              {p.github && <Text style={cStyles.sidebarLink}>{"\u2192"}  {p.github}</Text>}
              {p.portfolio && <Text style={cStyles.sidebarLink}>{"\u2192"}  {p.portfolio}</Text>}
            </View>
          )}

          {techSkills.length > 0 && (
            <View style={cStyles.sidebarSection}>
              <Text style={cStyles.sidebarSectionTitle}>Keahlian</Text>
              <View style={cStyles.skillChipRow}>
                {techSkills.map((s, i) => (
                  <Text key={i} style={cStyles.skillChip}>{typeof s === 'string' ? s : s.name}</Text>
                ))}
              </View>
            </View>
          )}

          {Array.isArray(softSkills) && softSkills.length > 0 && (
            <View style={cStyles.sidebarSection}>
              <Text style={cStyles.sidebarSectionTitle}>Interpersonal</Text>
              {softSkills.map((s, i) => (
                <Text key={i} style={cStyles.sidebarText}>{"\u2022"}  {typeof s === 'string' ? s : s.name}</Text>
              ))}
            </View>
          )}

          {(data.languages || []).length > 0 && (
            <View style={cStyles.sidebarSection}>
              <Text style={cStyles.sidebarSectionTitle}>Bahasa</Text>
              {data.languages.map((l, i) => (
                <Text key={i} style={cStyles.langChip}>{"\u2666"}  {l.name}{l.level ? ` (${l.level})` : ''}</Text>
              ))}
            </View>
          )}
        </View>

        {/* MAIN */}
        <View style={cStyles.main}>
          {data.summary && (
            <View>
              <Text style={cStyles.mainSectionTitle}>Profil</Text>
              <Text style={cStyles.summary}>{data.summary}</Text>
            </View>
          )}

          {data.experiences?.length > 0 && (
            <View>
              <Text style={cStyles.mainSectionTitle}>Pengalaman</Text>
              {data.experiences.map((exp, i) => (
                <View key={i} style={cStyles.expCard}>
                  <Text style={cStyles.expPosition}>{exp.position}</Text>
                  <Text style={cStyles.expCompanyPeriod}>
                    {exp.company} \u2014 {formatPeriod(exp.startDate || exp.start_date, exp.endDate || exp.end_date, exp.isCurrent)}
                  </Text>
                  {(exp.description || []).map((point, j) => (
                    <Text key={j} style={cStyles.expBullet}>\u2022 {point}</Text>
                  ))}
                </View>
              ))}
            </View>
          )}

          {data.educations?.length > 0 && (
            <View>
              <Text style={cStyles.mainSectionTitle}>Pendidikan</Text>
              {data.educations.map((edu, i) => (
                <View key={i} style={cStyles.eduCard}>
                  <View style={cStyles.eduRow}>
                    <Text style={cStyles.eduDegree}>{edu.degree} \u2014 {edu.institution}</Text>
                    <Text style={cStyles.eduYear}>{edu.startYear || edu.start_year} \u2013 {edu.endYear || edu.end_year || 'Sekarang'}</Text>
                  </View>
                  <Text style={cStyles.eduDetail}>{edu.field}{edu.gpa ? `, IPK: ${edu.gpa}` : ''}</Text>
                  {edu.thesis && <Text style={cStyles.eduThesis}>Tugas Akhir: {edu.thesis}</Text>}
                </View>
              ))}
            </View>
          )}

          {(data.certifications || []).length > 0 && (
            <View>
              <Text style={cStyles.mainSectionTitle}>Sertifikasi</Text>
              {data.certifications.map((c, i) => (
                <Text key={i} style={cStyles.certItem}>\u2022 {c.name}{c.issuer ? ` \u2014 ${c.issuer}` : ''}</Text>
              ))}
            </View>
          )}

          {data.projects?.length > 0 && (
            <View>
              <Text style={cStyles.mainSectionTitle}>Proyek</Text>
              {data.projects.map((proj, i) => (
                <View key={i} style={cStyles.projCard}>
                  <Text style={cStyles.expPosition}>{proj.name}</Text>
                  <Text style={cStyles.expCompanyPeriod}>{proj.period || ''}</Text>
                  {proj.description && <Text style={cStyles.expBullet}>{proj.description}</Text>}
                </View>
              ))}
            </View>
          )}
        </View>
      </Page>
    </Document>
  )
}
