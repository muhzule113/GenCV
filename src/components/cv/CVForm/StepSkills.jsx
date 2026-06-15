import TagInput from '../../common/TagInput'
import Input from '../../common/Input'
import Button from '../../common/Button'

export default function StepSkills({ data, onChange }) {
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
    onChange('projects', [...data.projects, { name: '', description: '', techStack: [], period: '' }])
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

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-h3 text-text-primary dark:text-text-primary-dark mb-1">Keahlian</h3>
        <p className="text-sm text-text-muted dark:text-text-muted-dark mb-4">Tambahkan keahlian teknis dan soft skills.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <TagInput label="Keahlian Teknis" tags={data.skills.technical} onChange={updateSkills('technical')} placeholder="React.js, Node.js, ..." />
        <TagInput label="Interpersonal" tags={data.skills.soft} onChange={updateSkills('soft')} placeholder="Komunikasi, Kerja Tim, ..." />
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
          <TagInput label="Tech Stack" tags={proj.techStack || []} onChange={(tags) => updateProject(i, 'techStack', tags)} placeholder="React.js, PostgreSQL, ..." />
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
    </div>
  )
}
