import { useState, useCallback, useEffect } from 'react'
import { flushSync } from 'react-dom'
import { useNavigate, useParams } from 'react-router-dom'
import Navbar from '../../components/common/Navbar'
import Button from '../../components/common/Button'
import Spinner from '../../components/common/Spinner'
import Modal from '../../components/common/Modal'
import UnsavedChangesModal from '../../components/common/UnsavedChangesModal'
import LetterForm from '../../components/letter/LetterForm'
import LetterEditor from '../../components/letter/LetterEditor'
import useLetter from '../../hooks/useLetter'
import useUnsavedChanges from '../../hooks/useUnsavedChanges'
import { useAutoSave } from '../../hooks/useAutoSave'
import useToastStore from '../../store/toastStore'
import useConfirmStore from '../../store/confirmStore'
import api from '../../services/api'
import { PDFDownloadLink } from '@react-pdf/renderer'
import { CoverLetterTemplate } from '../../components/letter/CoverLetterTemplate'

const defaultAttachments = ['cv', 'foto', 'ktp', 'ijazah', 'transkrip']

function SectionLabel({ children }) {
  return <span className="font-mono text-[11px] tracking-widest text-clip uppercase">{children}</span>
}

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
  const { letter, setLetter, generateLetter, saveLetter, deleteLetter, loading, saving: hookSaving, existingLetter, checkExistingLetter } = useLetter()
  const requestConfirm = useConfirmStore((s) => s.requestConfirm)
  const [form, setForm] = useState(buildInitialForm)
  const [pageLoading, setPageLoading] = useState(!!editId)
  const [showPreview, setShowPreview] = useState(false)
  const [initialSkills, setInitialSkills] = useState(null)
  const [dirty, setDirty] = useState(false)
  const [draftSaving, setDraftSaving] = useState(false)
  const { blocked, proceed, reset: clearBlocker } = useUnsavedChanges(dirty)
  const [showDashboardConfirm, setShowDashboardConfirm] = useState(false)
  const [draftName] = useState(() => editId ? `letter-${editId}` : `letter-${Date.now()}`)
  const { status: saveStatus } = useAutoSave(
    form,
    `gencv-draft-${draftName}`,
    { delay: 1000 }
  )

  const handleSetForm = useCallback((updater) => {
    setDirty(true)
    setForm(updater)
  }, [setForm])

  useEffect(() => {
    if (!editId) return
      ; (async () => {
        try {
          const res = await api.get(`/api/letter/${editId}`)
          const d = res.data.data
          setLetter(d)
          if (d.skills) setInitialSkills(d.skills)
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

  useEffect(() => {
    if (letter) setShowPreview(true)
  }, [letter])

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
    if (!await requestConfirm('Generate surat AI akan memakai')) return
    await generateLetter(form)
  }

  const handleDeleteExisting = async () => {
    if (!existingLetter?.id) return
    const ok = await deleteLetter(existingLetter.id)
    if (ok) {
      addToast('Surat lama dihapus. Silakan generate ulang.', 'success')
    }
  }

  const handleSaveDraft = useCallback(async () => {
    setDraftSaving(true)
    const ok = await saveLetter(form)
    setDraftSaving(false)
    if (ok) {
      // flushSync memaksa React flush state secara synchronous
      // sehingga useBlocker membaca dirty=false sebelum navigate dipanggil
      flushSync(() => {
        setDirty(false)
      })
      // Tunggu 1.5 detik agar toast terlihat, baru navigate
      setTimeout(() => {
        navigate('/dashboard')
      }, 1500)
    }
  }, [saveLetter, form, navigate])

  const handleQuickSave = useCallback(async () => {
    setDraftSaving(true)
    await saveLetter(form)
    setDraftSaving(false)
    setDirty(false)
    proceed?.()
  }, [saveLetter, proceed, form])

  const handleDiscard = useCallback(() => {
    setDirty(false)
    proceed?.()
  }, [proceed])

  const handleCancelNav = useCallback(() => {
    clearBlocker?.()
  }, [clearBlocker])

  const handleDashboardClick = useCallback(() => {
    if (dirty) setShowDashboardConfirm(true)
    else navigate('/dashboard')
  }, [dirty, navigate])
  const handleDashboardSave = useCallback(async () => {
    setDraftSaving(true)
    await saveLetter(form)
    setDraftSaving(false)
    flushSync(() => {
      setDirty(false)
      setShowDashboardConfirm(false)
    })
    navigate('/dashboard')
  }, [saveLetter, form, navigate])

  const handleDashboardDiscard = useCallback(() => {
    flushSync(() => {
      setDirty(false)
      setShowDashboardConfirm(false)
    })
    navigate('/dashboard')
  }, [navigate])


  const handleDashboardCancel = useCallback(() => {
    setShowDashboardConfirm(false)
  }, [])

  const fileName = `Surat_Lamaran_${sanitizeFileName(form.personal.name) || 'Pelamar'}_${sanitizeFileName(form.company) || 'Perusahaan'}.pdf`

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-paper">
      <Navbar onDashboard={handleDashboardClick} />
      <div className="container-page py-4 sm:py-6">
        <button onClick={handleDashboardClick} className="flex items-center gap-1 text-sm text-muted hover:text-ink mb-3 sm:mb-4 transition-colors duration-150">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
          Kembali ke Dashboard
        </button>

        <div className="mb-4 sm:mb-6">
          <SectionLabel>{editId ? 'Edit Surat' : 'Surat Lamaran'}</SectionLabel>
          <h1 className="font-display text-h1 sm:text-display tracking-display text-ink mt-1">
            {editId ? 'Edit Surat Lamaran' : 'Buat Surat Lamaran'}
          </h1>
          <span className={`text-xs mt-1 inline-block ${
            saveStatus === 'saved' ? 'text-success' :
            saveStatus === 'saving' ? 'text-warning' :
            'text-danger'
          }`}>
            {saveStatus === 'saved' && <>&#10003; Auto-saved</>}
            {saveStatus === 'saving' && <>&#8635; Saving...</>}
            {saveStatus === 'error' && <>&#10007; Save failed</>}
          </span>
        </div>
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
          <div className="lg:w-1/2 lg:shrink-0 card p-4 sm:p-6">
            <LetterForm
              form={form}
              setForm={handleSetForm}
              onGenerate={handleGenerate}
              onSaveDraft={handleSaveDraft}
              saving={hookSaving}
              loading={loading}
              existingLetter={existingLetter}
              onViewExisting={handleViewExisting}
              initialSkills={initialSkills}
            />
          </div>
          <div className="lg:flex-1 min-w-0">
            <div className="lg:hidden mb-3">
              <Button variant="secondary" className="w-full" onClick={() => setShowPreview(!showPreview)}>
                {showPreview ? 'Sembunyikan Preview' : 'Lihat Preview Surat'}
              </Button>
            </div>
            <div className={`${showPreview ? 'block' : 'hidden'} lg:block`}>
              {existingLetter && !letter ? (
                <div className="border border-warning p-4 sm:p-6">
                  <svg className="w-8 h-8 sm:w-10 sm:h-10 text-warning mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                  </svg>
                  <p className="text-ink font-medium text-center">Surat untuk CV ini sudah ada</p>
                  <p className="text-muted text-sm text-center mt-1">
                    Klik <span className="text-ink font-medium">Generate Ulang Surat</span> untuk menimpa isi, atau hapus surat lama.
                  </p>
                  <div className="flex flex-col sm:flex-row justify-center gap-2 mt-4">
                    <Button size="sm" onClick={handleGenerate} loading={loading}>
                      Generate Ulang
                    </Button>
                    <Button variant="danger" size="sm" onClick={handleDeleteExisting}>
                      Hapus Surat Lama
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col bg-surface border border-border">
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
              )}
            </div>
          </div>
        </div>
      </div>

      <UnsavedChangesModal
        open={blocked}
        onSave={handleQuickSave}
        onDiscard={handleDiscard}
        onCancel={handleCancelNav}
        saving={draftSaving}
      />
      <Modal
        open={showDashboardConfirm}
        onClose={handleDashboardCancel}
        title="Simpan Perubahan?"
        size="sm"
        actions={
          <>
            <Button variant="ghost" size="sm" onClick={handleDashboardCancel}>Batal</Button>
            <Button variant="secondary" size="sm" onClick={handleDashboardDiscard}>Jangan Simpan</Button>
            <Button size="sm" onClick={handleDashboardSave} loading={draftSaving}>Simpan Draft</Button>
          </>
        }
      >
        <p className="text-sm text-muted">
          Anda memiliki perubahan yang belum disimpan. Apakah Anda ingin menyimpan draft terlebih dahulu?
        </p>
      </Modal>
    </div>
  )
}
