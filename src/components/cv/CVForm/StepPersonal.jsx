import Input from '../../common/Input'

export default function StepPersonal({ data, onChange }) {
  const update = (field) => (e) => onChange('personal', { ...data.personal, [field]: e.target.value })

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h3 className="text-lg sm:text-xl font-semibold text-ink mb-1 sm:mb-2">Informasi Dasar</h3>
        <p className="text-xs sm:text-sm text-muted">Lengkapi data diri Anda untuk ditampilkan di CV.</p>
      </div>

      {/* Informasi Pribadi */}
      <div className="card p-3 sm:p-4 lg:p-5 space-y-3 sm:space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-border">
          <div className="w-8 h-8 bg-primary/10 flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h4 className="font-medium text-sm sm:text-base text-ink">Informasi Pribadi</h4>
        </div>
        <div className="grid md:grid-cols-2 gap-3 sm:gap-4">
          <Input 
            label="Nama Lengkap" 
            placeholder="Masukkan nama lengkap" 
            value={data.personal.name} 
            onChange={update('name')} 
          />
          <Input 
            label="Jabatan/Posisi" 
            placeholder="Frontend Developer" 
            value={data.personal.jobTitle} 
            onChange={update('jobTitle')} 
          />
        </div>
      </div>

      {/* Informasi Kontak */}
      <div className="card p-3 sm:p-4 lg:p-5 space-y-3 sm:space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-border">
          <div className="w-8 h-8 bg-primary/10 flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h4 className="font-medium text-sm sm:text-base text-ink">Informasi Kontak</h4>
        </div>
        <div className="grid md:grid-cols-2 gap-3 sm:gap-4">
          <Input 
            label="Email" 
            type="email" 
            placeholder="email@contoh.com" 
            value={data.personal.email} 
            onChange={update('email')} 
          />
          <Input 
            label="Nomor Telepon" 
            placeholder="+62 812-3456-7890" 
            value={data.personal.phone} 
            onChange={update('phone')} 
          />
          <Input 
            label="Kota" 
            placeholder="Jakarta" 
            value={data.personal.city} 
            onChange={update('city')} 
          />
        </div>
      </div>

      {/* Media Sosial & Portfolio */}
      <div className="card p-3 sm:p-4 lg:p-5 space-y-3 sm:space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-border">
          <div className="w-8 h-8 bg-primary/10 flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </div>
          <div>
            <h4 className="font-medium text-sm sm:text-base text-ink">Media Sosial & Portfolio</h4>
            <p className="text-xs text-muted mt-0.5">Opsional - tambahkan untuk memperkuat profil Anda</p>
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-3 sm:gap-4">
          <Input 
            label="LinkedIn" 
            placeholder="linkedin.com/in/username" 
            value={data.personal.linkedin} 
            onChange={update('linkedin')} 
          />
          <Input 
            label="GitHub" 
            placeholder="github.com/username" 
            value={data.personal.github} 
            onChange={update('github')} 
          />
          <div className="md:col-span-2">
            <Input 
              label="Portfolio Website" 
              placeholder="https://portofolioanda.com" 
              value={data.personal.portfolio} 
              onChange={update('portfolio')} 
            />
          </div>
        </div>
      </div>
    </div>
  )
}
