import { useState, useEffect } from 'react'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import api from '../../services/api'

const infoSourceOptions = [
  'LinkedIn',
  'JobStreet',
  'Website Perusahaan',
  'Rekomendasi Rekan',
  'Media Sosial',
  'Lainnya',
]

const attachmentOptions = [
  { key: 'cv', label: 'Curriculum Vitae (CV)' },
  { key: 'foto', label: 'Pas Foto 3x4' },
  { key: 'ktp', label: 'Fotokopi KTP' },
  { key: 'ijazah', label: 'Fotokopi Ijazah' },
  { key: 'transkrip', label: 'Fotokopi Transkrip Nilai' },
  { key: 'sertifikat', label: 'Sertifikat Pendukung' },
]

const defaultAttachments = ['cv', 'foto', 'ktp', 'ijazah', 'transkrip']



function SectionIcon({ name, className = 'w-4 h-4' }) {
  const icons = {
    user: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    ),
    briefcase: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0" />
    ),
    paperclip: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
    ),
    calendar: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
    ),
    sparkle: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
    ),
    chevron: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    ),
    exclamation: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
    ),
  }
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      {icons[name]}
    </svg>
  )
}

function Section({ id, title, subtitle, icon, children, defaultOpen = true, completed = false, disabled = false }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <section className={`group rounded-2xl border border-border dark:border-border-dark bg-surface dark:bg-surface-2-dark shadow-card overflow-hidden transition-all duration-300 hover:shadow-md ${disabled ? 'opacity-60 pointer-events-none' : ''}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-surface-2 dark:hover:bg-slate-800/50 transition-colors"
      >
        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center ring-1 ring-primary/20">
          {completed ? (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          ) : (
            <SectionIcon name={icon} />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-semibold tracking-wider text-primary uppercase">Blok {id}</span>
            {completed && <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-success/10 text-success uppercase tracking-wider">Lengkap</span>}
          </div>
          <h4 className="text-sm font-semibold text-text-primary dark:text-text-primary-dark leading-tight">{title}</h4>
          <p className="text-xs text-text-muted dark:text-text-muted-dark mt-0.5">{subtitle}</p>
        </div>
        <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-text-muted dark:text-text-muted-dark transition-transform duration-300 ${open ? 'rotate-180' : ''}`}>
          <SectionIcon name="chevron" className="w-4 h-4" />
        </div>
      </button>
      <div className={`grid transition-all duration-300 ease-out ${open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
        <div className="overflow-hidden">
          <div className="px-4 pb-4 pt-1 space-y-4 border-t border-border/60 dark:border-border-dark/60">
            {children}
          </div>
        </div>
      </div>
    </section>
  )
}

function Select({ label, required, value, onChange, children, hint }) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-text-primary dark:text-text-primary-dark mb-1.5">
          {label} {required && <span className="text-danger">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          value={value}
          onChange={onChange}
          required={required}
          className="w-full appearance-none px-4 py-2.5 pr-10 bg-white dark:bg-slate-800 border border-border dark:border-border-dark rounded-xl text-body text-text-primary dark:text-text-primary-dark focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary hover:border-primary/50 transition-all"
        >
          {children}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-text-muted dark:text-text-muted-dark">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </div>
      </div>
      {hint && <p className="mt-1.5 text-xs text-text-muted dark:text-text-muted-dark">{hint}</p>}
    </div>
  )
}

function ToggleChip({ active, onClick, children, icon }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex items-center gap-2 px-3.5 py-2 rounded-full text-sm font-medium border transition-all duration-200 ${
        active
          ? 'bg-primary text-white border-primary shadow-sm'
          : 'bg-white dark:bg-slate-800 text-text-primary dark:text-text-primary-dark border-border dark:border-border-dark hover:border-primary/50 hover:bg-primary/5'
      }`}
    >
      {icon && <span className={active ? 'text-white' : 'text-text-muted dark:text-text-muted-dark'}>{icon}</span>}
      <span>{children}</span>
      {active && (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
      )}
    </button>
  )
}

