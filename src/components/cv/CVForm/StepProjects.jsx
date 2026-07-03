import { useState, useEffect, useRef } from 'react'
import TagInput from '../../common/TagInput'
import Input from '../../common/Input'
import Button from '../../common/Button'

export default function StepProjects({ data, onChange }) {
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [openHelp, setOpenHelp] = useState(null)
  const helpRef = useRef(null)

  const addProject = () => {
    onChange('projects', [...data.projects, { name: '', description: '', tech_stack: [], url: '' }])
  }

  const updateProject = (index, field, value) => {
    const updated = [...data.projects]
    updated[index] = { ...updated[index], [field]: value }
    onChange('projects', updated)
  }

  const removeProject = (index) => {
    setDeleteConfirm(index)
  }

  const confirmRemove = () => {
    onChange('projects', data.projects.filter((_, i) => i !== deleteConfirm))
    setDeleteConfirm(null)
  }

  const cancelRemove = () => {
    setDeleteConfirm(null)
  }

  useEffect(() => {
    const onDocClick = (e) => {
      if (helpRef.current && !helpRef.current.contains(e.target)) setOpenHelp(null)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-ink mb-2">Proyek & Sertifikasi</h3>
        <p className="text-sm text-muted">Tambahkan proyek dan sertifikasi yang menunjukkan keahlian Anda.</p>
      </div>

      {/* Empty State */}
      {data.projects.length === 0 && (
        <div className="card p-8 text-center border-2 border-dashed border-border">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
            <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h4 className="text-lg font-medium text-ink mb-2">Belum ada proyek</h4>
          <p className="text-sm text-muted mb-4">Tambahkan proyek atau sertifikasi untuk menunjukkan keahlian Anda</p>
          <Button variant="primary" onClick={addProject}>
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Tambah Proyek Pertama
          </Button>
        </div>
      )}

      {/* Project Cards */}
      {data.projects.map((proj, i) => (
        <div key={i} className="card p-6 space-y-5 border-l-4 border-l-primary">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <span className="text-sm font-semibold text-primary">{i + 1}</span>
              </div>
              <h4 className="font-medium text-ink">
                {proj.name || `Proyek #${i + 1}`}
              </h4>
            </div>
            <button
              onClick={() => removeProject(i)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-danger hover:bg-danger/10 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Hapus
            </button>
          </div>

          <div className="space-y-4">
            <Input 
              label="Nama Proyek" 
              placeholder="Sistem Manajemen Inventaris" 
              value={proj.name} 
              onChange={(e) => updateProject(i, 'name', e.target.value)} 
            />
            <Input 
              label="Deskripsi" 
              type="textarea" 
              placeholder="Jelaskan proyek ini secara singkat..." 
              value={proj.description} 
              onChange={(e) => updateProject(i, 'description', e.target.value)} 
              rows={3} 
            />

            {/* Tech Stack Section */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 relative" ref={openHelp === `tech-${i}` ? helpRef : null}>
                <label className="text-sm font-medium text-ink">Tech Stack</label>
                <button
                  type="button"
                  aria-label="Petunjuk input Tech Stack"
                  onClick={() => setOpenHelp(openHelp === `tech-${i}` ? null : `tech-${i}`)}
                  className="relative inline-flex items-center justify-center w-5 h-5 rounded-full text-muted hover:text-ink hover:bg-ink/10 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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
                      <span className="text-muted">Contoh:</span>
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
                            className="inline-flex items-center px-2 py-0.5 rounded-full border border-border bg-surface text-ink hover:border-primary hover:text-primary transition-colors"
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

            <Input 
              label="URL Proyek" 
              placeholder="https://github.com/username/project" 
              value={proj.url} 
              onChange={(e) => updateProject(i, 'url', e.target.value)} 
            />
          </div>
        </div>
      ))}

      {/* Add Button */}
      {data.projects.length > 0 && (
        <Button variant="secondary" onClick={addProject} className="w-full">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Tambah Proyek
        </Button>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-danger/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-danger" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-ink">Hapus Proyek?</h4>
                <p className="text-sm text-muted">Tindakan ini tidak dapat dibatalkan</p>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="secondary" onClick={cancelRemove} className="flex-1">
                Batal
              </Button>
              <Button variant="danger" onClick={confirmRemove} className="flex-1">
                Ya, Hapus
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
