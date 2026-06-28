import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Navbar from '../../components/common/Navbar'
import Stepper from '../../components/common/Stepper'
import Button from '../../components/common/Button'
import Modal from '../../components/common/Modal'
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
import { PDFDownloadLink } from '@react-pdf/renderer'
import { ATSCleanTemplate } from '../../components/cv/templates/ATSCleanTemplate'
import { ATSModernTemplate } from '../../components/cv/templates/ATSModernTemplate'

const steps = ['Data Diri', 'Pengalaman', 'Pendidikan', 'Keahlian & Proyek', 'Ringkasan', 'Template & Preview']

export default function CVBuilderPage() {
 const navigate = useNavigate()
 const { id: editId } = useParams()
 const { currentStep, setStep, cvData, updateData, setCvData, templateId, setTemplateId, title, setTitle, reset } = useCVStore()
 const { generateSummary, saveDraft, loadCV } = useCV()
 const [generating, setGenerating] = useState(false)
 const [showPreview, setShowPreview] = useState(false)
 const [templateModal, setTemplateModal] = useState(false)
 const [saving, setSaving] = useState(false)
 const [loadingCV, setLoadingCV] = useState(!!editId)
 const [loadError, setLoadError] = useState(null)

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
 if (result?.id && !editId) {
 navigate(`/cv/${result.id}/edit`, { replace: true })
 }
 }

 const handleNext = () => {
 if (currentStep < steps.length - 1) setStep(currentStep + 1)
 }

 const handlePrev = () => {
 if (currentStep > 0) setStep(currentStep - 1)
 else navigate('/dashboard')
 }

 const stepComponents = [
 <StepPersonal key="personal" data={cvData} onChange={updateData} />,
 <StepExperience key="exp" data={cvData} onChange={(f, v) => updateData(f, v)} />,
 <StepEducation key="edu" data={cvData} onChange={(f, v) => updateData(f, v)} />,
 <StepSkills key="skills" data={cvData} onChange={(f, v) => updateData(f, v)} />,
 <StepSummary key="summary" data={cvData} onChange={(f, v) => updateData(f, v)} onGenerate={handleGenerate} generating={generating} />,
 <div key="final" className="space-y-5">
 <div className="flex items-center justify-between">
 <div>
 <h3 className="text-lg font-semibold text-ink mb-1">Finalisasi CV</h3>
 <p className="text-sm text-muted ">Pilih template dan download CV Anda.</p>
 </div>
 <Button variant="secondary" size="sm" onClick={() => setTemplateModal(true)}>Ganti Template</Button>
 </div>
 <Input label="Judul CV" placeholder="CV Software Engineer 2026" value={title} onChange={(e) => setTitle(e.target.value)} />
 <TemplatePicker selected={templateId} onSelect={(id) => { setTemplateId(id); setTemplateModal(false) }} />
 </div>,
 ]

 return (
 <div className="min-h-screen bg-paper ">
 <Navbar />
 <div className="container-page py-6">
 <div className="mb-6">
 <Stepper steps={steps} currentStep={currentStep} onStepClick={setStep} />
 </div>

 <div className="flex flex-col lg:flex-row gap-6">
 <div className="flex-1 card p-6">
 {loadingCV ? (
 <PageLoader text="Memuat CV..." />
 ) : (
 <>
 {stepComponents[currentStep]}

 <div className="flex items-center justify-between mt-8 pt-6 border-t border-border ">
 <Button variant="ghost" onClick={handlePrev}>
 {currentStep === 0 ? 'Kembali ke Dashboard' : 'Sebelumnya'}
 </Button>
 <div className="flex gap-3">
 {currentStep === steps.length - 1 ? (
 <>
 <Button variant="secondary" loading={saving} onClick={handleSave}>
 {editId ? 'Simpan Perubahan' : 'Simpan Draft'}
 </Button>
 <PDFDownloadLink
 document={templateId === 'ats-modern-v1' ? <ATSModernTemplate data={cvData} /> : <ATSCleanTemplate data={cvData} />}
 fileName={`${cvData.personal?.name?.replace(/\s+/g, '-') || 'CV'}-CV.pdf`}
 >
 {({ loading: pdfLoading }) => (
 <Button loading={pdfLoading}>{pdfLoading ? 'Menyiapkan...' : 'Download PDF'}</Button>
 )}
 </PDFDownloadLink>
 </>
 ) : (
 <Button onClick={handleNext}>{currentStep === steps.length - 2 ? 'Review & Final' : 'Selanjutnya'}</Button>
 )}
 </div>
 </div>
 </>
 )}
 </div>

 <div className="lg:w-[45%] xl:w-[42%]">
 <div className="hidden lg:block lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)] space-y-4 overflow-y-auto">
 <p className="text-sm text-muted ">Preview CV</p>
 <CVPreview data={cvData} templateId={templateId} />
 <ATSScorePanel data={cvData} />
 </div>
 <div className="lg:hidden space-y-4">
 <Button variant="secondary" className="w-full" onClick={() => setShowPreview(!showPreview)}>
 {showPreview ? 'Sembunyikan Preview' : 'Lihat Preview'}
 </Button>
 {showPreview && (
 <div>
 <CVPreview data={cvData} templateId={templateId} />
 </div>
 )}
 <ATSScorePanel data={cvData} />
 </div>
 </div>
 </div>
 </div>

 <Modal open={templateModal} onClose={() => setTemplateModal(false)} title="Pilih Template" size="lg">
 <TemplatePicker selected={templateId} onSelect={(id) => { setTemplateId(id); setTemplateModal(false) }} />
 </Modal>
 </div>
 )
}

function Input({ label, value, onChange, placeholder, type = 'text' }) {
 return (
 <div>
 {label && <label className="block text-sm text-ink mb-1.5">{label}</label>}
 <input type={type} value={value} onChange={onChange} placeholder={placeholder}
 className="field"
 />
 </div>
 )
}
