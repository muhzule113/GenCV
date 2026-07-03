import { useState, useEffect, useRef } from 'react'
import TagInput from '../../common/TagInput'
import Input from '../../common/Input'
import Button from '../../common/Button'
import Modal from '../../common/Modal'
import AIActionChip from '../../common/AIActionChip'
import { recommendSkills } from '../../../services/aiService'
import useToastStore from '../../../store/toastStore'
import useAuthStore from '../../../store/authStore'
import useConfirmStore from '../../../store/confirmStore'

export default function StepSkills({ data, onChange }) {
  const addToast = useToastStore((s) => s.addToast)
  const fetchTokenBalance = useAuthStore((s) => s.fetchTokenBalance)
  const requestConfirm = useConfirmStore((s) => s.requestConfirm)
  
  const updateSkills = (field) => (tags) => {
    onChange('skills', { ...data.skills, [field]: tags })
  }

  const addLanguage = () => {
    onChange('languages', [...(data.languages || []), { name: '', level: '' }])
  }

  const updateLang = (index, field, value) => {
    const updated = [...(data.languages || [])]
    updated[index] = { ...updated[index], [field]: value }
    onChange('languages', updated)
  }

  const removeLang = (index) => {
    onChange('languages', (data.languages || []).filter((_, i) => i !== index))
  }

  const addProject = () => {
    onChange('projects', [...data.projects, { name: '', description: '', techStack: [], tech_stack: [], period: '' }])
  }

  const updateProject = (index, field, value) => {
    const updated = [...data.projects]
    updated[index] = { ...updated[index], [field]: value }
    onChange('projects', updated)
  }

  const removeProject = (index) => {
    onChange('projects', data.projects.filter((_, i) => i !== index))
  }

  const addCert = () => {
    onChange('certifications', [...(data.certifications || []), { name: '', issuer: '' }])
  }

  const updateCert = (index, field, value) => {
    const updated = [...(data.certifications || [])]
    updated[index] = { ...updated[index], [field]: value }
    onChange('certifications', updated)
  }

  const removeCert = (index) => {
    onChange('certifications', (data.certifications || []).filter((_, i) => i !== index))
  }

  const [aiModalOpen, setAiModalOpen] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiSuggestions, setAiSuggestions] = useState([])
  const [aiSelected, setAiSelected] = useState(new Set())

  const [openHelp, setOpenHelp] = useState(null)
  const helpRef = useRef(null)
  
  useEffect(() => {
    const onDocClick = (e) => {
      if (helpRef.current && !helpRef.current.contains(e.target)) setOpenHelp(null)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [])

  const openAiRecommend = async () => {
    const position = data.personal?.jobTitle?.trim() || ''
    if (!position) {
      addToast('Isi Posisi/Jabatan di step Data Diri dulu untuk dapat rekomendasi.', 'error')
      return
    }
    if (!await requestConfirm('Fitur ini akan menggunakan')) return
    setAiModalOpen(true)
    setAiLoading(true)
    setAiSuggestions([])
    setAiSelected(new Set())
    try {
      const existing = data.skills?.technical || []
      const result = await recommendSkills({ position, existingSkills: existing })
      setAiSuggestions(result || [])
    } catch (err) {
      addToast('Gagal mendapatkan rekomendasi skill', 'error')
    } finally {
      setAiLoading(false)
    }
  }

  const toggleAiSelected = (skill) => {
    setAiSelected((prev) => {
      const next = new Set(prev)
      if (next.has(skill)) next.delete(skill)
      else next.add(skill)
      return next
    })
  }

  const applyAiSelected = () => {
    const current = data.skills?.technical || []
    const toAdd = Array.from(aiSelected).filter((s) => !current.includes(s))
    if (toAdd.length === 0) {
      addToast('Tidak ada skill baru yang dipilih', 'info')
      setAiModalOpen(false)
      return
    }
    onChange('skills', { ...data.skills, technical: [...current, ...toAdd] })
    addToast(`${toAdd.length} skill ditambahkan`, 'success')
    setAiModalOpen(false)
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h3 className="text-lg sm:text-xl font-semibold text-ink mb-1 sm:mb-2">Keahlian</h3>
        <p className="text-xs sm:text-sm text-muted">Tambahkan keahlian teknis dan soft skills Anda.</p>
      </div>

      {/* Technical Skills */}
      <div className="card p-3 sm:p-4 lg:p-6 space-y-3 sm:space-y-4">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/10 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </div>
            <div className="min-w-0">
              <h4 className="font-semibold text-sm sm:text-base text-ink">Keahlian Teknis</h4>
              <p className="text-xs text-muted hidden sm:block">Skill teknis yang Anda kuasai</p>
            </div>
          </div>
          {data.skills.technical.length > 0 && (
            <span className="px-2 py-1 text-xs font-medium bg-primary/10 text-primary">
              {data.skills.technical.length} skill
            </span>
          )}
        </div>
        
        {/* AI Recommendation Button */}
        <button
          type="button"
          onClick={openAiRecommend}
          className="w-full px-4 py-3 bg-ink text-paper hover:bg-ink/90 transition-colors flex items-center justify-center gap-2 min-h-[44px]"
        >
          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <span className="text-sm font-medium">Rekomendasi Skill dari AI</span>
        </button>

        <TagInput tags={data.skills.technical} onChange={updateSkills('technical')} placeholder="React, Node.js, Python, ..." />
        {data.skills.technical.length === 0 && (
          <div className="text-center py-4 sm:py-6 border-2 border-dashed border-border">
            <svg className="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-muted/40 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
            <p className="text-sm text-muted mb-1">Belum ada keahlian teknis</p>
            <p className="text-xs text-muted/70">Tambahkan skill atau gunakan rekomendasi AI</p>
          </div>
        )}
      </div>

      {/* Soft Skills */}
      <div className="card p-3 sm:p-4 lg:p-6 space-y-3 sm:space-y-4">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/10 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="min-w-0">
              <h4 className="font-semibold text-sm sm:text-base text-ink">Soft Skills</h4>
              <p className="text-xs text-muted hidden sm:block">Kemampuan interpersonal Anda</p>
            </div>
          </div>
          {data.skills.soft.length > 0 && (
            <span className="px-2 py-1 text-xs font-medium bg-primary/10 text-primary">
              {data.skills.soft.length} skill
            </span>
          )}
        </div>
        <TagInput tags={data.skills.soft} onChange={updateSkills('soft')} placeholder="Komunikasi, Kerja Tim, ..." />
        {data.skills.soft.length === 0 && (
          <div className="text-center py-4 sm:py-6 border-2 border-dashed border-border">
            <svg className="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-muted/40 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <p className="text-sm text-muted mb-1">Belum ada soft skills</p>
            <p className="text-xs text-muted/70">Tambahkan kemampuan interpersonal Anda</p>
          </div>
        )}
      </div>

      {/* Languages Section */}
      <div className="card p-3 sm:p-4 lg:p-6 space-y-3 sm:space-y-4">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/10 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
              </svg>
            </div>
            <div className="min-w-0">
              <h4 className="font-semibold text-sm sm:text-base text-ink">Bahasa</h4>
              <p className="text-xs text-muted hidden sm:block">Bahasa yang Anda kuasai</p>
            </div>
          </div>
          {(data.languages || []).length > 0 && (
            <span className="px-2 py-1 text-xs font-medium bg-primary/10 text-primary">
              {(data.languages || []).length} bahasa
            </span>
          )}
        </div>

        {(data.languages || []).map((lang, i) => (
          <div key={i} className="flex items-start gap-2 sm:gap-3 p-3 bg-surface border border-border">
            <div className="w-7 h-7 bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-xs font-semibold text-primary">{i + 1}</span>
            </div>
            <div className="grid md:grid-cols-2 gap-3 flex-1">
              <Input label="Bahasa" placeholder="Indonesia" value={lang.name} onChange={(e) => updateLang(i, 'name', e.target.value)} />
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <Input label="Level" placeholder="Native, Fluent, Intermediate..." value={lang.level} onChange={(e) => updateLang(i, 'level', e.target.value)} />
                </div>
                <button
                  onClick={() => removeLang(i)}
                  className="flex items-center justify-center w-11 h-11 text-danger hover:bg-danger/10 transition-colors shrink-0"
                  aria-label="Hapus bahasa"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
        <Button variant="secondary" onClick={addLanguage} className="w-full sm:w-auto">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Tambah Bahasa
        </Button>
      </div>

      {/* Projects Section */}
      <div className="card p-3 sm:p-4 lg:p-6 space-y-3 sm:space-y-4">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/10 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div className="min-w-0">
              <h4 className="font-semibold text-sm sm:text-base text-ink">Proyek</h4>
              <p className="text-xs text-muted hidden sm:block">Proyek yang pernah Anda kerjakan</p>
            </div>
          </div>
          {data.projects.length > 0 && (
            <span className="px-2 py-1 text-xs font-medium bg-primary/10 text-primary">
              {data.projects.length} proyek
            </span>
          )}
        </div>

        {data.projects.map((project, i) => (
          <div key={i} className="p-3 bg-surface border border-border space-y-3">
            <div className="flex items-start gap-2 sm:gap-3">
              <div className="w-7 h-7 bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-xs font-semibold text-primary">{i + 1}</span>
              </div>
              <div className="flex-1 space-y-3">
                <div className="grid md:grid-cols-2 gap-3">
                  <Input label="Nama Proyek" placeholder="E-commerce Platform" value={project.name} onChange={(e) => updateProject(i, 'name', e.target.value)} />
                  <Input label="Periode" placeholder="Jan 2023 - Mar 2023" value={project.period} onChange={(e) => updateProject(i, 'period', e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm text-ink mb-1">Deskripsi</label>
                  <textarea
                    value={project.description}
                    onChange={(e) => updateProject(i, 'description', e.target.value)}
                    placeholder="Deskripsi singkat tentang proyek..."
                    rows={3}
                    className="field resize-none"
                  />
                </div>
                <div>
                  <TagInput tags={project.techStack || project.tech_stack || []} onChange={(tags) => updateProject(i, 'techStack', tags)} placeholder="React, Node.js, MongoDB..." />
                </div>
              </div>
              <button
                onClick={() => removeProject(i)}
                className="flex items-center justify-center w-11 h-11 text-danger hover:bg-danger/10 transition-colors shrink-0"
                aria-label="Hapus proyek"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        ))}

        {data.projects.length === 0 && (
          <div className="text-center py-4 sm:py-6 border-2 border-dashed border-border">
            <svg className="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-muted/40 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <p className="text-sm text-muted mb-1">Belum ada proyek</p>
            <p className="text-xs text-muted/70">Tambahkan proyek untuk menunjukkan keahlian Anda</p>
          </div>
        )}

        <Button variant="secondary" onClick={addProject} className="w-full sm:w-auto">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Tambah Proyek
        </Button>
      </div>

      {/* Certifications Section */}
      <div className="card p-3 sm:p-4 lg:p-6 space-y-3 sm:space-y-4">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/10 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <div className="min-w-0">
              <h4 className="font-semibold text-sm sm:text-base text-ink">Sertifikasi</h4>
              <p className="text-xs text-muted hidden sm:block">Sertifikasi profesional yang Anda miliki</p>
            </div>
          </div>
          {(data.certifications || []).length > 0 && (
            <span className="px-2 py-1 text-xs font-medium bg-primary/10 text-primary">
              {(data.certifications || []).length} sertifikasi
            </span>
          )}
        </div>

        {(data.certifications || []).length === 0 && (
          <div className="text-center py-4 sm:py-6 border-2 border-dashed border-border">
            <svg className="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-muted/40 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
            <p className="text-sm text-muted mb-1">Belum ada sertifikasi</p>
            <p className="text-xs text-muted/70">Tambahkan sertifikasi untuk meningkatkan kredibilitas Anda</p>
          </div>
        )}

        {(data.certifications || []).map((cert, i) => (
          <div key={i} className="flex items-start gap-2 sm:gap-3 p-3 bg-surface border border-border">
            <div className="w-7 h-7 bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-xs font-semibold text-primary">{i + 1}</span>
            </div>
            <div className="grid md:grid-cols-2 gap-3 flex-1">
              <Input label="Nama Sertifikasi" placeholder="AWS Certified Cloud Practitioner" value={cert.name} onChange={(e) => updateCert(i, 'name', e.target.value)} />
              <Input label="Penerbit" placeholder="Amazon Web Services" value={cert.issuer} onChange={(e) => updateCert(i, 'issuer', e.target.value)} />
            </div>
            <button
              onClick={() => removeCert(i)}
              className="flex items-center justify-center w-11 h-11 text-danger hover:bg-danger/10 transition-colors shrink-0"
              aria-label="Hapus sertifikasi"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        ))}
        <Button variant="secondary" onClick={addCert} className="w-full sm:w-auto">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Tambah Sertifikasi
        </Button>
      </div>

      {/* AI Recommendation Modal */}
      <Modal open={aiModalOpen} onClose={() => setAiModalOpen(false)} title="Rekomendasi Skill dari AI" size="md">
        <div className="space-y-4">
          {aiLoading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent animate-spin mx-auto mb-3" />
              <p className="text-sm text-muted">Menganalisis posisi Anda...</p>
            </div>
          ) : aiSuggestions.length === 0 ? (
            <div className="text-center py-8">
              <svg className="w-12 h-12 mx-auto text-muted/40 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <p className="text-sm text-muted">Tidak ada rekomendasi skill untuk posisi ini</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-muted">Pilih skill yang ingin ditambahkan:</p>
              <div className="flex flex-wrap gap-2">
                {aiSuggestions.map((skill) => (
                  <button
                    key={skill}
                    onClick={() => toggleAiSelected(skill)}
                    className={`px-3 py-2 text-sm border transition-colors min-h-[44px] ${
                      aiSelected.has(skill)
                        ? 'bg-ink text-paper border-ink'
                        : 'bg-surface text-ink border-border hover:border-ink'
                    }`}
                  >
                    {aiSelected.has(skill) && (
                      <svg className="w-3.5 h-3.5 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                    {skill}
                  </button>
                ))}
              </div>
              <div className="flex gap-2 pt-2">
                <Button variant="secondary" onClick={() => setAiModalOpen(false)} className="flex-1">
                  Batal
                </Button>
                <Button onClick={applyAiSelected} className="flex-1">
                  Tambahkan ({aiSelected.size})
                </Button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  )
}
