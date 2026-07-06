import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import { formatDate, formatPeriod, getSkills } from './templateUtils'

const styles = StyleSheet.create({
  page: { fontFamily: 'Helvetica', fontSize: 9, color: '#1E293B', flexDirection: 'row' },
  sidebar: { width: '28%', backgroundColor: '#F4F4F5', padding: 16, borderRightWidth: 1, borderRightColor: '#D4D4D8' },
  main: { width: '72%', padding: 20, backgroundColor: '#FFFFFF' },
  
  sideSection: { marginBottom: 12 },
  sideTitle: { fontSize: 8.5, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1, borderBottomWidth: 1, borderBottomColor: '#D4D4D8', paddingBottom: 2, marginBottom: 5, color: '#27272A' },
  sideLabel: { fontSize: 7, fontWeight: 'bold', color: '#52525B', marginTop: 3, textTransform: 'uppercase' },
  sideVal: { fontSize: 8, color: '#27272A', marginBottom: 2 },
  
  name: { fontSize: 18, fontWeight: 'bold', color: '#09090B', marginBottom: 2 },
  jobTitle: { fontSize: 10, color: '#52525B', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 10 },
  
  sectionTitle: {
    fontSize: 9.5, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1,
    color: '#09090B', borderBottomWidth: 1, borderBottomColor: '#E4E4E7', paddingBottom: 2,
    marginTop: 12, marginBottom: 6,
  },
  summary: { fontSize: 8.5, lineHeight: 1.4, color: '#27272A', marginBottom: 4 },
  bul: { marginLeft: 8, marginBottom: 2, lineHeight: 1.3, fontSize: 8.5, color: '#27272A' },
  expHeader: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 3, marginBottom: 1, alignItems: 'baseline' },
  expPosition: { fontWeight: 'bold', fontSize: 9.5, color: '#09090B' },
  expDate: { fontSize: 7.5, color: '#71717A' },
  expCompany: { fontSize: 8.5, color: '#52525B', marginBottom: 2, fontStyle: 'italic' },
  
  eduRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 1, alignItems: 'baseline' },
  eduDegree: { fontWeight: 'bold', fontSize: 9, color: '#09090B' },
  eduYear: { fontSize: 7.5, color: '#71717A' },
  eduDetail: { fontSize: 8.5, color: '#52525B', marginBottom: 2 },
  eduThesis: { fontSize: 8, color: '#71717A', fontStyle: 'italic', marginBottom: 2 },
  
  projRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 3, marginBottom: 1, alignItems: 'baseline' },
  projName: { fontWeight: 'bold', fontSize: 9, color: '#09090B' },
  projTech: { fontSize: 7.5, color: '#71717A', fontStyle: 'italic', marginBottom: 1 },
  projDesc: { fontSize: 8.5, color: '#27272A', lineHeight: 1.3, marginBottom: 2 },
  
  skillContainer: { flexDirection: 'row', flexWrap: 'wrap', marginLeft: 4 },
  skillItemWrapper: { width: '50%' },
  skillItem: { marginBottom: 2, lineHeight: 1.3, fontSize: 8, color: '#27272A' },
  certItem: { fontSize: 7.5, color: '#27272A', marginBottom: 2 },
})

export function SidebarSlimTemplate({ data }) {
  const skills = getSkills(data)
  const p = data.personal || {}

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Sidebar */}
        <View style={styles.sidebar}>
          <View style={styles.sideSection}>
            <Text style={styles.sideTitle}>Kontak</Text>
            {p.email && (
              <View>
                <Text style={styles.sideLabel}>Email</Text>
                <Text style={styles.sideVal}>{p.email}</Text>
              </View>
            )}
            {p.phone && (
              <View>
                <Text style={styles.sideLabel}>Telepon</Text>
                <Text style={styles.sideVal}>{p.phone}</Text>
              </View>
            )}
            {p.city && (
              <View>
                <Text style={styles.sideLabel}>Lokasi</Text>
                <Text style={styles.sideVal}>{p.city}</Text>
              </View>
            )}
            {p.linkedin && (
              <View>
                <Text style={styles.sideLabel}>LinkedIn</Text>
                <Text style={styles.sideVal}>{p.linkedin.replace(/^https?:\/\/(www\.)?/, '')}</Text>
              </View>
            )}
            {p.github && (
              <View>
                <Text style={styles.sideLabel}>GitHub</Text>
                <Text style={styles.sideVal}>{p.github.replace(/^https?:\/\/(www\.)?/, '')}</Text>
              </View>
            )}
            {p.portfolio && (
              <View>
                <Text style={styles.sideLabel}>Portofolio</Text>
                <Text style={styles.sideVal}>{p.portfolio.replace(/^https?:\/\/(www\.)?/, '')}</Text>
              </View>
            )}
          </View>

          {skills.technical.length > 0 && (
            <View style={styles.sideSection}>
              <Text style={styles.sideTitle}>Keahlian</Text>
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

          {data.languages?.length > 0 && (
            <View style={styles.sideSection}>
              <Text style={styles.sideTitle}>Bahasa</Text>
              {data.languages.map((l, i) => (
                <Text key={i} style={styles.sideVal}>• {l.name}{l.level ? ` (${l.level})` : ''}</Text>
              ))}
            </View>
          )}

          {data.certifications?.length > 0 && (
            <View style={styles.sideSection}>
              <Text style={styles.sideTitle}>Sertifikasi</Text>
              {data.certifications.map((c, i) => (
                <Text key={i} style={styles.certItem}>• {c.name}</Text>
              ))}
            </View>
          )}
        </View>

        {/* Main Column */}
        <View style={styles.main}>
          <Text style={styles.name}>{p.name || ''}</Text>
          {p.jobTitle && <Text style={styles.jobTitle}>{p.jobTitle}</Text>}

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
        </View>
      </Page>
    </Document>
  )
}
