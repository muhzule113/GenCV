import { useState } from 'react'
import useProfileStore from '../../store/profileStore'
import useProfileSync from '../../hooks/useProfileSync'
import useAuthStore from '../../store/authStore'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import useToastStore from '../../store/toastStore'

export default function ProfilePage() {
  const profile = useProfileStore()
  const addToast = useToastStore((s) => s.addToast)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const { syncUp, syncDown } = useProfileSync()
  const [dirty, setDirty] = useState(false)
  const [syncing, setSyncing] = useState(false)

  const update = (field) => (e) => {
    setDirty(true)
    profile.updatePersonal(field, e.target.value)
  }

  const handleSave = () => {
    addToast('Profil berhasil disimpan! Data akan otomatis terpakai di CV dan Surat Lamaran.', 'success')
    setDirty(false)
  }

  const fields = [
    { key: 'name', label: 'Nama Lengkap', placeholder: 'Masukkan nama lengkap' },
    { key: 'jobTitle', label: 'Jabatan/Posisi', placeholder: 'Frontend Developer' },
    { key: 'email', label: 'Email', type: 'email', placeholder: 'email@contoh.com' },
    { key: 'phone', label: 'Nomor Telepon', placeholder: '+62 812-3456-7890' },
    { key: 'city', label: 'Kota', placeholder: 'Jakarta' },
    { key: 'address', label: 'Alamat Lengkap', placeholder: 'Jl. Contoh No. 123' },
    { key: 'birthPlace', label: 'Tempat Lahir', placeholder: 'Jakarta' },
    { key: 'birthDate', label: 'Tanggal Lahir', type: 'date', placeholder: '' },
    { key: 'gender', label: 'Jenis Kelamin', placeholder: 'Laki-laki / Perempuan' },
    { key: 'lastEducation', label: 'Pendidikan Terakhir', placeholder: 'S1 Teknik Informatika' },
    { key: 'linkedin', label: 'LinkedIn', placeholder: 'linkedin.com/in/username' },
    { key: 'github', label: 'GitHub', placeholder: 'github.com/username' },
    { key: 'portfolio', label: 'Portfolio Website', placeholder: 'https://portofolioanda.com' },
  ]

  return (
    <div className="min-h-screen bg-paper">
      <div className="container-page py-4 sm:py-6 max-w-2xl">
        <div className="mb-6">
          <span className="font-mono text-[11px] tracking-widest text-clip uppercase">Profil Saya</span>
          <h1 className="font-display text-h1 sm:text-display tracking-display text-ink mt-1">
            Data Diri
          </h1>
          <p className="text-sm text-muted mt-2">
            Isi data diri Anda sekali. Data ini akan otomatis digunakan di CV Builder dan Surat Lamaran.
          </p>
          {profile.savedAt && (
            <p className="text-xs text-muted mt-1">Terakhir disimpan: {new Date(profile.savedAt).toLocaleString('id-ID')}</p>
          )}
        </div>

        <div className="card p-5 sm:p-6 space-y-5">
          <div className="grid md:grid-cols-2 gap-4">
            {fields.map((f) => (
              <div key={f.key} className={f.key === 'address' || f.key === 'portfolio' ? 'md:col-span-2' : ''}>
                <Input
                  label={f.label}
                  type={f.type || 'text'}
                  placeholder={f.placeholder}
                  value={profile.personal[f.key] || ''}
                  onChange={update(f.key)}
                />
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-3 pt-4 border-t border-border">
            <Button onClick={handleSave} disabled={!dirty}>
              Simpan Profil
            </Button>
            {isAuthenticated && (
              <>
                <Button
                  variant="secondary"
                  loading={syncing}
                  onClick={async () => { setSyncing(true); await syncUp(); setSyncing(false) }}
                >
                  Upload ke Cloud
                </Button>
                <Button
                  variant="ghost"
                  loading={syncing}
                  onClick={async () => { setSyncing(true); await syncDown(); setSyncing(false) }}
                >
                  Download dari Cloud
                </Button>
              </>
            )}
            {profile.savedAt && (
              <Button variant="ghost" onClick={() => {
                profile.clearProfile()
                setDirty(false)
                addToast('Profil direset ke default', 'info')
              }}>
                Reset
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
