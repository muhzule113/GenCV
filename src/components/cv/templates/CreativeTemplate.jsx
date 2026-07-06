import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import { formatPeriod, getSkills } from './templateUtils'

const accent = '#7C3AED'
const darkSide = '#2E1065'

const s = StyleSheet.create({
  page: { fontFamily: 'Helvetica', fontSize: 9, color: '#1E293B', flexDirection: 'row' },
  sidebar: { width: '30%', backgroundColor: darkSide, padding: 20, paddingTop: 28, color: '#F8FAFC' },
  avatarCircle: {
    width: 64, height: 64, borderRadius: 32, backgroundColor: accent,
    alignSelf: 'center', marginBottom: 12, alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 20, color: '#F8FAFC', fontWeight: 'bold' },
  sideName: { fontSize: 14, fontWeight: 'bold', color: '#F8FAFC', textAlign: 'center', marginBottom: 2 },
  sideJob: { fontSize: 8, color: '#C4B5FD', textAlign: 'center', marginBottom: 16, letterSpacing: 1, textTransform: 'uppercase' },
  sideSection: { marginTop: 12, marginBottom: 4 },
  sideSectionTitle: {
    fontSize: 9, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1,
    color: '#C4B5FD', marginBottom: 7, paddingBottom: 3,
    borderBottomWidth: 1, borderBottomColor: accent,
  },
  sideText: { fontSize: 8, color: '#E2E8F0', lineHeight: 1.6, marginBottom: 3 },
  sideLink: { fontSize: 8, color: '#A78BFA', lineHeight: 1.6, marginBottom: 1 },
  skillContainer: { flexDirection: 'row', flexWrap: 'wrap', marginLeft: 0 },
  skillItemWrapper: { width: '50%' },
  skillItem: { marginBottom: 2, lineHeight: 1.4, fontSize: 8, color: '#E2E8F0' },
  langChip: { fontSize: 8, color: '#C4B5FD', marginBottom: 2 },

  main: { width: '70%', padding: 24, backgroundColor: '#FAFAFA' },
  mainSectionTitle: {
    fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1,
    color: accent, marginTop: 14, marginBottom: 8, paddingBottom: 4,
    borderBottomWidth: 2, borderBottomColor: accent,
  },
  summary: { fontSize: 9, lineHeight: 1.5, color: '#475569', fontStyle: 'italic', marginBottom: 4 },
  expCard: { marginBottom: 8, paddingLeft: 10, borderLeftWidth: 2, borderLeftColor: accent },
  expPosition: { fontSize: 10, fontWeight: 'bold', color: '#1E293B' },
  expCompany: { fontSize: 8, color: '#64748B', marginBottom: 3 },
  expBul: { fontSize: 8, color: '#475569', lineHeight: 1.4, marginLeft: 8, marginBottom: 1 },
  eduCard: { marginBottom: 6, paddingLeft: 10, borderLeftWidth: 2, borderLeftColor: '#10B981' },
  eduRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 1, alignItems: 'baseline' },
  eduDegree: { fontSize: 9, fontWeight: 'bold', color: '#1E293B' },
  eduYear: { fontSize: 8, color: '#64748B' },
  eduDetail: { fontSize: 8, color: '#475569', marginBottom: 3 },
  eduThesis: { fontSize: 8, color: '#64748B', fontStyle: 'italic', marginBottom: 4, marginLeft: 1 },
  certItem: { fontSize: 8, color: '#475569', lineHeight: 1.4, marginBottom: 1 },
  projCard: { marginBottom: 5, paddingLeft: 10, borderLeftWidth: 2, borderLeftColor: '#F59E0B' },
})

