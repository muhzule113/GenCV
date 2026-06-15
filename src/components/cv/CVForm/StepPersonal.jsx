import Input from '../../common/Input'

export default function StepPersonal({ data, onChange }) {
  const update = (field) => (e) => onChange('personal', { ...data.personal, [field]: e.target.value })

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-h3 text-text-primary dark:text-text-primary-dark mb-1">Informasi Dasar</h3>
        <p className="text-sm text-text-muted dark:text-text-muted-dark mb-4">Lengkapi data diri Anda untuk ditampilkan di CV.</p>
      </div>
      <div className="grid md:grid-cols-2 gap-5">
        <Input label="Nama Lengkap" placeholder="Reza Pratama" value={data.personal.name} onChange={update('name')} />
        <Input label="Jabatan" placeholder="Frontend Developer" value={data.personal.jobTitle} onChange={update('jobTitle')} />
        <Input label="Email" type="email" placeholder="reza@email.com" value={data.personal.email} onChange={update('email')} />
        <Input label="Telepon" placeholder="+62 812-3456-7890" value={data.personal.phone} onChange={update('phone')} />
        <Input label="Kota" placeholder="Jakarta" value={data.personal.city} onChange={update('city')} />
        <Input label="LinkedIn (opsional)" placeholder="linkedin.com/in/username" value={data.personal.linkedin} onChange={update('linkedin')} />
        <Input label="GitHub (opsional)" placeholder="github.com/username" value={data.personal.github} onChange={update('github')} />
      </div>
      <Input label="Portfolio (opsional)" placeholder="portofolioanda.com" value={data.personal.portfolio} onChange={update('portfolio')} />
    </div>
  )
}
