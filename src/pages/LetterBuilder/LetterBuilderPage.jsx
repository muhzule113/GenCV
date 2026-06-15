import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../../components/common/Navbar'
import LetterForm from '../../components/letter/LetterForm'
import LetterEditor from '../../components/letter/LetterEditor'
import useLetter from '../../hooks/useLetter'
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

export default function LetterBuilderPage() {
  const navigate = useNavigate()
  const { letterContent, setLetterContent, generateLetter, loading } = useLetter()
  const today = new Date().toISOString().split('T')[0]
  const [form, setForm] = useState({
    cv_id: '',
    position: '',
    company: '',
    companyField: '',
    infoSource: '',
    recipientTitle: 'HRD',
    city: '',
    letterDate: today,
    highlights: [],
  })

  const handleGenerate = async () => {
    if (!form.position || !form.company) {
      alert('Mohon isi posisi dan nama perusahaan terlebih dahulu')
      return
    }
    if (!form.infoSource) {
      alert('Mohon pilih sumber informasi lowongan')
      return
    }
    await generateLetter({
      cv_id: form.cv_id,
      position: form.position,
      company: form.company,
      companyField: form.companyField,
      infoSource: form.infoSource,
      recipientTitle: form.recipientTitle,
      highlights: form.highlights,
    })
  }

  const LetterPDF = ({ content }) => (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.text}>{content}</Text>
      </Page>
    </Document>
  )

  return (
    <div className="min-h-screen bg-surface-2 dark:bg-surface-dark">
      <Navbar />
      <div className="container-page py-6">
        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-1 text-sm text-text-muted dark:text-text-muted-dark hover:text-primary mb-4 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Kembali ke Dashboard
        </button>

        <h1 className="text-h2 text-text-primary dark:text-text-primary-dark mb-6">Buat Surat Lamaran</h1>

        <div className="grid lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2 bg-white dark:bg-slate-800 border border-border dark:border-border-dark rounded-card p-6">
            <LetterForm form={form} setForm={setForm} onGenerate={handleGenerate} loading={loading} hasContent={!!letterContent} />
          </div>
          <div className="lg:col-span-3 bg-white dark:bg-slate-800 border border-border dark:border-border-dark rounded-card p-6">
            <LetterEditor
              content={letterContent}
              onChange={setLetterContent}
              onDownload={() => {
                if (letterContent) {
                  const link = document.createElement('a')
                  link.download = 'Surat-Lamaran.pdf'
                  link.click()
                }
              }}
            />
            {letterContent && (
              <div className="mt-4 text-right">
                <PDFDownloadLink
                  document={<LetterPDF content={letterContent} />}
                  fileName="Surat-Lamaran.pdf"
                >
                  {({ loading: pdfLoading }) => (
                    <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-lg font-medium text-sm transition-colors">
                      {pdfLoading ? 'Menyiapkan...' : 'Download PDF'}
                    </button>
                  )}
                </PDFDownloadLink>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 12,
    padding: 60,
    color: '#1a1a1a',
    lineHeight: 1.6,
  },
  text: {
    whiteSpace: 'pre-wrap',
  },
})
