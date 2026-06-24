import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../../components/common/Navbar'
import Button from '../../components/common/Button'
import LetterForm from '../../components/letter/LetterForm'
import LetterEditor from '../../components/letter/LetterEditor'
import useLetter from '../../hooks/useLetter'
import { PDFDownloadLink } from '@react-pdf/renderer'
import { CoverLetterTemplate } from '../../components/letter/CoverLetterTemplate'

const defaultAttachments = ['cv', 'foto', 'ktp', 'ijazah', 'transkrip']

function sanitizeFileName(s) {
  return String(s || '').trim().replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_-]/g, '')
}

function buildInitialForm() {
  return {
    cv_id: '',
    position: '',
    company: '',
    companyField: '',
    infoSource: '',
    recipientTitle: 'HRD',
    city: '',
    letterDate: new Date().toISOString().split('T')[0],
    highlights: [],
    attachments: defaultAttachments,
    customAttachment: '',
    relevantExperience: '',
    personal: {
      name: '',
      email: '',
      phone: '',
      address: '',
      birthPlace: '',
      birthDate: '',
      gender: '',
      lastEducation: '',
      portfolio: '',
    },
  }
}

function validateForm(form) {
  const required = [
    ['position', 'Posisi yang dilamar'],
    ['company', 'Nama perusahaan'],
    ['recipientTitle', 'Divisi / Departemen tujuan'],
    ['city', 'Kota'],
    ['letterDate', 'Tanggal surat'],
  ]
  for (const [k, label] of required) {
    if (!form[k] || !String(form[k]).trim()) return `${label} wajib diisi`
  }
  const p = form.personal || {}
  const personalRequired = [
    ['name', 'Nama lengkap'],
    ['birthPlace', 'Tempat, tanggal lahir'],
    ['gender', 'Jenis kelamin'],
    ['lastEducation', 'Pendidikan terakhir'],
    ['address', 'Alamat'],
    ['phone', 'Nomor HP'],
    ['email', 'E-mail'],
  ]
  for (const [k, label] of personalRequired) {
    if (!p[k] || !String(p[k]).trim()) return `${label} wajib diisi`
  }
  return null
}

export default function LetterBuilderPage() {
  const navigate = useNavigate()
  const { letter, generateLetter, saveLetter, loading, saving } = useLetter()
  const [form, setForm] = useState(buildInitialForm)

  const handleGenerate = async () => {
    const err = validateForm(form)
    if (err) {
      alert(err)
      return
    }
    await generateLetter(form)
  }

  const fileName = `Surat_Lamaran_${sanitizeFileName(form.personal.name) || 'Pelamar'}_${sanitizeFileName(form.company) || 'Perusahaan'}.pdf`

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
            <LetterForm form={form} setForm={setForm} onGenerate={handleGenerate} onSaveDraft={saveLetter} saving={saving} loading={loading} hasContent={!!letter} />
          </div>
          <div className="lg:col-span-3 bg-white dark:bg-slate-800 border border-border dark:border-border-dark rounded-card p-6">
            <LetterEditor
              letter={letter}
              pdfButton={
                letter ? (
                  <PDFDownloadLink
                    document={<CoverLetterTemplate data={letter} />}
                    fileName={fileName}
                  >
                    {({ loading: pdfLoading }) => (
                      <Button size="sm" loading={pdfLoading}>
                        {pdfLoading ? 'Menyiapkan...' : 'Download PDF'}
                      </Button>
                    )}
                  </PDFDownloadLink>
                ) : null
              }
            />
          </div>
        </div>
      </div>
    </div>
  )
}
