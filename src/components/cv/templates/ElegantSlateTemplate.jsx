import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import { formatDate, formatPeriod, getSkills } from './templateUtils'

const slate = '#334155'
const accent = '#0EA5E9'

const s = StyleSheet.create({
  page: { fontFamily: 'Helvetica', fontSize: 9.5, padding: 0, color: slate },
  header: { backgroundColor: '#F8FAFC', borderBottomWidth: 3, borderBottomColor: accent, padding: 32, paddingBottom: 20, marginBottom: 0 },
  name: { fontSize: 22, fontWeight: 'bold', color: slate, letterSpacing: 1, marginBottom: 4 },
  jobTitle: { fontSize: 10, color: accent, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 },
  contactRow: { flexDirection: 'row', flexWrap: 'wrap', fontSize: 8, color: '#64748B', gap: 2 },
  contactItem: { marginRight: 12 },
  body: { padding: 32, paddingTop: 20 },
  sectionTitle: {
    fontSize: 9, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 2,
    color: accent, marginTop: 16, marginBottom: 8, paddingBottom: 3,
    borderBottomWidth: 1, borderBottomColor: '#E2E8F0',
  },
  summary: { fontSize: 9.5, lineHeight: 1.6, color: slate, marginBottom: 4 },
  bul: { marginLeft: 12, marginBottom: 2, lineHeight: 1.4, fontSize: 9, color: '#475569' },
  expBlock: { marginBottom: 8 },
  expPosition: { fontWeight: 'bold', fontSize: 10, color: '#1E293B' },
  expCompanyLine: { flexDirection: 'row', justifyContent: 'space-between', fontSize: 8, marginBottom: 3 },
  expCompany: { fontStyle: 'italic', color: '#64748B' },
  expDate: { fontSize: 8, color: '#94A3B8' },
  eduBlock: { marginBottom: 5 },
  eduRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 1, alignItems: 'baseline' },
  eduDegree: { fontWeight: 'bold', fontSize: 9.5, color: '#1E293B' },
  eduYear: { fontSize: 8, color: '#94A3B8' },
  eduDetail: { fontSize: 8.5, color: '#64748B', marginBottom: 2 },
  eduThesis: { fontSize: 8, color: '#94A3B8', fontStyle: 'italic', marginBottom: 3, marginLeft: 1 },
  skillContainer: { flexDirection: 'row', flexWrap: 'wrap', marginLeft: 12 },
  skillItemWrapper: { width: '50%' },
  skillItem: { marginBottom: 2, lineHeight: 1.4, fontSize: 9, color: '#475569' },
  projRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 3, marginBottom: 1, alignItems: 'baseline' },
  projName: { fontWeight: 'bold', fontSize: 9.5, color: '#1E293B' },
  projMeta: { fontSize: 8, color: '#94A3B8', fontStyle: 'italic', marginBottom: 1 },
  projDesc: { fontSize: 8.5, color: '#475569', lineHeight: 1.3, marginBottom: 2 },
  certItem: { fontSize: 8.5, color: '#475569', lineHeight: 1.5, marginBottom: 1 },
  langItem: { fontSize: 8.5, color: '#475569', lineHeight: 1.5 },
})

export function ElegantSlateTemplate({ data }) {
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

        <View style={s.body}>
          {data.summary && (
            <View>
              <Text style={s.sectionTitle}>Ringkasan</Text>
              <Text style={s.summary}>{data.summary}</Text>
            </View>
          )}

          {data.experiences?.length > 0 && (
            <View>
              <Text style={s.sectionTitle}>Pengalaman</Text>
              {data.experiences.map((exp, i) => (
                <View key={i} style={s.expBlock}>
                  <Text style={s.expPosition}>{exp.position}</Text>
                  <View style={s.expCompanyLine}>
                    <Text style={s.expCompany}>{exp.company}</Text>
                    <Text style={s.expDate}>{formatPeriod(exp.startDate || exp.start_date, exp.endDate || exp.end_date, exp.isCurrent)}</Text>
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
                <View key={i} style={s.eduBlock}>
                  <View style={s.eduRow}>
                    <Text style={s.eduDegree}>{edu.degree}, {edu.field}</Text>
                    <Text style={s.eduYear}>{edu.startYear || edu.start_year} {'–'} {edu.endYear || edu.end_year || 'Sekarang'}</Text>
                  </View>
                  <Text style={s.eduDetail}>{edu.institution}{edu.gpa ? ' — IPK: ' + edu.gpa : ''}</Text>
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
        </View>
      </Page>
    </Document>
  )
}
