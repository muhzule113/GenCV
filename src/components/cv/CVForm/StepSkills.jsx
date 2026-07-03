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
  const suggestions = await recommendSkills({ position, existingSkills: existing })
  setAiSuggestions(suggestions || [])
  fetchTokenBalance()
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
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-ink mb-2">Keahlian</h3>
        <p className="text-sm text-muted">Tambahkan keahlian teknis dan soft skills Anda.</p>
      </div>

      {/* Technical Skills */}
      <div className="card p-6 space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/10 to-blue-600/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-ink">Keahlian Teknis</h4>
              <p className="text-xs text-muted">Tools, bahasa pemrograman, framework</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {data.skills.technical.length > 0 && (
              <span className="px-2 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded-full">
                {data.skills.technical.length} skill
              </span>
            )}
            <AIActionChip icon="brain" label="Rekomendasi AI" onClick={openAiRecommend} />
          </div>
        </div>
        <TagInput tags={data.skills.technical} onChange={updateSkills('technical')} placeholder="React.js, Node.js, ..." />
        {data.skills.technical.length === 0 && (
          <div className="text-center py-6 border-2 border-dashed border-border rounded-lg">
            <svg className="w-12 h-12 mx-auto text-muted/40 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <p className="text-sm text-muted mb-2">Belum ada keahlian teknis</p>
            <p className="text-xs text-muted/70">Mulai tambahkan atau gunakan rekomendasi AI</p>
          </div>
        )}
      </div>

      {/* Soft Skills */}
      <div className="card p-6 space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/10 to-purple-600/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-ink">Interpersonal</h4>
              <p className="text-xs text-muted">Soft skills dan kemampuan komunikasi</p>
            </div>
          </div>
          {data.skills.soft.length > 0 && (
            <span className="px-2 py-1 text-xs font-medium bg-purple-50 text-purple-700 rounded-full">
              {data.skills.soft.length} skill
            </span>
          )}
        </div>
        <TagInput tags={data.skills.soft} onChange={updateSkills('soft')} placeholder="Komunikasi, Kerja Tim, ..." />
        {data.skills.soft.length === 0 && (
          <div className="text-center py-6 border-2 border-dashed border-border rounded-lg">
            <svg className="w-12 h-12 mx-auto text-muted/40 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <p className="text-sm text-muted mb-2">Belum ada soft skills</p>
            <p className="text-xs text-muted/70">Tambahkan kemampuan interpersonal Anda</p>
          </div>
        )}
      </div>



      {/* Languages Section */}
      <div className="card p-6 space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500/10 to-green-600/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-ink">Bahasa</h4>
              <p className="text-xs text-muted">Bahasa yang Anda kuasai</p>
            </div>
          </div>
          {(data.languages || []).length > 0 && (
            <span className="px-2 py-1 text-xs font-medium bg-green-50 text-green-700 rounded-full">
              {(data.languages || []).length} bahasa
            </span>
          )}
        </div>

        {(data.languages || []).length === 0 && (
          <div className="text-center py-6 border-2 border-dashed border-border rounded-lg">
            <svg className="w-12 h-12 mx-auto text-muted/40 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
            </svg>
            <p className="text-sm text-muted mb-2">Belum ada bahasa</p>
            <p className="text-xs text-muted/70">Tambahkan bahasa yang Anda kuasai</p>
          </div>
        )}

        {(data.languages || []).map((lang, i) => (
          <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-surface/50 border border-border/50">
            <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
              <span className="text-xs font-semibold text-primary">{i + 1}</span>
            </div>
            <div className="grid md:grid-cols-2 gap-3 flex-1">
              <Input label="Nama Bahasa" placeholder="Inggris" value={lang.name} onChange={(e) => updateLang(i, 'name', e.target.value)} />
              <Input label="Tingkat" placeholder="Aktif / Pasif" value={lang.level} onChange={(e) => updateLang(i, 'level', e.target.value)} />
            </div>
            <button
              onClick={() => removeLang(i)}
              className="flex-shrink-0 w-8 h-8 flex items-center justify-center text-danger hover:bg-danger/10 rounded-lg transition-colors mt-5"
              title="Hapus bahasa"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}

        <Button variant="ghost" size="sm" onClick={addLanguage}>
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Tambah Bahasa
        </Button>
      </div>

      {/* Projects Section */}
      <div className="card p-6 space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500/10 to-orange-600/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-ink">Proyek & Portofolio</h4>
              <p className="text-xs text-muted">Proyek yang pernah Anda kerjakan</p>
            </div>
          </div>
          {data.projects.length > 0 && (
            <span className="px-2 py-1 text-xs font-medium bg-orange-50 text-orange-700 rounded-full">
              {data.projects.length} proyek
            </span>
          )}
        </div>

        {data.projects.length === 0 && (
          <div className="text-center py-6 border-2 border-dashed border-border rounded-lg">
            <svg className="w-12 h-12 mx-auto text-muted/40 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <p className="text-sm text-muted mb-2">Belum ada proyek</p>
            <p className="text-xs text-muted/70">Tambahkan proyek untuk menunjukkan keahlian Anda</p>
          </div>
        )}


        {data.projects.map((proj, i) => (
          <div key={i} className="p-4 rounded-lg bg-surface/50 border border-border/50 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-xs font-semibold text-primary">{i + 1}</span>
                </div>
                <span className="text-sm font-medium text-ink">{proj.name || `Proyek #${i + 1}`}</span>
              </div>
              <button
                onClick={() => removeProject(i)}
                className="flex items-center gap-1 px-2 py-1 text-xs text-danger hover:bg-danger/10 rounded-lg transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Hapus
              </button>
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              <Input label="Nama Proyek" placeholder="Sistem Manajemen Inventaris" value={proj.name} onChange={(e) => updateProject(i, 'name', e.target.value)} />
              <Input label="Periode" placeholder="Jan 2025 – Mar 2025" value={proj.period} onChange={(e) => updateProject(i, 'period', e.target.value)} />
            </div>
            <Input label="Deskripsi" type="textarea" placeholder="Deskripsi proyek..." value={proj.description} onChange={(e) => updateProject(i, 'description', e.target.value)} rows={3} />
            <div className="space-y-2">
              <label className="text-sm font-medium text-ink">Tech Stack</label>
              <TagInput tags={proj.techStack || proj.tech_stack || []} onChange={(tags) => updateProject(i, 'techStack', tags)} placeholder="React.js, PostgreSQL, ..." />
            </div>
          </div>
        ))}

        <Button variant="ghost" size="sm" onClick={addProject}>
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Tambah Proyek
        </Button>
      </div>

      {/* Certifications Section */}
      <div className="card p-6 space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500/10 to-amber-600/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-ink">Sertifikasi</h4>
              <p className="text-xs text-muted">Sertifikasi profesional yang Anda miliki</p>
            </div>
          </div>
          {(data.certifications || []).length > 0 && (
            <span className="px-2 py-1 text-xs font-medium bg-amber-50 text-amber-700 rounded-full">
              {(data.certifications || []).length} sertifikasi
            </span>
          )}
        </div>

        {(data.certifications || []).length === 0 && (
          <div className="text-center py-6 border-2 border-dashed border-border rounded-lg">
            <svg className="w-12 h-12 mx-auto text-muted/40 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
            <p className="text-sm text-muted mb-2">Belum ada sertifikasi</p>
            <p className="text-xs text-muted/70">Tambahkan sertifikasi untuk meningkatkan kredibilitas Anda</p>
          </div>
        )}

        {(data.certifications || []).map((cert, i) => (
          <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-surface/50 border border-border/50">
            <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
              <span className="text-xs font-semibold text-primary">{i + 1}</span>
            </div>
            <div className="grid md:grid-cols-2 gap-3 flex-1">
              <Input label="Nama Sertifikasi" placeholder="AWS Certified Cloud Practitioner" value={cert.name} onChange={(e) => updateCert(i, 'name', e.target.value)} />
              <Input label="Penerbit" placeholder="Amazon Web Services" value={cert.issuer} onChange={(e) => updateCert(i, 'issuer', e.target.value)} />
            </div>
            <button
              onClick={() => removeCert(i)}
              className="flex-shrink-0 w-8 h-8 flex items-center justify-center text-danger hover:bg-danger/10 rounded-lg transition-colors mt-5"
              title="Hapus sertifikasi"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}

        <Button variant="ghost" size="sm" onClick={addCert}>
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Tambah Sertifikasi
        </Button>
      </div>


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
 <div className="py-12 text-center text-muted ">
 <svg className="animate-spin h-8 w-8 mx-auto mb-3 text-ink " viewBox="0 0 24 24" fill="none">
 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
 </svg>
 AI sedang menganalisis posisi Anda...
 </div>
 ) : aiSuggestions.length === 0 ? (
 <p className="py-8 text-center text-muted ">Tidak ada rekomendasi. Coba ubah posisi di Data Diri.</p>
 ) : (
 <div>
 <p className="text-sm text-muted mb-4">Pilih skill yang relevan dengan Anda. Skill yang sudah ada di CV tidak ditampilkan.</p>
 <div className="flex flex-wrap gap-2">
 {aiSuggestions.map((skill) => {
 const selected = aiSelected.has(skill)
 return (
 <button
 key={skill}
 type="button"
 onClick={() => toggleAiSelected(skill)}
 className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm border transition-colors ${
 selected
 ? 'bg-ink text-white border-ink'
 : 'bg-surface text-ink border-border hover:border-ink'
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
