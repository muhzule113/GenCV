import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 11,
    paddingTop: 50,
    paddingBottom: 50,
    paddingLeft: 60,
    paddingRight: 60,
    color: '#000',
    lineHeight: 1.5,
  },
  cityDate: {
    textAlign: 'right',
    marginBottom: 20,
    fontSize: 11,
  },
  recipient: {
    marginBottom: 4,
    fontSize: 11,
  },
  greeting: {
    marginTop: 12,
    marginBottom: 12,
    fontSize: 11,
  },
  dataRow: {
    flexDirection: 'row',
    marginBottom: 2,
    fontSize: 11,
  },
  dataLabel: {
    width: 80,
    fontWeight: 'normal',
  },
  dataValue: {
    flex: 1,
  },
  dataBlock: {
    marginBottom: 12,
  },
  bodyText: {
    marginBottom: 10,
    fontSize: 11,
    textAlign: 'justify',
  },
  attachmentBlock: {
    marginTop: 8,
    marginBottom: 10,
  },
  attachmentItem: {
    flexDirection: 'row',
    marginBottom: 2,
    fontSize: 11,
    paddingLeft: 20,
  },
  bullet: {
    width: 15,
  },
  closing: {
    marginTop: 10,
    marginBottom: 10,
    fontSize: 11,
    textAlign: 'justify',
  },
  signature: {
    marginTop: 30,
    fontSize: 11,
  },
  signatureName: {
    marginTop: 40,
    fontSize: 11,
    fontWeight: 'bold',
  },
})

export function CoverLetterTemplate({ data }) {
  const defaultAttachments = ['Curriculum Vitae (CV)', 'Pas Foto 3x4', 'Fotokopi KTP', 'Fotokopi Ijazah', 'Fotokopi Transkrip Nilai']
  const attachments = data.attachments?.length ? data.attachments : defaultAttachments

  const contentParagraph = data.content
    ? data.content
    : `Dengan ini mengajukan lamaran sebagai ${data.position || '[POSISI]'} di ${data.companyName || '[PERUSAHAAN]'} yang Bapak/Ibu pimpin. Saya memiliki motivasi tinggi untuk bergabung dan memberikan kontribusi terbaik bagi perusahaan. Sebagai bahan pertimbangan, berikut saya lampirkan dokumen-dokumen yang diperlukan.`

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.cityDate}>{data.city || 'Barru'}, {data.date || '12 Juni 2026'}</Text>

        <Text style={styles.recipient}>Kepada Yth.</Text>
        {data.recipientTitle && <Text style={styles.recipient}>{data.recipientTitle}</Text>}
        <Text style={styles.recipient}>di {data.companyName || '[PERUSAHAAN]'}</Text>
        <Text style={styles.recipient}>Di Tempat</Text>

        <Text style={styles.greeting}>Dengan hormat,</Text>

        <View style={styles.dataBlock}>
          {data.personal?.name && (
            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>Nama</Text>
              <Text style={styles.dataValue}>: {data.personal.name}</Text>
            </View>
          )}
          {(data.personal?.birthPlace || data.personal?.birthDate) && (
            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>Tempat, Tgl Lahir</Text>
              <Text style={styles.dataValue}>: {data.personal.birthPlace || ''}{data.personal.birthPlace && data.personal.birthDate ? ', ' : ''}{data.personal.birthDate || ''}</Text>
            </View>
          )}
          {data.personal?.gender && (
            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>Jenis Kelamin</Text>
              <Text style={styles.dataValue}>: {data.personal.gender}</Text>
            </View>
          )}
          {data.personal?.lastEducation && (
            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>Pendidikan</Text>
              <Text style={styles.dataValue}>: {data.personal.lastEducation}</Text>
            </View>
          )}
          {data.personal?.address && (
            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>Alamat</Text>
              <Text style={styles.dataValue}>: {data.personal.address}</Text>
            </View>
          )}
          {data.personal?.phone && (
            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>No. HP</Text>
              <Text style={styles.dataValue}>: {data.personal.phone}</Text>
            </View>
          )}
          {data.personal?.email && (
            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>Email</Text>
              <Text style={styles.dataValue}>: {data.personal.email}</Text>
            </View>
          )}
          {data.personal?.portfolio && (
            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>Portofolio</Text>
              <Text style={styles.dataValue}>: {data.personal.portfolio}</Text>
            </View>
          )}
        </View>

        <Text style={styles.bodyText}>{contentParagraph}</Text>

        <View style={styles.attachmentBlock}>
          <Text style={{ marginBottom: 4, fontSize: 11 }}>Adapun lampiran yang saya sertakan sebagai berikut:</Text>
          {attachments.map((item, i) => (
            <View key={i} style={styles.attachmentItem}>
              <Text style={styles.bullet}>-</Text>
              <Text>{item}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.closing}>
          Demikian surat lamaran ini saya buat dengan sebenarnya. Besar harapan saya dapat diterima di perusahaan yang Bapak/Ibu pimpin. Atas perhatian dan kesempatan yang diberikan, saya ucapkan terima kasih.
        </Text>

        <Text style={styles.signature}>Hormat saya,</Text>
        <Text style={styles.signatureName}>( {data.personal?.name || '[Nama Lengkap]'} )</Text>
      </Page>
    </Document>
  )
}
