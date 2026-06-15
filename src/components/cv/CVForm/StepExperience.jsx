import Input from '../../common/Input'
import Button from '../../common/Button'

export default function StepExperience({ data, onChange }) {
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
    onChange('experiences', data.experiences.filter((_, i) => i !== index))
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
    <div className="space-y-5">
      <div>
        <h3 className="text-h3 text-text-primary dark:text-text-primary-dark mb-1">Pengalaman Kerja</h3>
        <p className="text-sm text-text-muted dark:text-text-muted-dark mb-4">Tambahkan pengalaman kerja Anda.</p>
      </div>

      {data.experiences.map((exp, i) => (
        <div key={i} className="bg-surface-2 dark:bg-slate-800 border border-border dark:border-border-dark rounded-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-text-primary dark:text-text-primary-dark">Pengalaman #{i + 1}</span>
            <button onClick={() => removeExp(i)} className="text-xs text-danger hover:underline">Hapus</button>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <Input label="Perusahaan" placeholder="PT Teknologi Nusantara" value={exp.company} onChange={(e) => updateExp(i, 'company', e.target.value)} />
            <Input label="Posisi" placeholder="Frontend Developer" value={exp.position} onChange={(e) => updateExp(i, 'position', e.target.value)} />
            <Input label="Tanggal Mulai" type="month" placeholder="2024-01" value={exp.startDate} onChange={(e) => updateExp(i, 'startDate', e.target.value)} />
            <Input label="Tanggal Selesai" type="month" placeholder="2024-12" value={exp.endDate} onChange={(e) => updateExp(i, 'endDate', e.target.value)} disabled={exp.isCurrent} />
          </div>
          <label className="flex items-center gap-2 text-sm text-text-primary dark:text-text-primary-dark">
            <input type="checkbox" checked={exp.isCurrent} onChange={(e) => updateExp(i, 'isCurrent', e.target.checked)} className="rounded border-border" />
            Saya masih bekerja di sini
          </label>
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-primary dark:text-text-primary-dark">Deskripsi (bullet points)</label>
            {exp.description.map((bullet, j) => (
              <div key={j} className="flex gap-2">
                <span className="mt-2.5 text-text-muted">•</span>
                <input
                  className="flex-1 px-3 py-2 bg-white dark:bg-slate-700 border border-border dark:border-border-dark rounded-lg text-sm text-text-primary dark:text-text-primary-dark focus:outline-none focus:ring-2 focus:ring-primary/50"
                  value={bullet}
                  onChange={(e) => updateBullet(i, j, e.target.value)}
                  placeholder="Deskripsi pencapaian..."
                />
                <button onClick={() => removeBullet(i, j)} className="text-danger text-xs hover:underline">Hapus</button>
              </div>
            ))}
            <Button variant="ghost" size="sm" onClick={() => addBullet(i)}>+ Tambah bullet</Button>
          </div>
        </div>
      ))}
      <Button variant="secondary" onClick={addExp}>+ Tambah Pengalaman</Button>
    </div>
  )
}
