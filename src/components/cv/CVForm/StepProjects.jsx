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

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-h3 text-text-primary dark:text-text-primary-dark mb-1">Proyek & Sertifikasi</h3>
        <p className="text-sm text-text-muted dark:text-text-muted-dark mb-4">Tambahkan proyek dan sertifikasi yang dimiliki.</p>
      </div>

      {data.projects.map((proj, i) => (
        <div key={i} className="bg-surface-2 dark:bg-slate-800 border border-border dark:border-border-dark rounded-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-text-primary dark:text-text-primary-dark">Proyek #{i + 1}</span>
            <button onClick={() => removeProject(i)} className="text-xs text-danger hover:underline">Hapus</button>
          </div>
          <Input label="Nama Proyek" placeholder="Sistem Manajemen Inventaris" value={proj.name} onChange={(e) => updateProject(i, 'name', e.target.value)} />
          <Input label="Deskripsi" type="textarea" placeholder="Deskripsi proyek..." value={proj.description} onChange={(e) => updateProject(i, 'description', e.target.value)} rows={3} />
          <TagInput label="Tech Stack" tags={proj.tech_stack} onChange={(tags) => updateProject(i, 'tech_stack', tags)} placeholder="React.js, PostgreSQL, ..." />
          <Input label="URL (opsional)" placeholder="github.com/username/project" value={proj.url} onChange={(e) => updateProject(i, 'url', e.target.value)} />
        </div>
      ))}
      <Button variant="secondary" onClick={addProject}>+ Tambah Proyek</Button>
    </div>
  )
}
