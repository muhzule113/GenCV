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
    <div className="space-y-3 sm:space-y-4 lg:space-y-6">
      <div>
        <h3 className="text-lg sm:text-xl font-semibold text-ink mb-1 sm:mb-2">Pendidikan</h3>
        <p className="text-xs sm:text-sm text-muted">Tambahkan riwayat pendidikan Anda.</p>
      </div>

      {/* Empty State */}
      {data.educations.length === 0 && (
        <div className="card p-4 sm:p-6 lg:p-8 text-center border-2 border-dashed border-border">
          <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 bg-primary/10 flex items-center justify-center">
            <svg className="w-6 h-6 sm:w-8 sm:h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
            </svg>
          </div>
          <h4 className="text-base sm:text-lg font-medium text-ink mb-2">Belum ada pendidikan</h4>
          <p className="text-xs sm:text-sm text-muted mb-4">Tambahkan riwayat pendidikan Anda</p>
          <Button variant="primary" onClick={add} className="w-full sm:w-auto">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Tambah Pendidikan Pertama
          </Button>
        </div>
      )}

      {/* Education Cards */}
      {data.educations.map((edu, i) => (
        <div key={i} className="card p-3 sm:p-4 lg:p-6 space-y-3 sm:space-y-4 border-l-4 border-l-primary">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <div className="w-8 h-8 bg-primary/10 flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                </svg>
              </div>
              <h4 className="font-medium text-sm sm:text-base text-ink truncate">
                {edu.institution || `Pendidikan ${i + 1}`}
              </h4>
            </div>
            <button
              onClick={() => remove(i)}
              className="flex items-center justify-center w-11 h-11 text-danger hover:bg-danger/10 transition-colors shrink-0"
              aria-label="Hapus pendidikan"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-3 sm:gap-4">
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
              placeholder="Sarjana" 
              value={edu.degree} 
              onChange={(e) => update(i, 'degree', e.target.value)} 
            />
            <Input 
              label="Bidang Studi" 
              placeholder="Teknik Informatika" 
              value={edu.field} 
              onChange={(e) => update(i, 'field', e.target.value)} 
            />
            <Input 
              label="Tahun Mulai" 
              placeholder="2018" 
              value={edu.startYear} 
              onChange={(e) => update(i, 'startYear', e.target.value)} 
            />
            <Input 
              label="Tahun Lulus" 
              placeholder="2022" 
              value={edu.endYear} 
              onChange={(e) => update(i, 'endYear', e.target.value)} 
            />
            <Input 
              label="IPK" 
              placeholder="3.75" 
              value={edu.gpa} 
              onChange={(e) => update(i, 'gpa', e.target.value)} 
            />
            <div className="md:col-span-2">
              <Input 
                label="Judul Skripsi/Tesis" 
                placeholder="Sistem Informasi Berbasis Web..." 
                value={edu.thesis} 
                onChange={(e) => update(i, 'thesis', e.target.value)} 
              />
            </div>
          </div>
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

      {/* Delete Confirmation */}
      {deleteConfirm !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="card p-4 sm:p-6 max-w-sm w-full space-y-4">
            <h4 className="text-base sm:text-lg font-semibold text-ink">Konfirmasi Hapus</h4>
            <p className="text-sm text-muted">Apakah Anda yakin ingin menghapus pendidikan ini? Tindakan ini tidak dapat dibatalkan.</p>
            <div className="flex gap-2 sm:gap-3">
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
