import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import { formatDate, formatPeriod, getSkills } from './templateUtils'

const accent = '#4F46E5'

const s = StyleSheet.create({
  page: { fontFamily: 'Helvetica', fontSize: 8.5, padding: 36, paddingTop: 30, color: '#1E293B' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 10, paddingBottom: 8, borderBottomWidth: 1.5, borderBottomColor: accent },
  name: { fontSize: 16, fontWeight: 'bold', color: '#1E293B', letterSpacing: 0.5 },
  jobTitle: { fontSize: 8, color: accent, letterSpacing: 1, textTransform: 'uppercase' },
  contactLine: { fontSize: 7, color: '#666', textAlign: 'right', lineHeight: 1.5 },
  columns: { flexDirection: 'row', gap: 16 },
  leftCol: { width: '62%' },
  rightCol: { width: '38%' },
  sectionTitle: {
    fontSize: 8, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1.5,
    color: accent, borderBottomWidth: 1, borderBottomColor: accent, paddingBottom: 2,
    marginTop: 10, marginBottom: 5,
  },
  summary: { fontSize: 8, lineHeight: 1.5, color: '#334155', marginBottom: 2 },
  bul: { marginLeft: 6, marginBottom: 1, lineHeight: 1.4, fontSize: 8, color: '#334155' },
  expPosition: { fontWeight: 'bold', fontSize: 8.5, color: '#1E293B' },
  expCompanyDate: { flexDirection: 'row', justifyContent: 'space-between', fontSize: 7, color: '#888', marginBottom: 2 },
  expCompany: { fontStyle: 'italic' },
  eduDegree: { fontWeight: 'bold', fontSize: 8.5, color: '#1E293B' },
  eduSchoolDate: { flexDirection: 'row', justifyContent: 'space-between', fontSize: 7, color: '#888', marginBottom: 2 },
  eduDetail: { fontSize: 7.5, color: '#666', marginBottom: 2, lineHeight: 1.3 },
  eduThesis: { fontSize: 7.5, color: '#888', fontStyle: 'italic', marginBottom: 2, marginLeft: 1 },
  skillItem: { fontSize: 7.5, color: '#334155', lineHeight: 1.6, marginBottom: 1 },
  certItem: { fontSize: 7.5, color: '#334155', lineHeight: 1.4, marginBottom: 1 },
  langItem: { fontSize: 7.5, color: '#334155', lineHeight: 1.5 },
  projName: { fontWeight: 'bold', fontSize: 8, color: '#1E293B', marginBottom: 1 },
  projMeta: { fontSize: 7, color: '#999', marginBottom: 1 },
  projDesc: { fontSize: 7.5, color: '#334155', lineHeight: 1.3 },
})

export function CompactTemplate({ data }) {
  const skills = getSkills(data)
  const p = data.personal || {}

  return (
    <Document>
      <Page size="A4" style={s.page}>
        <View style={s.header}>
          <View>
            <Text style={s.name}>{p.name || ''}</Text>
            {p.jobTitle && <Text style={s.jobTitle}>{p.jobTitle}</Text>}
          </View>
          <View>
            <Text style={s.contactLine}>{[p.email, p.phone, p.city, p.linkedin, p.github, p.portfolio].filter(Boolean).join(' • ')}</Text>
          </View>
        </View>

        <View style={s.columns}>
          <View style={s.leftCol}>
            {data.summary && (
              <View>
                <Text style={s.sectionTitle}>Profil</Text>
                <Text style={s.summary}>{data.summary}</Text>
              </View>
            )}

            {data.experiences?.length > 0 && (
              <View>
                <Text style={s.sectionTitle}>Pengalaman</Text>
                {data.experiences.map((exp, i) => (
                  <View key={i} style={{ marginBottom: 5 }}>
                    <Text style={s.expPosition}>{exp.position}</Text>
                    <View style={s.expCompanyDate}>
                      <Text style={s.expCompany}>{exp.company}</Text>
                      <Text>{formatPeriod(exp.startDate || exp.start_date, exp.endDate || exp.end_date, exp.isCurrent)}</Text>
                    </View>
                    {(exp.description || []).map((point, j) => (
                      <Text key={j} style={s.bul}>{'•'} {point}</Text>
                    ))}
                  </View>
                ))}
              </View>
            )}

            {data.educations?.length > 0 && (
              <View>
                <Text style={s.sectionTitle}>Pendidikan</Text>
                {data.educations.map((edu, i) => (
                  <View key={i} style={{ marginBottom: 4 }}>
                    <Text style={s.eduDegree}>{edu.degree}, {edu.field}</Text>
                    <View style={s.eduSchoolDate}>
                      <Text>{edu.institution}</Text>
                      <Text>{edu.startYear || edu.start_year} {'–'} {edu.endYear || edu.end_year || 'Sekarang'}</Text>
                    </View>
                    {edu.gpa && <Text style={s.eduDetail}>IPK: {edu.gpa}</Text>}
                    {edu.thesis && <Text style={s.eduThesis}>Tugas Akhir: {edu.thesis}</Text>}
                  </View>
                ))}
              </View>
            )}
          </View>

          <View style={s.rightCol}>
            {(skills.technical.length > 0 || skills.soft.length > 0) && (
              <View>
                <Text style={s.sectionTitle}>Keahlian</Text>
                {skills.technical.map((sk, i) => (
                  <Text key={`t-${i}`} style={s.skillItem}>{'•'} {typeof sk === 'string' ? sk : sk.name}</Text>
                ))}
                {skills.soft.map((sk, i) => (
                  <Text key={`s-${i}`} style={s.skillItem}>{'•'} {typeof sk === 'string' ? sk : sk.name || sk}</Text>
                ))}
              </View>
            )}

            {data.languages?.length > 0 && (
              <View>
                <Text style={s.sectionTitle}>Bahasa</Text>
                {data.languages.map((l, i) => (
                  <Text key={i} style={s.langItem}>{l.name}{l.level ? ` (${l.level})` : ''}</Text>
                ))}
              </View>
            )}

            {data.certifications?.length > 0 && (
              <View>
                <Text style={s.sectionTitle}>Sertifikasi</Text>
                {data.certifications.map((c, i) => (
                  <Text key={i} style={s.certItem}>{c.name}{c.issuer ? ' — ' + c.issuer : ''}{c.date ? ` (${formatDate(c.date)})` : ''}</Text>
                ))}
              </View>
            )}

            {data.projects?.length > 0 && (
              <View>
                <Text style={s.sectionTitle}>Proyek</Text>
                {data.projects.map((proj, i) => (
                  <View key={i} style={{ marginBottom: 4 }}>
                    <Text style={s.projName}>{proj.name}</Text>
                    {(proj.period || (proj.techStack || proj.tech_stack)?.length > 0) && (
                      <Text style={s.projMeta}>
                        {[proj.period, (proj.techStack || proj.tech_stack)?.join(', ')].filter(Boolean).join(' — ')}
                      </Text>
                    )}
                    {proj.description && <Text style={s.projDesc}>{proj.description}</Text>}
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
      </Page>
    </Document>
  )
}
