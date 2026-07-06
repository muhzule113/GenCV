import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import { formatDate, formatPeriod, getSkills } from './templateUtils'

const styles = StyleSheet.create({
  page: { fontFamily: 'Helvetica', fontSize: 8.5, padding: 30, color: '#111111' },
  header: { marginBottom: 10, borderBottomWidth: 1.5, borderBottomColor: '#111111', paddingBottom: 6 },
  name: { fontSize: 16, fontWeight: 'bold', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 2 },
  jobTitle: { fontSize: 9, color: '#444444', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 4 },
  contactRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 3, fontSize: 8, color: '#555555' },
  contactItem: { marginRight: 8 },
  sectionTitle: {
    fontSize: 9, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1,
    borderBottomWidth: 0.8, borderBottomColor: '#111111', paddingBottom: 1.5,
    marginTop: 10, marginBottom: 4,
  },
  summary: { fontSize: 8.5, lineHeight: 1.4, color: '#222222', marginBottom: 2 },
  bul: { marginLeft: 8, marginBottom: 1.5, lineHeight: 1.3, fontSize: 8.5, color: '#222222' },
  expHeader: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 2, marginBottom: 0.5, alignItems: 'baseline' },
  expPosition: { fontWeight: 'bold', fontSize: 9 },
  expDate: { fontSize: 7.5, color: '#555555' },
  expCompany: { fontSize: 8, color: '#444444', marginBottom: 1.5, fontStyle: 'italic' },
  eduRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 0.5, alignItems: 'baseline' },
  eduDegree: { fontWeight: 'bold', fontSize: 8.5 },
  eduYear: { fontSize: 7.5, color: '#555555' },
  eduDetail: { fontSize: 8, color: '#444444', marginBottom: 1.5 },
  eduThesis: { fontSize: 7.5, color: '#555555', fontStyle: 'italic', marginBottom: 2 },
  skillContainer: { flexDirection: 'row', flexWrap: 'wrap', marginLeft: 2 },
  skillItemWrapper: { width: '50%' },
  skillItem: { marginBottom: 1.5, lineHeight: 1.3, fontSize: 8.5, color: '#222222' },
  projRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 2, marginBottom: 0.5, alignItems: 'baseline' },
  projName: { fontWeight: 'bold', fontSize: 8.5 },
  projTech: { fontSize: 7.5, color: '#555555', fontStyle: 'italic', marginBottom: 0.5 },
  projDesc: { fontSize: 8, color: '#222222', lineHeight: 1.3, marginBottom: 1.5 },
  certItem: { fontSize: 8, color: '#222222', marginBottom: 1 },
  langItem: { fontSize: 8, color: '#222222', lineHeight: 1.3 },
})

export function CompactOnePageTemplate({ data }) {
  const skills = getSkills(data)
  const p = data.personal || {}

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.name}>{p.name || ''}</Text>
          {p.jobTitle && <Text style={styles.jobTitle}>{p.jobTitle}</Text>}
          <View style={styles.contactRow}>
            {[p.email, p.phone, p.city].filter(Boolean).map((c, i) => (
              <Text key={i} style={styles.contactItem}>{c}</Text>
            ))}
          </View>
          <View style={{ marginTop: 2, ...styles.contactRow }}>
            {[p.linkedin, p.github, p.portfolio].filter(Boolean).map((c, i) => (
              <Text key={i} style={styles.contactItem}>{c}</Text>
            ))}
          </View>
        </View>

        {data.summary && (
          <View>
            <Text style={styles.sectionTitle}>Ringkasan Profesional</Text>
            <Text style={styles.summary}>{data.summary}</Text>
          </View>
        )}

        {data.experiences?.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Pengalaman Kerja</Text>
            {data.experiences.map((exp, i) => (
              <View key={i} style={{ marginBottom: 4 }}>
                <View style={styles.expHeader}>
                  <Text style={styles.expPosition}>{exp.position}</Text>
                  <Text style={styles.expDate}>{formatPeriod(exp.startDate || exp.start_date, exp.endDate || exp.end_date, exp.isCurrent)}</Text>
                </View>
                <Text style={styles.expCompany}>{exp.company}</Text>
                {(exp.description || []).map((point, j) => (
                  <Text key={j} style={styles.bul}>• {point}</Text>
                ))}
              </View>
            ))}
          </View>
        )}

        {data.educations?.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Pendidikan</Text>
            {data.educations.map((edu, i) => (
              <View key={i} style={{ marginBottom: 3 }}>
                <View style={styles.eduRow}>
                  <Text style={styles.eduDegree}>{edu.degree}, {edu.field}</Text>
                  <Text style={styles.eduYear}>{edu.startYear || edu.start_year} – {edu.endYear || edu.end_year || 'Sekarang'}</Text>
                </View>
                <Text style={styles.eduDetail}>{edu.institution}{edu.gpa ? ` — IPK: ${edu.gpa}` : ''}</Text>
                {edu.thesis && <Text style={styles.eduThesis}>Tugas Akhir: {edu.thesis}</Text>}
              </View>
            ))}
          </View>
        )}

        {skills.technical.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Keahlian</Text>
            <View style={styles.skillContainer}>
              {skills.technical.map((s, i) => (
                <View key={`t-${i}`} style={styles.skillItemWrapper}>
                  <Text style={styles.skillItem}>• {typeof s === 'string' ? s : s.name}</Text>
                </View>
              ))}
              {skills.soft.map((s, i) => (
                <View key={`s-${i}`} style={styles.skillItemWrapper}>
                  <Text style={styles.skillItem}>• {typeof s === 'string' ? s : s.name || s}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {data.projects?.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Proyek</Text>
            {data.projects.map((proj, i) => (
              <View key={i} style={{ marginBottom: 3 }}>
                <View style={styles.projRow}>
                  <Text style={styles.projName}>{proj.name}</Text>
                  {proj.period && <Text style={styles.projTech}>{proj.period}</Text>}
                </View>
                {(proj.techStack || proj.tech_stack)?.length > 0 && (
                  <Text style={styles.projTech}>{(proj.techStack || proj.tech_stack).join(', ')}</Text>
                )}
                {proj.description && <Text style={styles.projDesc}>{proj.description}</Text>}
              </View>
            ))}
          </View>
        )}

        {data.certifications?.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Sertifikasi</Text>
            {data.certifications.map((c, i) => (
              <Text key={i} style={styles.certItem}>• {c.name}{c.issuer ? ` — ${c.issuer}` : ''}{c.date ? ` (${formatDate(c.date)})` : ''}</Text>
            ))}
          </View>
        )}

        {data.languages?.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Bahasa</Text>
            <Text style={styles.langItem}>{data.languages.map((l) => `${l.name}${l.level ? ` — ${l.level}` : ''}`).join('  •  ')}</Text>
          </View>
        )}
      </Page>
    </Document>
  )
}
