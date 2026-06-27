import { useState, useEffect, useRef } from 'react'
import TagInput from '../../common/TagInput'
import Input from '../../common/Input'
import Button from '../../common/Button'
import Modal from '../../common/Modal'
import { recommendSkills } from '../../../services/aiService'
import useToastStore from '../../../store/toastStore'

export default function StepSkills({ data, onChange }) {
  const addToast = useToastStore((s) => s.addToast)
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
    setAiModalOpen(true)
    setAiLoading(true)
    setAiSuggestions([])
    setAiSelected(new Set())
    try {
      const existing = data.skills?.technical || []
      const suggestions = await recommendSkills({ position, existingSkills: existing })
      setAiSuggestions(suggestions || [])
    } catch (err) {
      addToast(err.message || 'Gagal memuat rekomendasi AI', 'error')
      setAiModalOpen(false)
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
    <div className="space-y-5">
      <div>
        <h3 className="text-h3 text-text-primary dark:text-text-primary-dark mb-1">Keahlian</h3>
        <p className="text-sm text-text-muted dark:text-text-muted-dark mb-4">Tambahkan keahlian teknis dan soft skills.</p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 relative" ref={openHelp === 'tech' ? helpRef : null}>
            <label className="block text-sm font-medium text-text-primary dark:text-text-primary-dark">Keahlian Teknis</label>
            <button
              type="button"
              aria-label="Petunjuk input Keahlian Teknis"
              onClick={() => setOpenHelp(openHelp === 'tech' ? null : 'tech')}
              className="relative inline-flex items-center justify-center w-5 h-5 rounded-full text-primary hover:bg-primary/10 transition-colors"
            >
              <span className="absolute inset-0 rounded-full bg-primary/30 animate-ping" aria-hidden="true" />
              <span className="absolute inset-0 rounded-full bg-primary/20 animate-pulse" aria-hidden="true" />
              <svg className="relative w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
            {openHelp === 'tech' && (
              <div className="absolute z-20 mt-2 w-80 max-w-[calc(100vw-2rem)] p-3 rounded-card border border-border dark:border-border-dark bg-white dark:bg-slate-800 shadow-lg text-xs text-text-primary dark:text-text-primary-dark space-y-2">
                <div>
                  <strong>Cara input:</strong> Ketik satu keahlian lalu tekan <kbd className="px-1 py-0.5 rounded border border-border dark:border-border-dark bg-surface-2 dark:bg-slate-700 text-[10px]">Enter</kbd> untuk menambah tag. Klik tanda <strong>×</strong> pada tag untuk menghapus.
                </div>
                <div>
                  Isi <strong>tools / bahasa / framework</strong> yang benar-benar bisa Anda gunakan. Tulis nama resmi, satu item per tag, singkat & konsisten.
                </div>
                <div>
                  <span className="text-text-muted dark:text-text-muted-dark">Contoh:</span>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {['Ms. Excel', 'Ms. Word', 'Ms. Office', 'Figma', 'K3', 'Safety'].map((ex) => (
                      <button
                        key={ex}
                        type="button"
                        onClick={() => onChange('skills', { ...data.skills, technical: [...(data.skills?.technical || []).filter((s) => s.toLowerCase() !== ex.toLowerCase()), ex] })}
                        className="inline-flex items-center px-2 py-0.5 rounded-full border border-border dark:border-border-dark bg-white dark:bg-slate-700 text-text-primary dark:text-text-primary-dark hover:border-primary hover:text-primary transition-colors"
                      >
                        + {ex}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
          <Button type="button" variant="outline" size="sm" onClick={openAiRecommend}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            Rekomendasi AI
          </Button>
        </div>
        <TagInput tags={data.skills.technical} onChange={updateSkills('technical')} placeholder="React.js, Node.js, ..." />
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2 relative" ref={openHelp === 'soft' ? helpRef : null}>
          <label className="block text-sm font-medium text-text-primary dark:text-text-primary-dark">Interpersonal</label>
          <button
            type="button"
            aria-label="Petunjuk input Interpersonal"
            onClick={() => setOpenHelp(openHelp === 'soft' ? null : 'soft')}
            className="relative inline-flex items-center justify-center w-5 h-5 rounded-full text-primary hover:bg-primary/10 transition-colors"
          >
            <span className="absolute inset-0 rounded-full bg-primary/30 animate-ping" aria-hidden="true" />
            <span className="absolute inset-0 rounded-full bg-primary/20 animate-pulse" aria-hidden="true" />
            <svg className="relative w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
          {openHelp === 'soft' && (
            <div className="absolute z-20 mt-2 w-80 max-w-[calc(100vw-2rem)] p-3 rounded-card border border-border dark:border-border-dark bg-white dark:bg-slate-800 shadow-lg text-xs text-text-primary dark:text-text-primary-dark space-y-2">
              <div>
                <strong>Cara input:</strong> Ketik satu skill lalu tekan <kbd className="px-1 py-0.5 rounded border border-border dark:border-border-dark bg-surface-2 dark:bg-slate-700 text-[10px]">Enter</kbd> untuk menambah tag. Klik tanda <strong>×</strong> pada tag untuk menghapus.
              </div>
              <div>
                Isi <strong>sikap & cara kerja</strong> yang relevan dengan posisi target. Hindari generic seperti &ldquo;rajin&rdquo;; pilih skill yang bisa dibuktikan lewat pengalaman.
              </div>
              <div>
                <span className="text-text-muted dark:text-text-muted-dark">Contoh:</span>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {['Komunikasi', 'Kerja Tim', 'Problem Solving', 'Leadership', 'Adaptabilitas', 'Manajemen Waktu'].map((ex) => (
                    <button
                      key={ex}
                      type="button"
                      onClick={() => onChange('skills', { ...data.skills, soft: [...(data.skills?.soft || []).filter((s) => s.toLowerCase() !== ex.toLowerCase()), ex] })}
                      className="inline-flex items-center px-2 py-0.5 rounded-full border border-border dark:border-border-dark bg-white dark:bg-slate-700 text-text-primary dark:text-text-primary-dark hover:border-primary hover:text-primary transition-colors"
                    >
                      + {ex}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
        <TagInput tags={data.skills.soft} onChange={updateSkills('soft')} placeholder="Komunikasi, Kerja Tim, ..." />
      </div>

      <hr className="border-border dark:border-border-dark my-6" />

      <div>
        <h3 className="text-h3 text-text-primary dark:text-text-primary-dark mb-1">Bahasa</h3>
        <p className="text-sm text-text-muted dark:text-text-muted-dark mb-4">Tambahkan bahasa yang dikuasai (opsional).</p>
      </div>

      {(data.languages || []).map((lang, i) => (
        <div key={i} className="bg-surface-2 dark:bg-slate-800 border border-border dark:border-border-dark rounded-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-text-primary dark:text-text-primary-dark">Bahasa #{i + 1}</span>
            <button onClick={() => removeLang(i)} className="text-xs text-danger hover:underline">Hapus</button>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <Input label="Nama Bahasa" placeholder="Inggris" value={lang.name} onChange={(e) => updateLang(i, 'name', e.target.value)} />
            <Input label="Tingkat" placeholder="Aktif / Pasif" value={lang.level} onChange={(e) => updateLang(i, 'level', e.target.value)} />
          </div>
        </div>
      ))}
      <Button variant="secondary" onClick={addLanguage}>+ Tambah Bahasa</Button>

      <hr className="border-border dark:border-border-dark my-6" />

      <div>
        <h3 className="text-h3 text-text-primary dark:text-text-primary-dark mb-1">Proyek & Portofolio</h3>
        <p className="text-sm text-text-muted dark:text-text-muted-dark mb-4">Tambahkan proyek yang pernah Anda kerjakan.</p>
      </div>

      {data.projects.map((proj, i) => (
        <div key={i} className="bg-surface-2 dark:bg-slate-800 border border-border dark:border-border-dark rounded-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-text-primary dark:text-text-primary-dark">Proyek #{i + 1}</span>
            <button onClick={() => removeProject(i)} className="text-xs text-danger hover:underline">Hapus</button>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <Input label="Nama Proyek" placeholder="Sistem Manajemen Inventaris" value={proj.name} onChange={(e) => updateProject(i, 'name', e.target.value)} />
            <Input label="Periode" placeholder="Jan 2025 – Mar 2025" value={proj.period} onChange={(e) => updateProject(i, 'period', e.target.value)} />
          </div>
          <Input label="Deskripsi" type="textarea" placeholder="Deskripsi proyek..." value={proj.description} onChange={(e) => updateProject(i, 'description', e.target.value)} rows={3} />
          <div className="space-y-2">
            <div className="flex items-center gap-2 relative" ref={openHelp === `techProj-${i}` ? helpRef : null}>
              <label className="block text-sm font-medium text-text-primary dark:text-text-primary-dark">Tech Stack</label>
              <button
                type="button"
                aria-label="Petunjuk input Tech Stack"
                onClick={() => setOpenHelp(openHelp === `techProj-${i}` ? null : `techProj-${i}`)}
                className="relative inline-flex items-center justify-center w-5 h-5 rounded-full text-primary hover:bg-primary/10 transition-colors"
              >
                <span className="absolute inset-0 rounded-full bg-primary/30 animate-ping" aria-hidden="true" />
                <span className="absolute inset-0 rounded-full bg-primary/20 animate-pulse" aria-hidden="true" />
                <svg className="relative w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
              {openHelp === `techProj-${i}` && (
                <div className="absolute z-20 mt-2 w-80 max-w-[calc(100vw-2rem)] p-3 rounded-card border border-border dark:border-border-dark bg-white dark:bg-slate-800 shadow-lg text-xs text-text-primary dark:text-text-primary-dark space-y-2">
                  <div>
                    <strong>Cara input:</strong> Ketik satu teknologi lalu tekan <kbd className="px-1 py-0.5 rounded border border-border dark:border-border-dark bg-surface-2 dark:bg-slate-700 text-[10px]">Enter</kbd> untuk menambah tag. Klik tanda <strong>×</strong> pada tag untuk menghapus.
                  </div>
                  <div>
                    Isi <strong>teknologi utama</strong> yang dipakai di proyek ini (framework, bahasa, database, tool). Tulis nama resmi, singkat & konsisten (mis. <em>React.js</em> bukan <em>react js programming</em>).
                  </div>
                  <div>
                    <span className="text-text-muted dark:text-text-muted-dark">Contoh:</span>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {['React.js', 'Node.js', 'PostgreSQL', 'Tailwind', 'Express', 'MongoDB', 'TypeScript', 'Docker'].map((ex) => (
                        <button
                          key={ex}
                          type="button"
                          onClick={() => {
                            const list = proj.techStack || proj.tech_stack || []
                            if (!list.some((s) => s.toLowerCase() === ex.toLowerCase())) {
                              updateProject(i, 'techStack', [...list, ex])
                            }
                          }}
                          className="inline-flex items-center px-2 py-0.5 rounded-full border border-border dark:border-border-dark bg-white dark:bg-slate-700 text-text-primary dark:text-text-primary-dark hover:border-primary hover:text-primary transition-colors"
                        >
                          + {ex}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
            <TagInput tags={proj.techStack || proj.tech_stack || []} onChange={(tags) => updateProject(i, 'techStack', tags)} placeholder="React.js, PostgreSQL, ..." />
          </div>
        </div>
      ))}
      <Button variant="secondary" onClick={addProject}>+ Tambah Proyek</Button>

      <hr className="border-border dark:border-border-dark my-6" />

      <div>
        <h3 className="text-h3 text-text-primary dark:text-text-primary-dark mb-1">Sertifikasi</h3>
        <p className="text-sm text-text-muted dark:text-text-muted-dark mb-4">Tambahkan sertifikasi yang dimiliki (opsional).</p>
      </div>

      {(data.certifications || []).map((cert, i) => (
        <div key={i} className="bg-surface-2 dark:bg-slate-800 border border-border dark:border-border-dark rounded-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-text-primary dark:text-text-primary-dark">Sertifikasi #{i + 1}</span>
            <button onClick={() => removeCert(i)} className="text-xs text-danger hover:underline">Hapus</button>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <Input label="Nama Sertifikasi" placeholder="AWS Certified Cloud Practitioner" value={cert.name} onChange={(e) => updateCert(i, 'name', e.target.value)} />
            <Input label="Penerbit" placeholder="Amazon Web Services" value={cert.issuer} onChange={(e) => updateCert(i, 'issuer', e.target.value)} />
          </div>
        </div>
      ))}
      <Button variant="secondary" onClick={addCert}>+ Tambah Sertifikasi</Button>

      <Modal
        open={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        title={`Rekomendasi Skill untuk "${data.personal?.jobTitle || 'Posisi Anda'}"`}
        size="lg"
        actions={
          <>
            <Button variant="secondary" onClick={() => setAiModalOpen(false)}>Batal</Button>
            <Button onClick={applyAiSelected} disabled={aiSelected.size === 0}>
              Tambahkan ({aiSelected.size})
            </Button>
          </>
        }
      >
        {aiLoading ? (
          <div className="py-12 text-center text-text-muted dark:text-text-muted-dark">
            <svg className="animate-spin h-8 w-8 mx-auto mb-3 text-primary" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            AI sedang menganalisis posisi Anda...
          </div>
        ) : aiSuggestions.length === 0 ? (
          <p className="py-8 text-center text-text-muted dark:text-text-muted-dark">Tidak ada rekomendasi. Coba ubah posisi di Data Diri.</p>
        ) : (
          <div>
            <p className="text-sm text-text-muted dark:text-text-muted-dark mb-4">Pilih skill yang relevan dengan Anda. Skill yang sudah ada di CV tidak ditampilkan.</p>
            <div className="flex flex-wrap gap-2">
              {aiSuggestions.map((skill) => {
                const selected = aiSelected.has(skill)
                return (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => toggleAiSelected(skill)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border transition-colors ${
                      selected
                        ? 'bg-primary text-white border-primary'
                        : 'bg-white dark:bg-slate-700 text-text-primary dark:text-text-primary-dark border-border dark:border-border-dark hover:border-primary hover:text-primary'
                    }`}
                  >
                    {selected && (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                    {skill}
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
