import { useEffect, useState, useCallback } from 'react'
import { flushSync } from 'react-dom'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import Navbar from '../../components/common/Navbar'
import Stepper from '../../components/common/Stepper'
import Button from '../../components/common/Button'
import Modal from '../../components/common/Modal'
import UnsavedChangesModal from '../../components/common/UnsavedChangesModal'
import { PageLoader } from '../../components/common/Skeleton'
import TemplatePicker from '../../components/cv/TemplatePicker'
import CVPreview from '../../components/cv/CVPreview'
import ATSScorePanel from '../../components/cv/ATSScorePanel'
import JSONImportModal from '../../components/cv/JSONImportModal'
import StepPersonal from '../../components/cv/CVForm/StepPersonal'
import StepSummary from '../../components/cv/CVForm/StepSummary'
import StepExperience from '../../components/cv/CVForm/StepExperience'
import StepEducation from '../../components/cv/CVForm/StepEducation'
import StepSkills from '../../components/cv/CVForm/StepSkills'
import useCVStore from '../../store/cvStore'
import useProfileStore from '../../store/profileStore'
import useCV from '../../hooks/useCV'
import useUnsavedChanges from '../../hooks/useUnsavedChanges'
import { useAutoSave } from '../../hooks/useAutoSave'
import { PDFDownloadLink } from '@react-pdf/renderer'
import { ATSCleanTemplate } from '../../components/cv/templates/ATSCleanTemplate'
import { ATSModernMinimalTemplate } from '../../components/cv/templates/ATSModernMinimalTemplate'
import { ExecutiveSerifTemplate } from '../../components/cv/templates/ExecutiveSerifTemplate'
import { CompactOnePageTemplate } from '../../components/cv/templates/CompactOnePageTemplate'
import { SidebarSlimTemplate } from '../../components/cv/templates/SidebarSlimTemplate'
import { AcademicMinimalTemplate } from '../../components/cv/templates/AcademicMinimalTemplate'
import { TechnicalMinimalTemplate } from '../../components/cv/templates/TechnicalMinimalTemplate'
import { FreshGraduateMinimalTemplate } from '../../components/cv/templates/FreshGraduateMinimalTemplate'
import { TimelineMinimalTemplate } from '../../components/cv/templates/TimelineMinimalTemplate'
import { TwoToneMinimalTemplate } from '../../components/cv/templates/TwoToneMinimalTemplate'

