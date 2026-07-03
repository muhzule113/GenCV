import { useState } from 'react'
import Input from '../../common/Input'
import Button from '../../common/Button'

export default function StepEducation({ data, onChange }) {
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const add = () => {
    onChange('educations', [...data.educations, { institution: '', degree: '', field: '', startYear: '', endYear: '', gpa: '', thesis: '' }])
  }

  const update = (index, field, value) => {
    const updated = [...data.educations]
    updated[index] = { ...updated[index], [field]: value }
    onChange('educations', updated)
  }

  const remove = (index) => {
    setDeleteConfirm(index)
  }

  const confirmRemove = () => {
    onChange('educations', data.educations.filter((_, i) => i !== deleteConfirm))
    setDeleteConfirm(null)
  }

  const cancelRemove = () => {
    setDeleteConfirm(null)
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-ink mb-2">Pendidikan</h3>
        <p className="text-sm text-muted">Tambahkan riwayat pendidikan formal Anda.</p>
      </div>

      {/* Empty State */}
      {data.educations.length === 0 && (
        <div className="card p-8 text-center border-2 border-dashed border-border">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
            <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M12 14l9-5-9-5-9 5 9 5z" />
              <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
            </svg>
          </div>
          <h4 className="text-lg font-medium text-ink mb-2">Belum ada pendidikan</h4>
          <p className="text-sm text-muted mb-4">Tambahkan riwayat pendidikan formal Anda</p>
          <Button variant="primary" onClick={add}>
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Tambah Pendidikan Pertama
          </Button>
        </div>
      )}

      {/* Education Cards */}
      {data.educations.map((edu, i) => (
        <div key={i} className="card p-6 space-y-5 border-l-4 border-l-primary">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <span className="text-sm font-semibold text-primary">{i + 1}</span>
              </div>
              <div>
                <h4 className="font-medium text-ink">
                  {edu.institution || edu.field ? `${edu.degree || ''} ${edu.field ? `di ${edu.institution || edu.field}` : ''}`.trim() || `Pendidikan #${i + 1}` : `Pendidikan #${i + 1}`}
                </h4>
                {edu.startYear && edu.endYear && (
                  <span className="text-xs text-muted">{edu.startYear} - {edu.endYear}</span>
                )}
              </div>
            </div>
            <button
              onClick={() => remove(i)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-danger hover:bg-danger/10 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Hapus
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Input 
                label="Institusi" 
                placeholder="Universitas Indonesia" 
                value={edu.institution} 
                onChange={(e) => update(i, 'institution', e.target.value)} 
              />
            </div>
            <Input 
              label="Gelar" 
              placeholder="Sarjana (S1)" 
              value={edu.degree} 
              onChange={(e) => update(i, 'degree', e.target.value)} 
            />
            <Input 
              label="Jurusan" 
              placeholder="Teknik Informatika" 
              value={edu.field} 
              onChange={(e) => update(i, 'field', e.target.value)} 
            />
            <Input 
              label="Tahun Mulai" 
              placeholder="2019" 
              value={edu.startYear} 
              onChange={(e) => update(i, 'startYear', e.target.value)} 
            />
            <Input 
              label="Tahun Selesai" 
              placeholder="2023" 
              value={edu.endYear} 
              onChange={(e) => update(i, 'endYear', e.target.value)} 
            />
            <Input 
              label="IPK" 
              placeholder="3.78" 
              value={edu.gpa} 
              onChange={(e) => update(i, 'gpa', e.target.value)} 
            />
          </div>

          <Input 
            label="Tugas Akhir / Skripsi" 
            placeholder="Judul skripsi atau tugas akhir (opsional)" 
            value={edu.thesis} 
            onChange={(e) => update(i, 'thesis', e.target.value)} 
          />
        </div>
      ))}

      {/* Add Button */}
      {data.educations.length > 0 && (
        <Button variant="secondary" onClick={add} className="w-full">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Tambah Pendidikan
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
                <h4 className="text-lg font-semibold text-ink">Hapus Pendidikan?</h4>
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
