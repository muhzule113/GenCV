import { useEffect, useState, useCallback } from 'react'
import { flushSync } from 'react-dom'
import { useNavigate, useParams } from 'react-router-dom'
import Navbar from '../../components/common/Navbar'
import Stepper from '../../components/common/Stepper'
import Button from '../../components/common/Button'
import Modal from '../../components/common/Modal'
import UnsavedChangesModal from '../../components/common/UnsavedChangesModal'
import { PageLoader } from '../../components/common/Skeleton'
import TemplatePicker from '../../components/cv/TemplatePicker'
import CVPreview from '../../components/cv/CVPreview'
import ATSScorePanel from '../../components/cv/ATSScorePanel'
import StepPersonal from '../../components/cv/CVForm/StepPersonal'
import StepSummary from '../../components/cv/CVForm/StepSummary'
import StepExperience from '../../components/cv/CVForm/StepExperience'
import StepEducation from '../../components/cv/CVForm/StepEducation'
import StepSkills from '../../components/cv/CVForm/StepSkills'
import useCVStore from '../../store/cvStore'
import useCV from '../../hooks/useCV'
import useUnsavedChanges from '../../hooks/useUnsavedChanges'
import { PDFDownloadLink } from '@react-pdf/renderer'
import { ATSCleanTemplate } from '../../components/cv/templates/ATSCleanTemplate'
import { ATSModernTemplate } from '../../components/cv/templates/ATSModernTemplate'

const steps = ['Data Diri', 'Pengalaman', 'Pendidikan', 'Keahlian & Proyek', 'Ringkasan', 'Template & Preview']

function SectionLabel({ children }) {
  return <span className="font-mono text-[11px] tracking-widest text-clip uppercase">{children}</span>
}

function Input({ label, value, onChange, placeholder, type = 'text' }) {
  return (
    <div>
      {label && <label className="block text-sm text-ink mb-1.5">{label}</label>}
      <input type={type} value={value} onChange={onChange} placeholder={placeholder} className="field" />
    </div>
  )
}

