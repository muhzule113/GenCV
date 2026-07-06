import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import { formatDate, formatPeriod, getSkills } from './templateUtils'

const ink = '#1A1A1A'
const muted = '#999'

const s = StyleSheet.create({
  page: { fontFamily: 'Helvetica', fontSize: 9.5, padding: 48, color: ink },
  header: { marginBottom: 24 },
  name: { fontSize: 22, fontWeight: 'light', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 6, color: ink },
  jobTitle: { fontSize: 10, color: muted, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 },
  contactRow: { flexDirection: 'row', flexWrap: 'wrap', fontSize: 8, color: '#666', gap: 2 },
  contactSep: { marginHorizontal: 4, color: '#aaa' },
  contactItem: { fontSize: 8, color: '#666' },
  sectionTitle: {
    fontSize: 8, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 3,
    color: muted, marginTop: 20, marginBottom: 10,
  },
  summary: { fontSize: 9.5, lineHeight: 1.7, color: '#444', marginBottom: 4 },
  bul: { marginLeft: 8, marginBottom: 1, lineHeight: 1.5, fontSize: 9, color: '#444' },
  expBlock: { marginBottom: 10 },
  expPosition: { fontWeight: 'bold', fontSize: 10, color: ink, marginBottom: 1 },
  expMeta: { flexDirection: 'row', gap: 4, fontSize: 8.5, color: '#999', marginBottom: 3 },
  expCompany: { fontSize: 8.5, color: '#888', fontStyle: 'italic' },
  expDate: { fontSize: 8.5, color: '#aaa' },
  eduBlock: { marginBottom: 6 },
  eduDegree: { fontWeight: 'bold', fontSize: 10, color: ink, marginBottom: 1 },
  eduMeta: { flexDirection: 'row', gap: 6, fontSize: 8.5, color: '#888', marginBottom: 2 },
  eduThesis: { fontSize: 8.5, color: '#aaa', fontStyle: 'italic', marginBottom: 3, marginLeft: 1 },
  skillInline: { flexDirection: 'row', flexWrap: 'wrap', fontSize: 8.5, color: '#555', lineHeight: 1.8 },
  certItem: { fontSize: 9, color: '#555', lineHeight: 1.6, marginBottom: 1 },
  langItem: { fontSize: 9, color: '#555' },
  projBlock: { marginBottom: 6 },
  projName: { fontWeight: 'bold', fontSize: 9.5, color: ink, marginBottom: 1 },
  projMeta: { fontSize: 8, color: '#aaa', marginBottom: 2 },
  projDesc: { fontSize: 9, color: '#555', lineHeight: 1.4 },
})

export function MinimalistTemplate({ data }) {
  const skills = getSkills(data)
  const p = data.personal || {}

  return (
    <Document>
      <Page size="A4" style={s.page}>
        <View style={s.header}>
          <Text style={s.name}>{p.name || ''}</Text>
          {p.jobTitle && <Text style={s.jobTitle}>{p.jobTitle}</Text>}
          <View style={s.contactRow}>
            {[p.email, p.phone, p.city, p.linkedin, p.github, p.portfolio].filter(Boolean).map((c, i, arr) => (
              <View key={i} style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={s.contactItem}>{c}</Text>
                {i < arr.length - 1 && <Text style={s.contactSep}>/</Text>}
              </View>
            ))}
          </View>
        </View>

        {data.summary && (
          <View>
            <Text style={s.sectionTitle}>Tentang</Text>
            <Text style={s.summary}>{data.summary}</Text>
          </View>
        )}

        {data.experiences?.length > 0 && (
          <View>
            <Text style={s.sectionTitle}>Pengalaman</Text>
            {data.experiences.map((exp, i) => (
              <View key={i} style={s.expBlock}>
                <Text style={s.expPosition}>{exp.position}</Text>
                <View style={s.expMeta}>
                  <Text style={s.expCompany}>{exp.company}</Text>
                  <Text style={s.expDate}>{formatPeriod(exp.startDate || exp.start_date, exp.endDate || exp.end_date, exp.isCurrent)}</Text>
                </View>
                {(exp.description || []).map((point, j) => (
                  <Text key={j} style={s.bul}>— {point}</Text>
                ))}
              </View>
            ))}
          </View>
        )}

        {data.educations?.length > 0 && (
          <View>
            <Text style={s.sectionTitle}>Pendidikan</Text>
            {data.educations.map((edu, i) => (
              <View key={i} style={s.eduBlock}>
                <Text style={s.eduDegree}>{edu.degree}, {edu.field}</Text>
                <View style={s.eduMeta}>
                  <Text>{edu.institution}</Text>
                  <Text>{edu.startYear || edu.start_year} – {edu.endYear || edu.end_year || 'Sekarang'}</Text>
                  {edu.gpa && <Text>IPK: {edu.gpa}</Text>}
                </View>
                {edu.thesis && <Text style={s.eduThesis}>Tugas Akhir: {edu.thesis}</Text>}
              </View>
            ))}
          </View>
        )}

        {(skills.technical.length > 0 || skills.soft.length > 0) && (
          <View>
            <Text style={s.sectionTitle}>Keahlian</Text>
            <View style={s.skillContainer}>
              {skills.technical.map((sk, i) => (
                <View key={`t-${i}`} style={s.skillItemWrapper}>
                  <Text style={s.skillItem}>• {typeof sk === 'string' ? sk : sk.name}</Text>
                </View>
              ))}
              {skills.soft.map((sk, i) => (
                <View key={`s-${i}`} style={s.skillItemWrapper}>
                  <Text style={s.skillItem}>• {typeof sk === 'string' ? sk : sk.name || sk}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {data.certifications?.length > 0 && (
          <View>
            <Text style={s.sectionTitle}>Sertifikasi</Text>
            {data.certifications.map((c, i) => (
              <Text key={i} style={s.certItem}>{c.name}{c.issuer ? ` — ${c.issuer}` : ''}{c.date ? `, ${formatDate(c.date)}` : ''}</Text>
            ))}
          </View>
        )}

        {data.languages?.length > 0 && (
          <View>
            <Text style={s.sectionTitle}>Bahasa</Text>
            <Text style={s.langItem}>{data.languages.map((l) => `${l.name}${l.level ? ` — ${l.level}` : ''}`).join(' • ')}</Text>
          </View>
        )}

        {data.projects?.length > 0 && (
          <View>
            <Text style={s.sectionTitle}>Proyek</Text>
            {data.projects.map((proj, i) => (
              <View key={i} style={s.projBlock}>
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
      </Page>
    </Document>
  )
}
