import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import { formatDate, formatPeriod, getSkills } from './templateUtils'

const ink = '#1A1A1A'
const gold = '#B8860B'

const s = StyleSheet.create({
  page: { fontFamily: 'Helvetica', fontSize: 10, padding: 50, color: ink },
  header: { textAlign: 'center', marginBottom: 22, paddingBottom: 16, borderBottomWidth: 3, borderBottomColor: gold },
  name: { fontSize: 24, fontWeight: 'bold', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 6 },
  jobTitle: { fontSize: 11, color: '#555', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 10 },
  contactRow: { flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', fontSize: 9, color: '#555', gap: 2 },
  contactItem: { marginHorizontal: 6 },
  sectionTitle: {
    fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 2,
    color: gold, borderBottomWidth: 1, borderBottomColor: gold, paddingBottom: 3,
    marginTop: 18, marginBottom: 8,
  },
  summary: { fontSize: 9.5, lineHeight: 1.6, color: '#333', marginBottom: 4 },
  bul: { marginLeft: 12, marginBottom: 2, lineHeight: 1.5, fontSize: 9.5, color: '#333' },
  expHeader: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4, marginBottom: 2, alignItems: 'baseline' },
  expPosition: { fontWeight: 'bold', fontSize: 10.5, color: ink },
  expDate: { fontSize: 8.5, color: '#888' },
  expCompany: { fontSize: 9, color: '#555', marginBottom: 3, fontStyle: 'italic' },
  eduRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2, alignItems: 'baseline' },
  eduDegree: { fontWeight: 'bold', fontSize: 10, color: ink },
  eduYear: { fontSize: 8.5, color: '#888' },
  eduDetail: { fontSize: 9, color: '#555', marginBottom: 2 },
  eduThesis: { fontSize: 8.5, color: '#777', fontStyle: 'italic', marginBottom: 4, marginLeft: 1 },
  skillContainer: { flexDirection: 'row', flexWrap: 'wrap', marginLeft: 6 },
  skillItemWrapper: { width: '50%' },
  skillItem: { marginBottom: 2, lineHeight: 1.5, fontSize: 9.5, color: '#333' },
  projRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4, marginBottom: 1, alignItems: 'baseline' },
  projName: { fontWeight: 'bold', fontSize: 10, color: ink },
  projTech: { fontSize: 8.5, color: '#888', fontStyle: 'italic', marginBottom: 2 },
  projDesc: { fontSize: 9, color: '#333', lineHeight: 1.4, marginBottom: 3 },
  certItem: { fontSize: 9, color: '#333', lineHeight: 1.5, marginBottom: 1 },
  langItem: { fontSize: 9, color: '#333', lineHeight: 1.5 },
})

export function ExecutiveTemplate({ data }) {
  const skills = getSkills(data)
  const p = data.personal || {}

  return (
    <Document>
      <Page size="A4" style={s.page}>
        <View style={s.header}>
          <Text style={s.name}>{p.name || ''}</Text>
          {p.jobTitle && <Text style={s.jobTitle}>{p.jobTitle}</Text>}
          <View style={s.contactRow}>
            {[p.email, p.phone, p.city].filter(Boolean).map((c, i) => (
              <Text key={i} style={s.contactItem}>{c}</Text>
            ))}
          </View>
          <View style={{ marginTop: 4, ...s.contactRow }}>
            {[p.linkedin, p.github, p.portfolio].filter(Boolean).map((c, i) => (
              <Text key={i} style={s.contactItem}>{c}</Text>
            ))}
          </View>
        </View>

        {data.summary && (
          <View>
            <Text style={s.sectionTitle}>Ringkasan Eksekutif</Text>
            <Text style={s.summary}>{data.summary}</Text>
          </View>
        )}

        {data.experiences?.length > 0 && (
          <View>
            <Text style={s.sectionTitle}>Pengalaman Profesional</Text>
            {data.experiences.map((exp, i) => (
              <View key={i} style={{ marginBottom: 8 }}>
                <View style={s.expHeader}>
                  <Text style={s.expPosition}>{exp.position}</Text>
                  <Text style={s.expDate}>{formatPeriod(exp.startDate || exp.start_date, exp.endDate || exp.end_date, exp.isCurrent)}</Text>
                </View>
                <Text style={s.expCompany}>{exp.company}</Text>
                {(exp.description || []).map((point, j) => (
                  <Text key={j} style={s.bul}>• {point}</Text>
                ))}
              </View>
            ))}
          </View>
        )}

        {data.educations?.length > 0 && (
          <View>
            <Text style={s.sectionTitle}>Pendidikan</Text>
            {data.educations.map((edu, i) => (
              <View key={i} style={{ marginBottom: 5 }}>
                <View style={s.eduRow}>
                  <Text style={s.eduDegree}>{edu.degree}, {edu.field}</Text>
                  <Text style={s.eduYear}>{edu.startYear || edu.start_year} – {edu.endYear || edu.end_year || 'Sekarang'}</Text>
                </View>
                <Text style={s.eduDetail}>{edu.institution}{edu.gpa ? ` — IPK: ${edu.gpa}` : ''}</Text>
                {edu.thesis && <Text style={s.eduThesis}>Tugas Akhir: {edu.thesis}</Text>}
              </View>
            ))}
          </View>
        )}

        {skills.technical.length > 0 && (
          <View>
            <Text style={s.sectionTitle}>Kompetensi Inti</Text>
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
              <Text key={i} style={s.certItem}>• {c.name}{c.issuer ? ` — ${c.issuer}` : ''}{c.date ? ` (${formatDate(c.date)})` : ''}</Text>
            ))}
          </View>
        )}

        {data.languages?.length > 0 && (
          <View>
            <Text style={s.sectionTitle}>Bahasa</Text>
            <Text style={s.langItem}>{data.languages.map((l) => `${l.name}${l.level ? ` — ${l.level}` : ''}`).join('  •  ')}</Text>
          </View>
        )}

        {data.projects?.length > 0 && (
          <View>
            <Text style={s.sectionTitle}>Proyek</Text>
            {data.projects.map((proj, i) => (
              <View key={i} style={{ marginBottom: 5 }}>
                <View style={s.projRow}>
                  <Text style={s.projName}>{proj.name}</Text>
                  {proj.period && <Text style={s.projTech}>{proj.period}</Text>}
                </View>
                {(proj.techStack || proj.tech_stack)?.length > 0 && (
                  <Text style={s.projTech}>{(proj.techStack || proj.tech_stack).join(', ')}</Text>
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
