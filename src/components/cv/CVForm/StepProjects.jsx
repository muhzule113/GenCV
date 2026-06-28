import { useState, useEffect, useRef } from 'react'
import TagInput from '../../common/TagInput'
import Input from '../../common/Input'
import Button from '../../common/Button'

export default function StepProjects({ data, onChange }) {
 const addProject = () => {
 onChange('projects', [...data.projects, { name: '', description: '', tech_stack: [], url: '' }])
 }

 const updateProject = (index, field, value) => {
 const updated = [...data.projects]
 updated[index] = { ...updated[index], [field]: value }
 onChange('projects', updated)
 }

 const removeProject = (index) => {
 onChange('projects', data.projects.filter((_, i) => i !== index))
 }

 const [openHelp, setOpenHelp] = useState(null)
 const helpRef = useRef(null)
 useEffect(() => {
 const onDocClick = (e) => {
 if (helpRef.current && !helpRef.current.contains(e.target)) setOpenHelp(null)
 }
 document.addEventListener('mousedown', onDocClick)
 return () => document.removeEventListener('mousedown', onDocClick)
 }, [])

 return (
 <div className="space-y-5">
 <div>
 <h3 className="text-lg font-semibold text-ink mb-1">Proyek & Sertifikasi</h3>
 <p className="text-sm text-muted mb-4">Tambahkan proyek dan sertifikasi yang dimiliki.</p>
 </div>

 {data.projects.map((proj, i) => (
 <div key={i} className="card p-5 space-y-4">
 <div className="flex items-center justify-between">
 <span className="text-sm font-medium text-ink ">Proyek #{i + 1}</span>
 <button onClick={() => removeProject(i)} className="text-xs text-danger hover:underline">Hapus</button>
 </div>
 <Input label="Nama Proyek" placeholder="Sistem Manajemen Inventaris" value={proj.name} onChange={(e) => updateProject(i, 'name', e.target.value)} />
 <Input label="Deskripsi" type="textarea" placeholder="Deskripsi proyek..." value={proj.description} onChange={(e) => updateProject(i, 'description', e.target.value)} rows={3} />
 <div className="space-y-2">
 <div className="flex items-center gap-2 relative" ref={openHelp === `tech-${i}` ? helpRef : null}>
 <label className="block text-sm font-medium text-ink ">Tech Stack</label>
 <button
 type="button"
 aria-label="Petunjuk input Tech Stack"
 onClick={() => setOpenHelp(openHelp === `tech-${i}` ? null : `tech-${i}`)}
 className="relative inline-flex items-center justify-center w-5 h-5 rounded-full text-ink hover:bg-ink/10 transition-colors"
 >
 <span className="absolute inset-0 rounded-full bg-ink/30 animate-ping" aria-hidden="true" />
 <span className="absolute inset-0 rounded-full bg-ink/20 animate-pulse" aria-hidden="true" />
 <svg className="relative w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
 <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
 </svg>
 </button>
 {openHelp === `tech-${i}` && (
 <div className="absolute z-20 mt-2 w-80 max-w-[calc(100vw-2rem)] p-3 rounded-lg border border-border bg-surface shadow-lg text-xs text-ink space-y-2">
 <div>
 <strong>Cara input:</strong> Ketik satu teknologi lalu tekan <kbd className="px-1 py-0.5 rounded border border-border bg-border text-[10px]">Enter</kbd> untuk menambah tag. Klik tanda <strong>×</strong> pada tag untuk menghapus.
 </div>
 <div>
 Isi <strong>teknologi utama</strong> yang dipakai di proyek ini (framework, bahasa, database, tool). Tulis nama resmi, singkat & konsisten (mis. <em>React.js</em> bukan <em>react js programming</em>).
 </div>
 <div>
 <span className="text-muted ">Contoh:</span>
 <div className="mt-1 flex flex-wrap gap-1.5">
 {['React.js', 'Node.js', 'PostgreSQL', 'Tailwind', 'Express', 'MongoDB', 'TypeScript', 'Docker'].map((ex) => (
 <button
 key={ex}
 type="button"
 onClick={() => {
 const list = proj.tech_stack || []
 if (!list.some((s) => s.toLowerCase() === ex.toLowerCase())) {
 updateProject(i, 'tech_stack', [...list, ex])
 }
 }}
 className="inline-flex items-center px-2 py-0.5 rounded-full border border-border bg-surface text-ink hover:border-ink hover:text-ink transition-colors"
 >
 + {ex}
 </button>
 ))}
 </div>
 </div>
 </div>
 )}
 </div>
 <TagInput tags={proj.tech_stack} onChange={(tags) => updateProject(i, 'tech_stack', tags)} placeholder="React.js, PostgreSQL, ..." />
 </div>
 <Input label="URL (opsional)" placeholder="github.com/username/project" value={proj.url} onChange={(e) => updateProject(i, 'url', e.target.value)} />
 </div>
 ))}
 <Button variant="secondary" onClick={addProject}>+ Tambah Proyek</Button>
 </div>
 )
}
