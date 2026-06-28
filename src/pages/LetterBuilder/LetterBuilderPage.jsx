import { useState, useCallback, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Navbar from '../../components/common/Navbar'
import Button from '../../components/common/Button'
import Spinner from '../../components/common/Spinner'
import LetterForm from '../../components/letter/LetterForm'
import LetterEditor from '../../components/letter/LetterEditor'
import useLetter from '../../hooks/useLetter'
import useToastStore from '../../store/toastStore'
import api from '../../services/api'
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
 if (!form.cv_id) return 'Silakan pilih CV terlebih dahulu'
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
 if (!p.name) return 'Nama lengkap wajib diisi (dari CV)'
 return null
}

export default function LetterBuilderPage() {
 const { id: editId } = useParams()
 const navigate = useNavigate()
 const addToast = useToastStore((s) => s.addToast)
 const { letter, setLetter, generateLetter, saveLetter, deleteLetter, loading, saving, existingLetter, checkExistingLetter } = useLetter()
 const [form, setForm] = useState(buildInitialForm)
 const [pageLoading, setPageLoading] = useState(!!editId)

 useEffect(() => {
 if (!editId) return
 (async () => {
 try {
 const res = await api.get(`/api/letter/${editId}`)
 const d = res.data.data
 setLetter(d)
 const p = d.personal || {}
 setForm((prev) => ({
 ...prev,
 cv_id: d.cv_id || '',
 position: d.position || '',
 company: d.company || '',
 companyField: d.companyField || '',
 infoSource: d.infoSource || '',
 recipientTitle: d.recipientTitle || 'HRD',
 city: d.city || '',
 letterDate: d.letterDate || '',
 personal: {
 name: p.name || '',
 email: p.email || '',
 phone: p.phone || '',
 address: p.address || '',
 birthPlace: p.birthPlace || '',
 birthDate: p.birthDate || '',
 gender: p.gender || '',
 lastEducation: p.lastEducation || '',
 portfolio: p.portfolio || '',
 },
 }))
 } catch {
 addToast('Gagal memuat surat', 'error')
 navigate('/dashboard')
 } finally {
 setPageLoading(false)
 }
 })()
 // eslint-disable-next-line react-hooks/exhaustive-deps
 }, [editId])

 const handleViewExisting = useCallback(async (cvId) => {
 if (!cvId) return
 await checkExistingLetter(cvId)
 }, [checkExistingLetter])

 const handleGenerate = async () => {
 const err = validateForm(form)
 if (err) {
 addToast(err, 'error')
 return
 }
 await generateLetter(form)
 }

 const handleDeleteExisting = async () => {
 if (!existingLetter?.id) return
 const ok = await deleteLetter(existingLetter.id)
 if (ok) {
 addToast('Surat lama dihapus. Silakan generate ulang.', 'success')
 }
 }

 const fileName = `Surat_Lamaran_${sanitizeFileName(form.personal.name) || 'Pelamar'}_${sanitizeFileName(form.company) || 'Perusahaan'}.pdf`

 if (pageLoading) {
 return (
 <div className="min-h-screen bg-paper flex items-center justify-center">
 <Spinner size="lg" />
 </div>
 )
 }

 return (
 <div className="min-h-screen bg-paper ">
 <Navbar />
 <div className="container-page py-6">
 <button onClick={() => navigate('/dashboard')} className="flex items-center gap-1 text-sm text-muted hover:text-ink mb-4 transition-colors">
 <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
 Kembali ke Dashboard
 </button>

 <h1 className="font-display text-display tracking-display text-ink mb-6">
 {editId ? 'Edit Surat Lamaran' : 'Buat Surat Lamaran'}
 </h1>

 <div className="grid lg:grid-cols-5 gap-6">
 <div className="lg:col-span-2 card p-6">
 <LetterForm
 form={form}
 setForm={setForm}
 onGenerate={handleGenerate}
 onSaveDraft={saveLetter}
 saving={saving}
 loading={loading}
 hasContent={!!letter}
 existingLetter={existingLetter}
 onViewExisting={handleViewExisting}
 />
 </div>
 <div className="lg:col-span-3 card p-6">
 {existingLetter && !letter ? (
 <div className="space-y-4">
 <div className="border border-border p-6 text-center">
 <svg className="w-10 h-10 text-muted mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
 </svg>
 <p className="text-ink font-medium">Surat untuk CV ini sudah ada</p>
 <p className="text-muted text-sm mt-1">Hanya 1 surat per CV diperbolehkan.</p>
 <Button variant="danger" size="sm" onClick={handleDeleteExisting} className="mt-4">
 Hapus Surat & Buat Baru
 </Button>
 </div>
 </div>
 ) : (
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
 )}
 </div>
 </div>
 </div>
 </div>
 )
}