function getTemplateComponent(templateId, cvData) {
  switch (templateId) {
    case 'ats-modern-minimal-v1': return <ATSModernMinimalTemplate data={cvData} />
    case 'executive-serif-v1': return <ExecutiveSerifTemplate data={cvData} />
    case 'compact-onepage-v1': return <CompactOnePageTemplate data={cvData} />
    case 'sidebar-slim-v1': return <SidebarSlimTemplate data={cvData} />
    case 'academic-minimal-v1': return <AcademicMinimalTemplate data={cvData} />
    case 'technical-minimal-v1': return <TechnicalMinimalTemplate data={cvData} />
    case 'fresh-graduate-minimal-v1': return <FreshGraduateMinimalTemplate data={cvData} />
    case 'timeline-minimal-v1': return <TimelineMinimalTemplate data={cvData} />
    case 'two-tone-minimal-v1': return <TwoToneMinimalTemplate data={cvData} />
    default: return <ATSCleanTemplate data={cvData} />
  }
}

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
  const [searchParams] = useSearchParams()
  const { currentStep, setStep, cvData, updateData, templateId, setTemplateId, title, setTitle, reset } = useCVStore()
  const { generateSummary, saveDraft, loadCV } = useCV()
  const syncFromCV = useProfileStore((s) => s.syncFromCV)
  const [generating, setGenerating] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [templateModal, setTemplateModal] = useState(false)
  const [showATSModal, setShowATSModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [loadingCV, setLoadingCV] = useState(!!editId)
  const [dirty, setDirty] = useState(false)
  const { blocked, proceed, reset: clearBlocker } = useUnsavedChanges(dirty)
  const [showDashboardConfirm, setShowDashboardConfirm] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [draftName] = useState(() => editId ? `cv-${editId}` : `cv-${Date.now()}`)
  const { status: saveStatus } = useAutoSave(
    { cvData, templateId, title, currentStep },
    `gencv-draft-${draftName}`,
    { delay: 1000 }
  )

  useEffect(() => {
    if (!editId) {
      reset()
      const tplParam = searchParams.get('template')
      if (tplParam && ['ats-clean-v1', 'ats-modern-v1', 'modern-tech-v1', 'creative-v1', 'executive-v1', 'minimalist-v1', 'professional-v1', 'compact-v1', 'elegant-slate-v1', 'bold-impact-v1'].includes(tplParam)) {
        setTemplateId(tplParam)
      }
      setLoadingCV(false)
      return
    }
    let cancelled = false
    setLoadingCV(true)
    ;(async () => {
      const cv = await loadCV(editId)
      if (cancelled) return
      if (!cv) {
        setLoadingCV(false)
        return
      }
      if (cv.template_id) setTemplateId(cv.template_id)
      setStep(0)
      setLoadingCV(false)
      if (cv.data || cv) {
        syncFromCV(cv.data || cv)
      }
    })()
    return () => { cancelled = true }
  }, [editId, loadCV, reset, setTemplateId, setStep, syncFromCV, searchParams])

  const handleGenerate = async (params) => {
    setGenerating(true)
    const summary = await generateSummary(params)
    setGenerating(false)
    return summary
  }

  const handleImport = (data) => {
    updateData('personal', data.personal)
    updateData('summary', data.summary)
    updateData('experiences', data.experiences)
    updateData('educations', data.educations)
    updateData('skills', data.skills)
    updateData('projects', data.projects)
    updateData('certifications', data.certifications)
    updateData('languages', data.languages)
    syncFromCV(data)
    setDirty(true)
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
    <StepExperience key="exp" data={cvData} onChange={(f, v) => { setDirty(true); updateData(f, v); syncFromCV({ [f]: v }) }} />,
    <StepEducation key="edu" data={cvData} onChange={(f, v) => { setDirty(true); updateData(f, v); syncFromCV({ [f]: v }) }} />,
    <StepSkills key="skills" data={cvData} onChange={(f, v) => { setDirty(true); updateData(f, v); syncFromCV({ [f]: v }) }} />,
    <StepSummary key="summary" data={cvData} onChange={(f, v) => { setDirty(true); updateData(f, v); syncFromCV({ [f]: v }) }} onGenerate={handleGenerate} generating={generating} />,
    <div key="final" className="space-y-5">
      <div className="flex items-start sm:items-center justify-between gap-2">
        <div>
          <SectionLabel>Finalisasi</SectionLabel>
          <p className="text-sm text-muted mt-1">Pilih template dan download CV.</p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => setTemplateModal(true)} className="shrink-0">Ganti Template</Button>
      </div>
      <Input label="Judul CV" placeholder="CV Software Engineer 2026" value={title} onChange={(e) => { setDirty(true); setTitle(e.target.value) }} />
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
      <div className="container-page py-3 sm:py-4 lg:py-6">
        <div className="mb-3 sm:mb-4 lg:mb-6">
          <Stepper steps={steps} currentStep={currentStep} onStepClick={setStep} />
          <div className="flex items-center justify-between gap-2 mt-2">
            <Button variant="ghost" size="sm" onClick={() => setShowImportModal(true)} className="text-xs">
              <svg className="w-3.5 h-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Import JSON
            </Button>
            <span className={`text-xs ${
              saveStatus === 'saved' ? 'text-success' :
              saveStatus === 'saving' ? 'text-warning' :
              'text-danger'
            }`}>
              {saveStatus === 'saved' && <>&#10003; Auto-saved</>}
              {saveStatus === 'saving' && <>&#8635; Saving...</>}
              {saveStatus === 'error' && <>&#10007; Save failed</>}
            </span>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 lg:gap-6 pb-16">
          <div className="flex-1 card p-3 sm:p-4 lg:p-6">
            {loadingCV ? (
              <PageLoader text="Memuat CV..." />
            ) : (
              <>
                {stepComponents[currentStep]}
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
            <div className="lg:hidden space-y-3">
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

        {/* Fixed bottom action bar */}
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-[var(--card,#fff)] shadow-lg">
          <div className="container-page py-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-3">
            <div className="order-2 sm:order-1">
              {currentStep === 0 ? (
                <Button variant="ghost" onClick={handleDashboardClick}>Kembali ke Dashboard</Button>
              ) : currentStep === steps.length - 1 ? (
                <Button variant="ghost" onClick={handleDashboardClick}>Kembali ke Dashboard</Button>
              ) : (
                <Button variant="ghost" onClick={handlePrev}>Sebelumnya</Button>
              )}
            </div>
            <div className="flex gap-2 order-1 sm:order-2">
              {currentStep === steps.length - 1 ? (
                <>
                  <Button variant="secondary" loading={saving} onClick={handleSave} className="flex-1 sm:flex-none">
                    {editId ? 'Simpan Perubahan' : 'Simpan Draft'}
                  </Button>
                  <PDFDownloadLink
                    document={getTemplateComponent(templateId, cvData)}
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
        </div>
      </div>

      <Modal open={templateModal} onClose={() => setTemplateModal(false)} title="Pilih Template" size="lg">
        <TemplatePicker selected={templateId} onSelect={(id) => { setDirty(true); setTemplateId(id); setTemplateModal(false) }} />
      </Modal>
      <Modal open={showATSModal} onClose={() => setShowATSModal(false)} title="Skor ATS" size="lg">
        <ATSScorePanel data={cvData} noCard noPadding />
      </Modal>
      <JSONImportModal open={showImportModal} onClose={() => setShowImportModal(false)} onImport={handleImport} />
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
