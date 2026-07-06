import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import { formatDate, formatPeriod, getSkills } from './templateUtils'

const red = '#DC2626'
const dark = '#1F2937'

const s = StyleSheet.create({
  page: { fontFamily: 'Helvetica', fontSize: 9.5, padding: 44, color: dark },
  header: { marginBottom: 20 },
  name: { fontSize: 26, fontWeight: 'bold', color: dark, letterSpacing: 1, marginBottom: 2 },
  jobTitle: { fontSize: 11, color: red, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 },
  contactRow: { fontSize: 8.5, color: '#666', lineHeight: 1.8 },
  sectionTitle: {
    fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 2,
    color: red, marginTop: 14, marginBottom: 7, paddingBottom: 3,
    borderBottomWidth: 2, borderBottomColor: red,
  },
  summary: { fontSize: 9.5, lineHeight: 1.6, color: '#374151', marginBottom: 4 },
  expGrid: { flexDirection: 'row', marginBottom: 7 },
  expLeft: { width: '28%', paddingRight: 10 },
  expRight: { width: '72%', borderLeftWidth: 2, borderLeftColor: '#FEE2E2', paddingLeft: 10 },
  expPosition: { fontWeight: 'bold', fontSize: 10, color: dark, marginBottom: 1 },
  expCompany: { fontSize: 8, color: red, fontStyle: 'italic', marginBottom: 1 },
  expDate: { fontSize: 8, color: '#888' },
  bul: { marginLeft: 0, marginBottom: 1, lineHeight: 1.4, fontSize: 8.5, color: '#374151' },
  eduGrid: { flexDirection: 'row', marginBottom: 5 },
  eduLeft: { width: '28%', paddingRight: 10 },
  eduRight: { width: '72%', borderLeftWidth: 2, borderLeftColor: '#DCFCE7', paddingLeft: 10 },
  eduDegree: { fontWeight: 'bold', fontSize: 10, color: dark, marginBottom: 1 },
  eduDetail: { fontSize: 8, color: '#666', marginBottom: 2, lineHeight: 1.4 },
  eduThesis: { fontSize: 8, color: '#999', fontStyle: 'italic', marginBottom: 2, marginLeft: 1 },
  skillContainer: { flexDirection: 'row', flexWrap: 'wrap', marginLeft: 0 },
  skillItemWrapper: { width: '50%' },
  skillItem: { marginBottom: 2, lineHeight: 1.4, fontSize: 9, color: '#374151' },
  certItem: { fontSize: 8.5, color: '#374151', lineHeight: 1.5, marginBottom: 1 },
  langItem: { fontSize: 8.5, color: '#374151', lineHeight: 1.5 },
  projRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 3, marginBottom: 1, alignItems: 'baseline' },
  projName: { fontWeight: 'bold', fontSize: 9.5, color: dark },
  projMeta: { fontSize: 8, color: '#999', fontStyle: 'italic', marginBottom: 1 },
  projDesc: { fontSize: 8.5, color: '#374151', lineHeight: 1.3 },
})

export function BoldImpactTemplate({ data }) {
  const skills = getSkills(data)
  const p = data.personal || {}

  return (
    <Document>
      <Page size="A4" style={s.page}>
        <View style={s.header}>
          <Text style={s.name}>{p.name || ''}</Text>
          {p.jobTitle && <Text style={s.jobTitle}>{p.jobTitle}</Text>}
          <Text style={s.contactRow}>
            {[p.email, p.phone, p.city, p.linkedin, p.github, p.portfolio].filter(Boolean).join('  •  ')}
          </Text>
        </View>

        {data.summary && (
          <View>
            <Text style={s.sectionTitle}>Profil Profesional</Text>
            <Text style={s.summary}>{data.summary}</Text>
          </View>
        )}

        {data.experiences?.length > 0 && (
          <View>
            <Text style={s.sectionTitle}>Pengalaman Kerja</Text>
            {data.experiences.map((exp, i) => (
              <View key={i} style={s.expGrid}>
                <View style={s.expLeft}>
                  <Text style={s.expDate}>{formatPeriod(exp.startDate || exp.start_date, exp.endDate || exp.end_date, exp.isCurrent)}</Text>
                </View>
                <View style={s.expRight}>
                  <Text style={s.expPosition}>{exp.position}</Text>
                  <Text style={s.expCompany}>{exp.company}</Text>
                  {(exp.description || []).map((point, j) => (
                    <Text key={j} style={s.bul}>{'•'} {point}</Text>
                  ))}
                </View>
              </View>
            ))}
          </View>
        )}

        {data.educations?.length > 0 && (
          <View>
            <Text style={s.sectionTitle}>Pendidikan</Text>
            {data.educations.map((edu, i) => (
              <View key={i} style={s.eduGrid}>
                <View style={s.eduLeft}>
                  <Text style={s.expDate}>{edu.startYear || edu.start_year} {'–'} {edu.endYear || edu.end_year || 'Sekarang'}</Text>
                </View>
                <View style={s.eduRight}>
                  <Text style={s.eduDegree}>{edu.degree}, {edu.field}</Text>
                  <Text style={s.eduDetail}>{edu.institution}{edu.gpa ? ' — IPK: ' + edu.gpa : ''}</Text>
                  {edu.thesis && <Text style={s.eduThesis}>Tugas Akhir: {edu.thesis}</Text>}
                </View>
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
                  <Text style={s.skillItem}>{'• '}{typeof sk === 'string' ? sk : sk.name}</Text>
                </View>
              ))}
              {skills.soft.map((sk, i) => (
                <View key={`s-${i}`} style={s.skillItemWrapper}>
                  <Text style={s.skillItem}>{'• '}{typeof sk === 'string' ? sk : sk.name || sk}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {data.certifications?.length > 0 && (
          <View>
            <Text style={s.sectionTitle}>Sertifikasi</Text>
            {data.certifications.map((c, i) => (
              <Text key={i} style={s.certItem}>{'•'} {c.name}{c.issuer ? ' — ' + c.issuer : ''}{c.date ? ` (${formatDate(c.date)})` : ''}</Text>
            ))}
          </View>
        )}

        {data.languages?.length > 0 && (
          <View>
            <Text style={s.sectionTitle}>Bahasa</Text>
              <Text style={s.langItem}>{data.languages.map((l) => `${l.name}${l.level ? ' — ' + l.level : ''}`).join('  •  ')}</Text>
          </View>
        )}

        {data.projects?.length > 0 && (
          <View>
            <Text style={s.sectionTitle}>Proyek</Text>
            {data.projects.map((proj, i) => (
              <View key={i} style={{ marginBottom: 5 }}>
                <View style={s.projRow}>
                  <Text style={s.projName}>{proj.name}</Text>
                  {proj.period && <Text style={s.projMeta}>{proj.period}</Text>}
                </View>
                {(proj.techStack || proj.tech_stack)?.length > 0 && (
                  <Text style={s.projMeta}>{(proj.techStack || proj.tech_stack).join(', ')}</Text>
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