export function CreativeTemplate({ data }) {
  const skills = getSkills(data)
  const p = data.personal || {}

  return (
    <Document>
      <Page size="A4" style={s.page}>
        <View style={s.sidebar}>
          <View style={s.avatarCircle}>
            <Text style={s.avatarText}>{(p.name || 'X').charAt(0).toUpperCase()}</Text>
          </View>
          <Text style={s.sideName}>{p.name || ''}</Text>
          {p.jobTitle && <Text style={s.sideJob}>{p.jobTitle}</Text>}

          {(p.email || p.phone || p.city) && (
            <View style={s.sideSection}>
              <Text style={s.sideSectionTitle}>Kontak</Text>
              {p.email && <Text style={s.sideText}>{'\u2709'}  {p.email}</Text>}
              {p.phone && <Text style={s.sideText}>{'\u260E'}  {p.phone}</Text>}
              {p.city && <Text style={s.sideText}>{'\u2302'}  {p.city}</Text>}
            </View>
          )}

          {(p.linkedin || p.github || p.portfolio) && (
            <View style={s.sideSection}>
              <Text style={s.sideSectionTitle}>Tautan</Text>
              {p.linkedin && <Text style={s.sideLink}>{'\u2192'} {p.linkedin}</Text>}
              {p.github && <Text style={s.sideLink}>{'\u2192'} {p.github}</Text>}
              {p.portfolio && <Text style={s.sideLink}>{'\u2192'} {p.portfolio}</Text>}
            </View>
          )}

          {skills.technical.length > 0 && (
            <View style={s.sideSection}>
              <Text style={s.sideSectionTitle}>Keahlian</Text>
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

          {data.languages?.length > 0 && (
            <View style={s.sideSection}>
              <Text style={s.sideSectionTitle}>Bahasa</Text>
              {data.languages.map((l, i) => (
                <Text key={i} style={s.langChip}>{'\u2666'}  {l.name}{l.level ? ` (${l.level})` : ''}</Text>
              ))}
            </View>
          )}
        </View>

        <View style={s.main}>
          {data.summary && (
            <View>
              <Text style={s.mainSectionTitle}>Profil</Text>
              <Text style={s.summary}>{data.summary}</Text>
            </View>
          )}

          {data.experiences?.length > 0 && (
            <View>
              <Text style={s.mainSectionTitle}>Pengalaman</Text>
              {data.experiences.map((exp, i) => (
                <View key={i} style={s.expCard}>
                  <Text style={s.expPosition}>{exp.position}</Text>
                  <Text style={s.expCompany}>
                    {exp.company} — {formatPeriod(exp.startDate || exp.start_date, exp.endDate || exp.end_date, exp.isCurrent)}
                  </Text>
                  {(exp.description || []).map((point, j) => (
                    <Text key={j} style={s.expBul}>• {point}</Text>
                  ))}
                </View>
              ))}
            </View>
          )}

          {data.educations?.length > 0 && (
            <View>
              <Text style={s.mainSectionTitle}>Pendidikan</Text>
              {data.educations.map((edu, i) => (
                <View key={i} style={s.eduCard}>
                  <View style={s.eduRow}>
                    <Text style={s.eduDegree}>{edu.degree} — {edu.institution}</Text>
                    <Text style={s.eduYear}>{edu.startYear || edu.start_year} – {edu.endYear || edu.end_year || 'Sekarang'}</Text>
                  </View>
                  <Text style={s.eduDetail}>{edu.field}{edu.gpa ? `, IPK: ${edu.gpa}` : ''}</Text>
                  {edu.thesis && <Text style={s.eduThesis}>Tugas Akhir: {edu.thesis}</Text>}
                </View>
              ))}
            </View>
          )}

          {data.certifications?.length > 0 && (
            <View>
              <Text style={s.mainSectionTitle}>Sertifikasi</Text>
              {data.certifications.map((c, i) => (
                <Text key={i} style={s.certItem}>• {c.name}{c.issuer ? ` — ${c.issuer}` : ''}</Text>
              ))}
            </View>
          )}

          {data.projects?.length > 0 && (
            <View>
              <Text style={s.mainSectionTitle}>Proyek</Text>
              {data.projects.map((proj, i) => (
                <View key={i} style={s.projCard}>
                  <Text style={s.expPosition}>{proj.name}</Text>
                  <Text style={s.expCompany}>{proj.period || ''}</Text>
                  {proj.description && <Text style={s.expBul}>{proj.description}</Text>}
                </View>
              ))}
            </View>
          )}
        </View>
      </Page>
    </Document>
  )
}
