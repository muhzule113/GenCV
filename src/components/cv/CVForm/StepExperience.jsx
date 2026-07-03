import { useState } from 'react'
import Input from '../../common/Input'
import Button from '../../common/Button'
import MonthPicker from '../../common/MonthPicker'

export default function StepExperience({ data, onChange }) {
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const addExp = () => {
    const newExp = { company: '', position: '', startDate: '', endDate: '', isCurrent: false, description: [] }
    onChange('experiences', [...data.experiences, newExp])
  }

  const updateExp = (index, field, value) => {
    const updated = [...data.experiences]
    updated[index] = { ...updated[index], [field]: value }
    onChange('experiences', updated)
  }

  const removeExp = (index) => {
    setDeleteConfirm(index)
  }

  const confirmRemove = () => {
    onChange('experiences', data.experiences.filter((_, i) => i !== deleteConfirm))
    setDeleteConfirm(null)
  }

  const cancelRemove = () => {
    setDeleteConfirm(null)
  }

  const addBullet = (index) => {
    const updated = [...data.experiences]
    updated[index] = { ...updated[index], description: [...updated[index].description, ''] }
    onChange('experiences', updated)
  }

  const updateBullet = (expIndex, bullIndex, value) => {
    const updated = [...data.experiences]
    updated[expIndex].description[bullIndex] = value
    onChange('experiences', updated)
  }

  const removeBullet = (expIndex, bullIndex) => {
    const updated = [...data.experiences]
    updated[expIndex].description = updated[expIndex].description.filter((_, i) => i !== bullIndex)
    onChange('experiences', updated)
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h3 className="text-lg sm:text-xl font-semibold text-ink mb-1 sm:mb-2">Pengalaman Kerja</h3>
        <p className="text-xs sm:text-sm text-muted">Tambahkan pengalaman kerja Anda. Mulai dari yang paling terbaru.</p>
      </div>

      {/* Empty State */}
      {data.experiences.length === 0 && (
        <div className="card p-4 sm:p-6 lg:p-8 text-center border-2 border-dashed border-border">
          <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 bg-primary/10 flex items-center justify-center">
            <svg className="w-6 h-6 sm:w-8 sm:h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h4 className="text-base sm:text-lg font-medium text-ink mb-2">Belum ada pengalaman kerja</h4>
          <p className="text-xs sm:text-sm text-muted mb-4">Tambahkan pengalaman kerja Anda untuk menampilkan riwayat profesional</p>
          <Button variant="primary" onClick={addExp} className="w-full sm:w-auto">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Tambah Pengalaman Pertama
          </Button>
        </div>
      )}

      {/* Experience Cards */}
      {data.experiences.map((exp, i) => (
        <div key={i} className="card p-3 sm:p-4 lg:p-6 space-y-3 sm:space-y-4 lg:space-y-5 border-l-4 border-l-primary">
          <div className="flex items-start justify-between gap-2 sm:gap-3">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <div className="w-8 h-8 bg-primary/10 flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-medium text-sm sm:text-base text-ink truncate">
                  {exp.company || exp.position || `Pengalaman ${i + 1}`}
                </h4>
                {exp.isCurrent && (
                  <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-success/10 text-success mt-1">
                    Saat ini
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={() => removeExp(i)}
              className="flex items-center gap-1 px-2 py-1.5 text-xs sm:text-sm text-danger hover:bg-danger/10 transition-colors shrink-0 min-h-[44px]"
              aria-label="Hapus pengalaman"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span className="hidden sm:inline">Hapus</span>
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-3 sm:gap-4">
            <Input 
              label="Perusahaan" 
              placeholder="PT Teknologi Nusantara" 
              value={exp.company} 
              onChange={(e) => updateExp(i, 'company', e.target.value)} 
            />
            <Input 
              label="Posisi/Jabatan" 
              placeholder="Frontend Developer" 
              value={exp.position} 
              onChange={(e) => updateExp(i, 'position', e.target.value)} 
            />
            <MonthPicker 
              label="Tanggal Mulai" 
              value={exp.startDate} 
              onChange={(e) => updateExp(i, 'startDate', e.target.value)} 
            />
            <MonthPicker 
              label="Tanggal Selesai" 
              value={exp.endDate} 
              onChange={(e) => updateExp(i, 'endDate', e.target.value)} 
              disabled={exp.isCurrent} 
            />
            <div className="md:col-span-2">
              <label className="flex items-center gap-2 text-sm text-ink cursor-pointer min-h-[44px]">
                <input 
                  type="checkbox" 
                  checked={exp.isCurrent} 
                  onChange={(e) => updateExp(i, 'isCurrent', e.target.checked)} 
                  className="w-4 h-4"
                />
                <span>Saat ini masih bekerja</span>
              </label>
            </div>
          </div>

          {/* Description Bullets */}
          <div className="space-y-2">
            <label className="block text-sm text-ink mb-1">Deskripsi Pekerjaan</label>
            {exp.description.map((bullet, bullIndex) => (
              <div key={bullIndex} className="flex gap-2">
                <input
                  type="text"
                  value={bullet}
                  onChange={(e) => updateBullet(i, bullIndex, e.target.value)}
                  placeholder="• Mencapai target penjualan..."
                  className="field flex-1"
                />
                <button
                  onClick={() => removeBullet(i, bullIndex)}
                  className="flex items-center justify-center w-11 h-11 text-danger hover:bg-danger/10 transition-colors shrink-0"
                  aria-label="Hapus poin"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
            <Button variant="ghost" size="sm" onClick={() => addBullet(i)} className="w-full sm:w-auto">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Tambah Poin
            </Button>
          </div>
        </div>
      ))}

      {/* Add Button */}
      {data.experiences.length > 0 && (
        <Button variant="secondary" onClick={addExp} className="w-full">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Tambah Pengalaman Kerja
        </Button>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="card p-4 sm:p-6 max-w-sm w-full space-y-4">
            <h4 className="text-base sm:text-lg font-semibold text-ink">Konfirmasi Hapus</h4>
            <p className="text-sm text-muted">Apakah Anda yakin ingin menghapus pengalaman ini? Tindakan ini tidak dapat dibatalkan.</p>
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
