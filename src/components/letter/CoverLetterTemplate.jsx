import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Times-Roman',
    fontSize: 12,
    paddingTop: 70,
    paddingBottom: 70,
    paddingLeft: 85,
    paddingRight: 70,
    color: '#000',
    lineHeight: 1.5,
  },
  cityDate: {
    textAlign: 'right',
    marginBottom: 18,
    fontSize: 12,
  },
  recipient: {
    marginBottom: 2,
    fontSize: 12,
  },
  greeting: {
    marginTop: 10,
    marginBottom: 10,
    fontSize: 12,
  },
  intro: {
    marginBottom: 6,
    fontSize: 12,
  },
  dataRow: {
    flexDirection: 'row',
    marginBottom: 2,
    fontSize: 12,
  },
  dataLabel: {
    width: 150,
  },
  dataSep: {
    width: 8,
  },
  dataValue: {
    flex: 1,
  },
  dataBlock: {
    marginBottom: 12,
  },
  bodyText: {
    marginBottom: 10,
    fontSize: 12,
    textAlign: 'justify',
  },
  positionBold: {
    fontFamily: 'Times-Bold',
    textTransform: 'uppercase',
  },
  perihalRow: {
    flexDirection: 'row',
    marginTop: 8,
    marginBottom: 4,
    fontSize: 12,
  },
  perihalLabel: {
    width: 50,
    fontFamily: 'Times-Bold',
  },
  perihalSep: {
    width: 8,
  },
  perihalValue: {
    flex: 1,
  },
  attachmentIntro: {
    marginBottom: 4,
    fontSize: 12,
  },
  attachmentItem: {
    flexDirection: 'row',
    marginBottom: 2,
    fontSize: 12,
    paddingLeft: 24,
  },
  attachmentBullet: {
    width: 16,
  },
  closing: {
    marginTop: 10,
    marginBottom: 10,
    fontSize: 12,
    textAlign: 'justify',
  },
  signatureBlock: {
    marginTop: 18,
    marginLeft: '55%',
  },
  signatureLine: {
    fontSize: 12,
    marginBottom: 36,
  },
  signatureName: {
    fontSize: 12,
    fontFamily: 'Times-Bold',
  },
})

const attachmentLabels = {
  cv: 'Curriculum Vitae (CV)',
  foto: 'Pas Foto 3x4',
  ktp: 'Fotokopi KTP',
  ijazah: 'Fotokopi Ijazah',
  transkrip: 'Fotokopi Transkrip Nilai',
  sertifikat: 'Sertifikat Pendukung',
}

const defaultAttachmentKeys = ['cv', 'foto', 'ktp', 'ijazah', 'transkrip']

function buildAttachmentList(data) {
  const raw = data.attachments
  if (Array.isArray(raw) && raw.length > 0) {
    const looksLikeKeys = typeof raw[0] === 'string' && raw[0].length <= 16 && !raw[0].includes(' ')
    if (looksLikeKeys) return raw.map((k) => attachmentLabels[k] || k)
    return raw
  }
  return defaultAttachmentKeys.map((k) => attachmentLabels[k])
}

function formatBirthPlaceDate(p) {
  if (!p) return ''
  const place = p.birthPlace || ''
  const date = p.birthDate || ''
  if (place && date) return `${place}, ${date}`
  return place || date
}

function splitParagraphs(content) {
  if (!content) return []
  return content.split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean)
}

export function CoverLetterTemplate({ data }) {
  const p = data.personal || {}
  const ttl = formatBirthPlaceDate(p)
  const attachments = buildAttachmentList(data)
  const position = (data.position || '').toUpperCase()
  const paragraphs = splitParagraphs(data.content)

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.cityDate}>{data.city || 'Barru'}, {data.date || '12 Juni 2026'}</Text>

        <Text style={styles.recipient}>Kepada Yth.</Text>
        <Text style={styles.recipient}>{data.recipientTitle || 'HRD'}</Text>
        <Text style={styles.recipient}>Di {data.company || '[NAMA PERUSAHAAN]'}</Text>

        <View style={styles.perihalRow}>
          <Text style={styles.perihalLabel}>Perihal</Text>
          <Text style={styles.perihalSep}>: </Text>
          <Text style={styles.perihalValue}>Lamaran Pekerjaan sebagai <Text style={styles.positionBold}>{position || '[POSISI]'}</Text></Text>
        </View>

        <Text style={styles.greeting}>Dengan hormat,</Text>

        <Text style={styles.intro}>Saya yang bertanda tangan di bawah ini :</Text>

        <View style={styles.dataBlock}>
          {p.name && (
            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>Nama</Text>
              <Text style={styles.dataSep}>:</Text>
              <Text style={styles.dataValue}>{p.name}</Text>
            </View>
          )}
          {ttl && (
            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>Tempat, Tgl Lahir</Text>
              <Text style={styles.dataSep}>:</Text>
              <Text style={styles.dataValue}>{ttl}</Text>
            </View>
          )}
          {p.gender && (
            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>Jenis Kelamin</Text>
              <Text style={styles.dataSep}>:</Text>
              <Text style={styles.dataValue}>{p.gender}</Text>
            </View>
          )}
          {p.lastEducation && (
            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>Pendidikan</Text>
              <Text style={styles.dataSep}>:</Text>
              <Text style={styles.dataValue}>{p.lastEducation}</Text>
            </View>
          )}
          {p.address && (
            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>Alamat</Text>
              <Text style={styles.dataSep}>:</Text>
              <Text style={styles.dataValue}>{p.address}</Text>
            </View>
          )}
          {p.phone && (
            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>Nomor HP</Text>
              <Text style={styles.dataSep}>:</Text>
              <Text style={styles.dataValue}>{p.phone}</Text>
            </View>
          )}
          {p.email && (
            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>E-mail</Text>
              <Text style={styles.dataSep}>:</Text>
              <Text style={styles.dataValue}>{p.email}</Text>
            </View>
          )}
          {p.portfolio && (
            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>Portofolio</Text>
              <Text style={styles.dataSep}>:</Text>
              <Text style={styles.dataValue}>{p.portfolio}</Text>
            </View>
          )}
        </View>

        <Text style={styles.bodyText}>
          Dengan ini mengajukan lamaran sebagai <Text style={styles.positionBold}>{position || '[POSISI]'}</Text>, bersama
          ini saya lampirkan dokumen persyaratan sebagai berikut:
        </Text>

        <View>
          {attachments.map((label, i) => (
            <View key={i} style={styles.attachmentItem}>
              <Text style={styles.attachmentBullet}>&#8226;</Text>
              <Text>{label}</Text>
            </View>
          ))}
        </View>

        {paragraphs.map((para, i) => (
          <Text key={i} style={styles.closing}>{para}</Text>
        ))}

        <View style={styles.signatureBlock}>
          <Text style={styles.signatureLine}>Hormat saya,</Text>
          <Text style={styles.signatureName}>( {p.name || '[Nama Lengkap]'} )</Text>
        </View>
      </Page>
    </Document>
  )
}