export default function LetterForm({ form, setForm, onGenerate, onSaveDraft, saving = false, loading, hasContent, existingLetter, onViewExisting }) {
  const [cvList, setCvList] = useState([])
  const [isLoadingCV, setIsLoadingCV] = useState(false)
  const [infoSourceOther, setInfoSourceOther] = useState('')
  const [isLoadingHighlights, setIsLoadingHighlights] = useState(false)
  const [recommendedHighlights, setRecommendedHighlights] = useState([])
  const [selectedHighlights, setSelectedHighlights] = useState([])
  const [customHighlight, setCustomHighlight] = useState('')
  const [cvSkills, setCvSkills] = useState(null)

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  useEffect(() => {
    api.get('/api/cv').then((res) => {
      if (res.data?.success) setCvList(res.data.data || [])
    }).catch(() => {})
  }, [])

  useEffect(() => {
    setRecommendedHighlights([])
    setSelectedHighlights([])
    setCustomHighlight('')
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.position])

  useEffect(() => {
    setInfoSourceOther('')
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.infoSource])

  const handleLoadCV = async (cvId) => {
    setForm({ ...form, cv_id: cvId, highlights: [] })
    setCvSkills(null)
    if (onViewExisting) onViewExisting(cvId)
    if (!cvId) return
    setIsLoadingCV(true)
    try {
      const res = await api.get(`/api/cv/${cvId}`)
      if (res.data?.success && res.data.data?.data) {
        const d = res.data.data.data
        const p = d.personal || {}
        const edu = d.educations?.[0]
        const lastEdu = edu ? `${edu.degree || ''} ${edu.field || ''}`.trim() : ''

        setForm((prev) => ({
          ...prev,
          cv_id: cvId,
          personal: {
            name: p.name || '',
            email: p.email || '',
            phone: p.phone || '',
            address: p.address || '',
            birthPlace: p.birthPlace || '',
            birthDate: p.birthDate || '',
            gender: p.gender || '',
            lastEducation: lastEdu,
            portfolio: p.portfolio || '',
          },
        }))

        const skills = d.skills || {}
        setCvSkills({
          technical: skills.technical || [],
          soft: skills.soft || [],
        })
      }
    } catch (err) {
      console.error('Failed to load CV', err)
    } finally {
      setIsLoadingCV(false)
    }
  }

  const toggleHighlight = (item) => {
    setSelectedHighlights((prev) =>
      prev.includes(item) ? prev.filter((h) => h !== item) : [...prev, item]
    )
  }

  const getFinalHighlights = () => {
    return [...selectedHighlights, customHighlight].filter(Boolean)
  }

  useEffect(() => {
    const h = [...selectedHighlights, customHighlight].filter(Boolean)
    setForm((prev) =>
      JSON.stringify(h) !== JSON.stringify(prev.highlights)
        ? { ...prev, highlights: h }
        : prev
    )
  }, [selectedHighlights, customHighlight, setForm])

  const handleLoadRecommendations = async () => {
    setIsLoadingHighlights(true)
    try {
      const { recommendHighlights } = await import('../../services/aiService')
      const result = await recommendHighlights({
        position: form.position,
        cv_id: form.cv_id || undefined,
      })
      setRecommendedHighlights(result || [])
      setSelectedHighlights([])
    } catch {
      const fallback = ['Pengalaman relevan di bidang terkait', 'Kemampuan belajar cepat', 'Komitmen terhadap target', 'Komunikasi efektif', 'Integritas dan etos kerja tinggi']
      setRecommendedHighlights(fallback)
      setSelectedHighlights([])
    } finally {
      setIsLoadingHighlights(false)
    }
  }

  const positionLongEnough = form.position?.length > 3
  const showRecommendBtn = positionLongEnough && recommendedHighlights.length === 0
  const showRecommendations = recommendedHighlights.length > 0
  const finalHighlights = getFinalHighlights()

  const toggleAttachment = (key) => {
    const current = form.attachments?.length ? form.attachments : defaultAttachments
    const next = current.includes(key) ? current.filter((k) => k !== key) : [...current, key]
    setForm({ ...form, attachments: next })
  }

  const customAttachment = form.customAttachment || ''
  const currentAttachments = form.attachments?.length ? form.attachments : defaultAttachments
  const attachmentsList = currentAttachments.map(
    (key) => attachmentOptions.find((o) => o.key === key)?.label || key
  )
  if (customAttachment.trim()) attachmentsList.push(customAttachment.trim())

  const isBlockAComplete = form.cv_id && form.personal.name
  const isBlockBComplete = form.company && form.recipientTitle && form.position
  const isBlockCComplete = currentAttachments.length > 0
  const isBlockDComplete = form.city && form.letterDate

  const identityFields = [
    { label: 'Nama Lengkap', value: form.personal.name },
    { label: 'Tempat, Tgl Lahir', value: form.personal.birthPlace && form.personal.birthDate ? `${form.personal.birthPlace}, ${form.personal.birthDate}` : (form.personal.birthPlace || form.personal.birthDate) },
    { label: 'Jenis Kelamin', value: form.personal.gender },
    { label: 'Pendidikan Terakhir', value: form.personal.lastEducation },
    { label: 'Alamat', value: form.personal.address },
    { label: 'Nomor HP', value: form.personal.phone },
    { label: 'E-mail', value: form.personal.email },
    { label: 'Portofolio', value: form.personal.portfolio },
  ].filter((f) => f.value)

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/5 via-primary/[0.02] to-transparent border border-primary/10 p-5">
        <div className="absolute -right-8 -top-8 w-32 h-32 bg-primary/5 rounded-full blur-2xl" />
        <div className="absolute -right-4 -bottom-8 w-24 h-24 bg-primary/10 rounded-full blur-xl" />
        <div className="relative">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-semibold mb-2">
            <SectionIcon name="sparkle" className="w-4 h-4" />
            <span>AI Cover Letter</span>
          </div>
          <h3 className="text-xl font-semibold text-text-primary dark:text-text-primary-dark">Data Surat Lamaran</h3>
          <p className="text-sm text-text-muted dark:text-text-muted-dark mt-1">Pilih CV sebagai dasar pembuatan surat lamaran.</p>
        </div>
      </div>

      {existingLetter && (
        <div className="rounded-2xl border border-warning/40 bg-warning/5 p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-warning/10 text-warning flex items-center justify-center">
              <SectionIcon name="exclamation" className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-text-primary dark:text-text-primary-dark">Surat lamaran untuk CV ini sudah ada</p>
              <p className="text-xs text-text-muted dark:text-text-muted-dark mt-0.5">Hanya diperbolehkan satu surat per CV. Hapus surat yang ada jika ingin membuat ulang.</p>
            </div>
          </div>
        </div>
      )}

      <Section
        id="A"
        title="Data Pelamar"
        subtitle="Diambil otomatis dari CV"
        icon="user"
        completed={isBlockAComplete}
        defaultOpen
      >
        <div>
          <label className="block text-sm font-medium text-text-primary dark:text-text-primary-dark mb-1.5">
            Pilih CV <span className="text-danger">*</span>
          </label>
          <Select
            value={form.cv_id}
            onChange={(e) => handleLoadCV(e.target.value)}
            hint="Pilih CV untuk mengisi data diri otomatis. Hanya 1 surat per CV."
          >
            <option value="">Pilih CV (wajib)</option>
            {cvList.map((cv) => (
              <option key={cv.id} value={cv.id}>{cv.title}</option>
            ))}
          </Select>
          {isLoadingCV && (
            <div className="mt-2 flex items-center gap-2 text-xs text-text-muted dark:text-text-muted-dark">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span>Memuat data CV...</span>
            </div>
          )}
        </div>

        {form.personal.name && (
          <div className="p-4 rounded-xl bg-surface-2 dark:bg-slate-800/50 border border-border/60 dark:border-border-dark/60">
            <p className="text-xs font-semibold text-text-muted dark:text-text-muted-dark uppercase tracking-wider mb-2">Identitas dari CV</p>
            <div className="space-y-1.5">
              {identityFields.map((f) => (
                <div key={f.label} className="flex text-sm">
                  <span className="text-text-muted dark:text-text-muted-dark w-32 shrink-0">{f.label}</span>
                  <span className="text-text-primary dark:text-text-primary-dark">{f.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {cvSkills && (cvSkills.technical.length > 0 || cvSkills.soft.length > 0) && (
          <div className="p-4 rounded-xl bg-surface-2 dark:bg-slate-800/50 border border-border/60 dark:border-border-dark/60">
            <p className="text-xs font-semibold text-text-muted dark:text-text-muted-dark uppercase tracking-wider mb-2">Keahlian dari CV</p>
            {cvSkills.technical.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {cvSkills.technical.map((s) => (
                  <span key={s} className="px-2 py-0.5 bg-primary/10 text-primary rounded text-xs font-medium">{s}</span>
                ))}
              </div>
            )}
            {cvSkills.soft.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {cvSkills.soft.map((s) => (
                  <span key={s} className="px-2 py-0.5 bg-surface dark:bg-slate-700 text-text-muted dark:text-text-muted-dark rounded text-xs">{s}</span>
                ))}
              </div>
            )}
          </div>
        )}
      </Section>

      <Section
        id="B"
        title="Data Lamaran"
        subtitle="Perusahaan & posisi yang dituju"
        icon="briefcase"
        completed={isBlockBComplete}
        defaultOpen
      >
        <div className="grid md:grid-cols-2 gap-4">
          <Input label="Nama Perusahaan" required placeholder="contoh: PT Pertamina" value={form.company} onChange={update('company')} />
          <Input label="Divisi / Departemen Tujuan" required placeholder="contoh: HRD, Manajer Rekrutmen" value={form.recipientTitle} onChange={update('recipientTitle')} />
          <Input label="Posisi yang Dilamar" required placeholder="contoh: Staf Admin Pembangkit" value={form.position} onChange={update('position')} />
          <Input label="Bidang / Industri Perusahaan" placeholder="contoh: energi, teknologi" value={form.companyField} onChange={update('companyField')} hint="Opsional — membantu AI menyesuaikan konteks industri" />
          <div className="md:col-span-2">
            <Input label="Pengalaman Kerja Relevan" placeholder="contoh: 2 tahun admin perkantoran" value={form.relevantExperience} onChange={update('relevantExperience')} hint="Opsional — ceritakan pengalaman yang relevan dengan posisi" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary dark:text-text-primary-dark mb-2">
            Sumber Informasi Lowongan <span className="text-text-muted dark:text-text-muted-dark font-normal">(opsional)</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {infoSourceOptions.map((opt) => (
              <ToggleChip
                key={opt}
                active={form.infoSource === opt || (opt === 'Lainnya' && infoSourceOther && form.infoSource === infoSourceOther)}
                onClick={() => setForm({ ...form, infoSource: opt })}
              >
                {opt}
              </ToggleChip>
            ))}
          </div>
          {form.infoSource === 'Lainnya' && (
            <div className="mt-3">
              <Input
                placeholder="Sebutkan sumber informasi lowongan..."
                value={infoSourceOther}
                onChange={(e) => {
                  setInfoSourceOther(e.target.value)
                  setForm({ ...form, infoSource: e.target.value })
                }}
              />
            </div>
          )}
        </div>
      </Section>

      <Section
        id="C"
        title="Lampiran"
        subtitle="Dokumen pendukung yang dilampirkan"
        icon="paperclip"
        completed={isBlockCComplete}
        defaultOpen={false}
      >
        <div>
          <p className="text-sm text-text-muted dark:text-text-muted-dark mb-3">Pilih dokumen yang akan dilampirkan pada surat.</p>
          <div className="grid sm:grid-cols-2 gap-2">
            {attachmentOptions.map((opt) => {
              const checked = currentAttachments.includes(opt.key)
              return (
                <label
                  key={opt.key}
                  className={`group flex items-center gap-3 px-3.5 py-2.5 rounded-xl border cursor-pointer transition-all duration-200 ${
                    checked
                      ? 'border-primary bg-primary/5 shadow-sm'
                      : 'border-border dark:border-border-dark hover:border-primary/40 hover:bg-surface-2 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <div className={`flex-shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                    checked ? 'bg-primary border-primary' : 'border-border dark:border-border-dark bg-white dark:bg-slate-800'
                  }`}>
                    {checked && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    )}
                  </div>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleAttachment(opt.key)}
                    className="sr-only"
                  />
                  <span className={`text-sm ${checked ? 'text-text-primary dark:text-text-primary-dark font-medium' : 'text-text-primary dark:text-text-primary-dark'}`}>
                    {opt.label}
                  </span>
                </label>
              )
            })}
          </div>
          <div className="mt-4">
            <Input
              label="Lampiran lainnya"
              placeholder="contoh: Surat Keterangan Pengalaman Kerja"
              value={customAttachment}
              onChange={(e) => setForm({ ...form, customAttachment: e.target.value })}
              hint="Opsional — ketik lampiran tambahan di luar daftar"
            />
          </div>
          {attachmentsList.length > 0 && (
            <div className="mt-4 p-4 rounded-xl bg-surface-2 dark:bg-slate-800/50 border border-border/60 dark:border-border-dark/60">
              <div className="flex items-center gap-2 mb-2.5">
                <SectionIcon name="paperclip" className="w-4 h-4 text-text-muted dark:text-text-muted-dark" />
                <span className="text-xs font-semibold text-text-muted dark:text-text-muted-dark uppercase tracking-wider">Ringkasan ({attachmentsList.length})</span>
              </div>
              <ol className="space-y-1.5">
                {attachmentsList.map((label, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-text-primary dark:text-text-primary-dark">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-semibold flex items-center justify-center">{i + 1}</span>
                    <span>{label}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      </Section>

      <Section
        id="D"
        title="Lokasi & Tanggal"
        subtitle="Tempat dan waktu penulisan surat"
        icon="calendar"
        completed={isBlockDComplete}
        defaultOpen={false}
      >
        <div className="grid md:grid-cols-2 gap-4">
          <Input label="Kota Penulisan" required placeholder="contoh: Barru" value={form.city} onChange={update('city')} />
          <Input label="Tanggal Surat" required type="date" value={form.letterDate} onChange={update('letterDate')} />
        </div>
      </Section>

      <section className="rounded-2xl border border-border dark:border-border-dark bg-surface dark:bg-surface-2-dark shadow-card overflow-hidden">
        <div className="px-4 py-3.5 flex items-center gap-3 border-b border-border/60 dark:border-border-dark/60">
          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary-dark text-white flex items-center justify-center shadow-sm">
            <SectionIcon name="sparkle" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-text-primary dark:text-text-primary-dark">Poin yang Ingin Ditonjolkan</h4>
            <p className="text-xs text-text-muted dark:text-text-muted-dark mt-0.5">Bantu AI menonjolkan keunggulanmu yang paling relevan</p>
          </div>
        </div>

        <div className="p-4 space-y-3">
          {showRecommendBtn && (
            <div className="rounded-xl border border-dashed border-primary/40 bg-primary/[0.03] p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="flex-1">
                <p className="text-sm font-medium text-text-primary dark:text-text-primary-dark">Butuh inspirasi?</p>
                <p className="text-xs text-text-muted dark:text-text-muted-dark mt-0.5">Minta AI menganalisis posisi & CV untuk rekomendasi poin unggulan.</p>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={handleLoadRecommendations}
                loading={isLoadingHighlights}
                className="shrink-0"
              >
                {isLoadingHighlights ? 'Menganalisis...' : 'Muat Rekomendasi AI'}
              </Button>
            </div>
          )}

          {isLoadingHighlights && (
            <div className="flex items-center gap-3 text-sm text-text-muted dark:text-text-muted-dark p-4 rounded-xl bg-surface-2 dark:bg-slate-800/50">
              <div className="relative w-8 h-8">
                <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
                <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary animate-spin" />
              </div>
              <div>
                <p className="font-medium text-text-primary dark:text-text-primary-dark">AI sedang menganalisis</p>
                <p className="text-xs">Mencocokkan profil dengan posisi yang dilamar...</p>
              </div>
            </div>
          )}

          {showRecommendations && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-text-muted dark:text-text-muted-dark uppercase tracking-wider">Rekomendasi</p>
              <div className="space-y-2">
                {recommendedHighlights.map((item) => (
                  <label
                    key={item}
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all duration-200 ${
                      selectedHighlights.includes(item)
                        ? 'border-primary bg-primary/5 shadow-sm'
                        : 'border-border dark:border-border-dark hover:border-primary/40 hover:bg-surface-2 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <div className={`flex-shrink-0 mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                      selectedHighlights.includes(item) ? 'bg-primary border-primary' : 'border-border dark:border-border-dark bg-white dark:bg-slate-800'
                    }`}>
                      {selectedHighlights.includes(item) && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                      )}
                    </div>
                    <input
                      type="checkbox"
                      checked={selectedHighlights.includes(item)}
                      onChange={() => toggleHighlight(item)}
                      className="sr-only"
                    />
                    <span className="text-sm text-text-primary dark:text-text-primary-dark leading-relaxed">{item}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {showRecommendations && (
            <div>
              <label className="block text-xs font-semibold text-text-muted dark:text-text-muted-dark uppercase tracking-wider mb-1.5">Poin Tambahan</label>
              <textarea
                value={customHighlight}
                onChange={(e) => setCustomHighlight(e.target.value)}
                placeholder="Tulis poin tambahan yang ingin ditonjolkan..."
                className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-border dark:border-border-dark rounded-xl text-body text-text-primary dark:text-text-primary-dark placeholder:text-text-muted dark:placeholder:text-text-muted-dark focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary hover:border-primary/50 transition-all resize-vertical min-h-[70px]"
                rows={2}
              />
            </div>
          )}

          {finalHighlights.length > 0 && (
            <div className="p-4 rounded-xl bg-gradient-to-br from-primary/5 to-primary/[0.02] border border-primary/20">
              <div className="flex items-center gap-2 mb-2.5">
                <SectionIcon name="sparkle" className="w-4 h-4 text-primary" />
                <span className="text-xs font-semibold text-primary uppercase tracking-wider">Poin Terpilih ({finalHighlights.length})</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {finalHighlights.map((h) => (
                  <span key={h} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-800 text-text-primary dark:text-text-primary-dark rounded-full text-sm border border-primary/20 shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    {h}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <div className="sticky bottom-0 -mx-4 sm:-mx-6 px-4 sm:px-6 py-3 bg-gradient-to-t from-surface via-surface to-transparent dark:from-surface-dark dark:via-surface-dark dark:to-transparent border-t border-border/60 dark:border-border-dark/60 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            onClick={onGenerate}
            loading={loading}
            size="md"
            disabled={!form.cv_id || !!existingLetter}
            className="flex-1 sm:flex-none shadow-sm shadow-primary/20"
          >
            <SectionIcon name="sparkle" className="w-4 h-4" />
            {loading ? 'AI sedang menulis...' : 'Generate Surat'}
          </Button>
          {hasContent && (
            <Button
              variant="secondary"
              size="md"
              onClick={onSaveDraft}
              loading={saving}
              className="flex-1 sm:flex-none"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z M17 21v-8H7v8 M7 3v5h8" />
              </svg>
              {saving ? 'Menyimpan...' : 'Simpan Draft'}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}