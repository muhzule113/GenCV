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
  return `${s} – ${e}`
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

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    padding: 40,
    color: '#000',
  },
  header: {
    textAlign: 'center',
    marginBottom: 16,
  },
  name: { fontSize: 18, fontWeight: 'bold', marginBottom: 2 },
  jobTitle: { fontSize: 11, color: '#333', marginBottom: 6 },
  contactLine: { fontSize: 9, color: '#444', lineHeight: 1.5 },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    borderBottomWidth: 1,
    borderBottomColor: '#1D4ED8',
    paddingBottom: 2,
    marginTop: 14,
    marginBottom: 6,
  },
  bullet: { marginLeft: 12, marginBottom: 2, lineHeight: 1.4, fontSize: 10 },
  expHeader: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4, marginBottom: 1 },
  expPosition: { fontWeight: 'bold', fontSize: 10 },
  expCompanyPeriod: { fontSize: 9, color: '#444', marginBottom: 2 },
  eduRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 1 },
  eduDegree: { fontWeight: 'bold', fontSize: 10 },
  eduYear: { fontSize: 9, color: '#444' },
  eduDetail: { fontSize: 9, color: '#333', marginBottom: 3 },
  eduThesis: { fontSize: 9, color: '#555', fontStyle: 'italic', marginBottom: 3, marginLeft: 1 },
  skillsRow: { flexDirection: 'row', marginBottom: 4 },
  skillsCol: { flex: 1 },
  skillsLabel: { fontWeight: 'bold', fontSize: 10, marginBottom: 2 },
  skillItem: { fontSize: 9, lineHeight: 1.5, color: '#222' },
  inlineDivider: { fontSize: 9, color: '#666' },
  inlineRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 4 },
  inlineItem: { fontSize: 9, color: '#333', lineHeight: 1.6 },
  projRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 3, marginBottom: 1 },
  projName: { fontWeight: 'bold', fontSize: 10 },
  projYear: { fontSize: 9, color: '#444' },
  projTech: { fontSize: 9, color: '#555', fontStyle: 'italic', marginBottom: 2 },
  projDesc: { fontSize: 9, lineHeight: 1.3, color: '#333', marginBottom: 2 },
})

export function ATSCleanTemplate({ data }) {
  const skills = getSkills(data)

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.name}>{data.personal?.name || ''}</Text>
          {data.personal?.jobTitle && <Text style={styles.jobTitle}>{data.personal.jobTitle}</Text>}
          <Text style={styles.contactLine}>
            {[data.personal?.city, data.personal?.phone, data.personal?.email]
              .filter(Boolean).join(' | ')}
          </Text>
          <Text style={styles.contactLine}>
            {[data.personal?.linkedin, data.personal?.github, data.personal?.portfolio]
              .filter(Boolean).join(' | ')}
          </Text>
        </View>

        {data.summary && (
          <View>
            <Text style={styles.sectionTitle}>Ringkasan Profil</Text>
            <Text style={{ lineHeight: 1.4, fontSize: 10, marginBottom: 2 }}>{data.summary}</Text>
          </View>
        )}

        {data.experiences?.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Pengalaman Kerja</Text>
            {data.experiences.map((exp, i) => (
              <View key={i} style={{ marginBottom: 7 }}>
                <View style={styles.expHeader}>
                  <Text style={styles.expPosition}>{exp.position}</Text>
                </View>
                <Text style={styles.expCompanyPeriod}>
                  {exp.company} — {formatPeriod(exp.startDate || exp.start_date, exp.endDate || exp.end_date, exp.isCurrent)}
                </Text>
                {(exp.description || []).map((point, j) => (
                  <Text key={j} style={styles.bullet}>• {point}</Text>
                ))}
              </View>
            ))}
          </View>
        )}

        {data.educations?.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Pendidikan</Text>
            {data.educations.map((edu, i) => (
              <View key={i} style={{ marginBottom: 5 }}>
                <View style={styles.eduRow}>
                  <Text style={styles.eduDegree}>{edu.degree} — {edu.institution}</Text>
                  <Text style={styles.eduYear}>{edu.startYear || edu.start_year} – {edu.endYear || edu.end_year || 'Sekarang'}</Text>
                </View>
                <Text style={styles.eduDetail}>{edu.field}{edu.gpa ? `, IPK: ${edu.gpa}` : ''}</Text>
                {edu.thesis && <Text style={styles.eduThesis}>Tugas Akhir: {edu.thesis}</Text>}
              </View>
            ))}
          </View>
        )}

        {(skills.technical.length > 0 || skills.soft.length > 0) && (
          <View>
            <Text style={styles.sectionTitle}>Keahlian</Text>
            <View style={styles.skillsRow}>
              <View style={styles.skillsCol}>
                <Text style={styles.skillsLabel}>Keahlian Teknis</Text>
                {skills.technical.map((s, i) => (
                  <Text key={i} style={styles.skillItem}>
                    • {s.name}{s.level ? ` (${s.level})` : ''}
                  </Text>
                ))}
              </View>
              <View style={styles.skillsCol}>
                {skills.soft.length > 0 && <Text style={styles.skillsLabel}>Interpersonal</Text>}
                {skills.soft.map((s, i) => (
                  <Text key={i} style={styles.skillItem}>• {s}</Text>
                ))}
              </View>
            </View>
          </View>
        )}

        {((data.certifications?.length > 0) || (data.languages?.length > 0)) && (
          <View>
            <Text style={styles.sectionTitle}>Bahasa & Sertifikasi</Text>
            <View style={styles.inlineRow}>
              {data.languages?.length > 0 && (
                <Text style={styles.inlineItem}>
                  Bahasa: {data.languages.map((l) => `${l.name}${l.level ? ` (${l.level})` : ''}`).join(', ')}
                </Text>
              )}
              {data.languages?.length > 0 && data.certifications?.length > 0 && (
                <Text style={[styles.inlineItem, { marginHorizontal: 4 }]}>|</Text>
              )}
              {data.certifications?.length > 0 && (
                <Text style={styles.inlineItem}>
                  Sertifikasi: {data.certifications.map((c) => c.name + (c.issuer ? ` — ${c.issuer}` : '')).join(', ')}
                </Text>
              )}
            </View>
          </View>
        )}

        {data.projects?.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Proyek & Portofolio</Text>
            {data.projects.map((proj, i) => (
              <View key={i} style={{ marginBottom: 5 }}>
                <View style={styles.projRow}>
                  <Text style={styles.projName}>{proj.name}</Text>
                  <Text style={styles.projYear}>{proj.period || formatPeriod(proj.startDate, proj.endDate, false)}</Text>
                </View>
                {(proj.techStack || proj.tech_stack)?.length > 0 && (
                  <Text style={styles.projTech}>Teknologi: {(proj.techStack || proj.tech_stack).join(', ')}</Text>
                )}
                {proj.description && <Text style={styles.projDesc}>{proj.description}</Text>}
              </View>
            ))}
          </View>
        )}
      </Page>
    </Document>
  )
}
