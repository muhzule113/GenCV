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
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-ink mb-2">Pengalaman Kerja</h3>
        <p className="text-sm text-muted">Tambahkan pengalaman kerja Anda. Mulai dari yang paling terbaru.</p>
      </div>

      {/* Empty State */}
      {data.experiences.length === 0 && (
        <div className="card p-8 text-center border-2 border-dashed border-border">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
            <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h4 className="text-lg font-medium text-ink mb-2">Belum ada pengalaman kerja</h4>
          <p className="text-sm text-muted mb-4">Tambahkan pengalaman kerja Anda untuk menampilkan riwayat profesional</p>
          <Button variant="primary" onClick={addExp}>
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Tambah Pengalaman Pertama
          </Button>
        </div>
      )}

      {/* Experience Cards */}
      {data.experiences.map((exp, i) => (
        <div key={i} className="card p-6 space-y-5 border-l-4 border-l-primary">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <span className="text-sm font-semibold text-primary">{i + 1}</span>
              </div>
              <div>
                <h4 className="font-medium text-ink">
                  {exp.company || exp.position ? `${exp.position} ${exp.company ? `di ${exp.company}` : ''}` : `Pengalaman #${i + 1}`}
                </h4>
                {exp.isCurrent && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Saat ini
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={() => removeExp(i)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-danger hover:bg-danger/10 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Hapus
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
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
          </div>

          <label className="flex items-center gap-2 text-sm text-ink cursor-pointer group">
            <input 
              type="checkbox" 
              checked={exp.isCurrent} 
              onChange={(e) => updateExp(i, 'isCurrent', e.target.checked)} 
              className="border border-border text-primary focus:ring-2 focus:ring-primary/20 bg-transparent w-4 h-4 cursor-pointer accent-primary rounded" 
            />
            <span className="group-hover:text-primary transition-colors">Saya masih bekerja di sini</span>
          </label>

          {/* Bullet Points Section */}
          <div className="space-y-3 pt-4 border-t border-border">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-ink">Deskripsi Pencapaian</label>
              <span className="text-xs text-muted">{exp.description.length} poin</span>
            </div>
            
            {exp.description.length === 0 && (
              <p className="text-sm text-muted italic py-2">
                Belum ada deskripsi. Tambahkan poin-poin pencapaian Anda.
              </p>
            )}

            <div className="space-y-2">
              {exp.description.map((bullet, j) => (
                <div key={j} className="flex gap-2 group">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mt-1.5">
                    <span className="text-xs text-primary font-medium">{j + 1}</span>
                  </div>
                  <input
                    className="field flex-1"
                    value={bullet}
                    onChange={(e) => updateBullet(i, j, e.target.value)}
                    placeholder="Contoh: Meningkatkan performa aplikasi sebesar 40%..."
                  />
                  <button 
                    onClick={() => removeBullet(i, j)} 
                    className="opacity-0 group-hover:opacity-100 flex-shrink-0 w-8 h-8 flex items-center justify-center text-danger hover:bg-danger/10 rounded-lg transition-all"
                    title="Hapus poin"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>

            <Button variant="ghost" size="sm" onClick={() => addBullet(i)}>
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
                <h4 className="text-lg font-semibold text-ink">Hapus Pengalaman?</h4>
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