export default function CVBuilderPage() {
  const navigate = useNavigate()
  const { id: editId } = useParams()
  const { currentStep, setStep, cvData, updateData, templateId, setTemplateId, title, setTitle, reset } = useCVStore()
  const { generateSummary, saveDraft, loadCV } = useCV()
  const [generating, setGenerating] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [templateModal, setTemplateModal] = useState(false)
  const [showATSModal, setShowATSModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [loadingCV, setLoadingCV] = useState(!!editId)
  const [loadError, setLoadError] = useState(null)
  const [dirty, setDirty] = useState(false)
  const { blocked, proceed, reset: clearBlocker } = useUnsavedChanges(dirty)
  const [showDashboardConfirm, setShowDashboardConfirm] = useState(false)

  useEffect(() => {
    if (!editId) {
      reset()
      setLoadingCV(false)
      setLoadError(null)
      return
    }
    let cancelled = false
    setLoadingCV(true)
    setLoadError(null)
    ;(async () => {
      const cv = await loadCV(editId)
      if (cancelled) return
      if (!cv) {
        setLoadError('CV tidak ditemukan atau gagal dimuat')
        setLoadingCV(false)
        return
      }
      if (cv.template_id) setTemplateId(cv.template_id)
      setStep(0)
      setLoadingCV(false)
    })()
    return () => { cancelled = true }
  }, [editId, loadCV, reset, setTemplateId, setStep])

  const handleGenerate = async (params) => {
    setGenerating(true)
    const summary = await generateSummary(params)
    setGenerating(false)
    return summary
  }

  const handleSave = async () => {
    setSaving(true)
    const result = await saveDraft(editId)
    setSaving(false)
    if (result) {
      flushSync(() => setDirty(false))
      navigate('/dashboard')
    }
  }

  const handleQuickSave = useCallback(async () => {
    setSaving(true)
    await saveDraft(editId)
    setSaving(false)
    setDirty(false)
    proceed?.()
  }, [editId, saveDraft, proceed])

  const handleDiscard = useCallback(() => {
    setDirty(false)
    proceed?.()
  }, [proceed])

  const handleCancelNav = useCallback(() => {
    clearBlocker?.()
  }, [clearBlocker])

  const handleNext = () => {
    if (currentStep < steps.length - 1) setStep(currentStep + 1)
  }

  const handlePrev = () => {
    if (currentStep > 0) setStep(currentStep - 1)
    else if (dirty) setShowDashboardConfirm(true)
    else {
      flushSync(() => setDirty(false))
      navigate('/dashboard')
    }
  }

  const handleCvDataChange = useCallback((field, value) => {
    setDirty(true)
    updateData(field, value)
  }, [updateData])

  const stepComponents = [
    <StepPersonal key="personal" data={cvData} onChange={handleCvDataChange} />,
    <StepExperience key="exp" data={cvData} onChange={(f, v) => { setDirty(true); updateData(f, v) }} />,
    <StepEducation key="edu" data={cvData} onChange={(f, v) => { setDirty(true); updateData(f, v) }} />,
    <StepSkills key="skills" data={cvData} onChange={(f, v) => { setDirty(true); updateData(f, v) }} />,
    <StepSummary key="summary" data={cvData} onChange={(f, v) => { setDirty(true); updateData(f, v) }} onGenerate={handleGenerate} generating={generating} />,
    <div key="final" className="space-y-5">
      <div className="flex items-start sm:items-center justify-between gap-2">
        <div>
          <SectionLabel>Finalisasi</SectionLabel>
          <p className="text-sm text-muted mt-1">Pilih template dan download CV.</p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => setTemplateModal(true)} className="shrink-0">Ganti Template</Button>
      </div>
      <Input label="Judul CV" placeholder="CV Software Engineer 2026" value={title} onChange={(e) => { setDirty(true); setTitle(e.target.value) }} />
      <TemplatePicker selected={templateId} onSelect={(id) => { setDirty(true); setTemplateId(id); setTemplateModal(false) }} />
    </div>,
  ]

  const handleDashboardClick = useCallback(() => {
    if (dirty) setShowDashboardConfirm(true)
    else navigate('/dashboard')
  }, [dirty, navigate])

  const handleDashboardSave = useCallback(async () => {
    setSaving(true)
    await saveDraft(editId)
    setSaving(false)
    flushSync(() => {
      setDirty(false)
      setShowDashboardConfirm(false)
    })
    navigate('/dashboard')
  }, [editId, saveDraft, navigate])

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

  return (
    <div className="min-h-screen bg-paper">
      <Navbar onDashboard={handleDashboardClick} />
      <div className="container-page py-4 sm:py-6">
        <div className="mb-4 sm:mb-6">
          <Stepper steps={steps} currentStep={currentStep} onStepClick={setStep} />
        </div>

        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
          <div className="flex-1 card p-4 sm:p-6">
            {loadingCV ? (
              <PageLoader text="Memuat CV..." />
            ) : (
              <>
                {stepComponents[currentStep]}

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between mt-6 sm:mt-8 pt-5 sm:pt-6 border-t border-border gap-3">
                  <Button variant="ghost" onClick={handlePrev} className="order-2 sm:order-1">
                    {currentStep === 0 ? 'Kembali ke Dashboard' : 'Sebelumnya'}
                  </Button>
                  {currentStep === steps.length - 1 && (
                    <Button variant="ghost" onClick={handleDashboardClick} className="order-2 sm:order-1">
                      Kembali ke Dashboard
                    </Button>
                  )}
                  <div className="flex gap-2 sm:gap-3 order-1 sm:order-2">
                    {currentStep === steps.length - 1 ? (
                      <>
                        <Button variant="secondary" loading={saving} onClick={handleSave} className="flex-1 sm:flex-none">
                          {editId ? 'Simpan Perubahan' : 'Simpan Draft'}
                        </Button>
                        <PDFDownloadLink
                          document={templateId === 'ats-modern-v1' ? <ATSModernTemplate data={cvData} /> : <ATSCleanTemplate data={cvData} />}
                          fileName={`${cvData.personal?.name?.replace(/\s+/g, '-') || 'CV'}-CV.pdf`}
                        >
                          {({ loading: pdfLoading }) => (
                            <Button loading={pdfLoading} className="flex-1 sm:flex-none">{pdfLoading ? 'Menyiapkan...' : 'Download PDF'}</Button>
                          )}
                        </PDFDownloadLink>
                      </>
                    ) : (
                      <Button onClick={handleNext} className="w-full sm:w-auto">{currentStep === steps.length - 2 ? 'Review & Final' : 'Selanjutnya'}</Button>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="lg:w-[55%] xl:w-[52%]">
            <div className="hidden lg:block lg:sticky lg:top-6 max-h-[calc(100vh-3rem)]">
              <div className="flex flex-col bg-surface border border-border h-full max-h-[calc(100vh-3rem)]">
                <div className="border-b border-border shrink-0">
                  <button
                    onClick={() => setShowATSModal(true)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-ink/5 transition-colors text-left group"
                  >
                    <svg className="w-4 h-4 text-ink shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <span className="font-mono text-[11px] tracking-widest text-clip uppercase">Skor ATS</span>
                    <span className="ml-auto text-xs text-muted group-hover:text-ink transition-colors">Lihat Detail →</span>
                  </button>
                </div>
                <CVPreview data={cvData} templateId={templateId} noBorder />
              </div>
            </div>
            <div className="lg:hidden space-y-4">
              <button
                onClick={() => setShowATSModal(true)}
                className="w-full flex items-center gap-3 px-4 py-3 bg-surface border border-border hover:bg-ink/5 transition-colors text-left group"
              >
                <svg className="w-4 h-4 text-ink shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span className="font-mono text-[11px] tracking-widest text-clip uppercase">Skor ATS</span>
                <span className="ml-auto text-xs text-muted group-hover:text-ink transition-colors">Lihat Detail →</span>
              </button>
              <Button variant="secondary" className="w-full" onClick={() => setShowPreview(!showPreview)}>
                {showPreview ? 'Sembunyikan Preview' : 'Lihat Preview'}
              </Button>
              {showPreview && (
                <div>
                  <CVPreview data={cvData} templateId={templateId} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Modal open={templateModal} onClose={() => setTemplateModal(false)} title="Pilih Template" size="lg">
        <TemplatePicker selected={templateId} onSelect={(id) => { setTemplateId(id); setTemplateModal(false) }} />
      </Modal>
      <Modal open={showATSModal} onClose={() => setShowATSModal(false)} title="Skor ATS" size="lg">
        <ATSScorePanel data={cvData} noCard noPadding />
      </Modal>
      <UnsavedChangesModal
        open={blocked}
        onSave={handleQuickSave}
        onDiscard={handleDiscard}
        onCancel={handleCancelNav}
        saving={saving}
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
            <Button size="sm" onClick={handleDashboardSave} loading={saving}>Simpan Draft</Button>
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
