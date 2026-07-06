import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import { formatDate, formatPeriod, getSkills } from './templateUtils'

const accent = '#334155'
const textMain = '#1E293B'
const textMuted = '#64748B'

const styles = StyleSheet.create({
  page: { fontFamily: 'Helvetica', fontSize: 9.5, padding: 40, color: textMain },
  header: { marginBottom: 16 },
  name: { fontSize: 18, fontWeight: 'bold', color: textMain, letterSpacing: 0.5, marginBottom: 2 },
  nameLine: { height: 2, backgroundColor: accent, width: 60, marginBottom: 6 },
  jobTitle: { fontSize: 10, color: textMuted, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 6 },
  contactRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 3, fontSize: 8.5, color: textMuted },
  contactItem: { marginRight: 10 },
  sectionTitle: {
    fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1.2,
    color: textMain, borderBottomWidth: 1, borderBottomColor: '#CBD5E1', paddingBottom: 2,
    marginTop: 12, marginBottom: 6,
  },
  summary: { fontSize: 9, lineHeight: 1.5, color: textMain, marginBottom: 4 },
  bul: { marginLeft: 10, marginBottom: 2, lineHeight: 1.4, fontSize: 9, color: textMain },
  expHeader: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4, marginBottom: 1, alignItems: 'baseline' },
  expPosition: { fontWeight: 'bold', fontSize: 10, color: textMain },
  expDate: { fontSize: 8, color: textMuted },
  expCompany: { fontSize: 8.5, color: textMuted, marginBottom: 2, fontStyle: 'italic' },
  eduRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 1, alignItems: 'baseline' },
  eduDegree: { fontWeight: 'bold', fontSize: 9.5, color: textMain },
  eduYear: { fontSize: 8, color: textMuted },
  eduDetail: { fontSize: 8.5, color: textMuted, marginBottom: 2 },
  eduThesis: { fontSize: 8, color: textMuted, fontStyle: 'italic', marginBottom: 3 },
  skillContainer: { flexDirection: 'row', flexWrap: 'wrap', marginLeft: 2 },
  skillItemWrapper: { width: '50%' },
  skillItem: { marginBottom: 2, lineHeight: 1.4, fontSize: 9, color: textMain },
  projRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 3, marginBottom: 1, alignItems: 'baseline' },
  projName: { fontWeight: 'bold', fontSize: 9.5, color: textMain },
  projTech: { fontSize: 8, color: textMuted, fontStyle: 'italic', marginBottom: 1 },
  projDesc: { fontSize: 8.5, color: textMain, lineHeight: 1.3, marginBottom: 2 },
  certItem: { fontSize: 8.5, color: textMain, marginBottom: 1 },
  langItem: { fontSize: 8.5, color: textMain, lineHeight: 1.4 },
})

export function ATSModernMinimalTemplate({ data }) {
  const skills = getSkills(data)
  const p = data.personal || {}

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.name}>{p.name || ''}</Text>
          <View style={styles.nameLine} />
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
              <View key={i} style={{ marginBottom: 6 }}>
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
              <View key={i} style={{ marginBottom: 4 }}>
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
              <View key={i} style={{ marginBottom: 4 }}>
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
