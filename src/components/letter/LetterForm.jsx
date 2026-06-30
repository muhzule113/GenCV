import { useState, useEffect, useRef } from 'react'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import DatePicker from '../../components/common/DatePicker'
import AIActionChip from '../../components/common/AIActionChip'
import api from '../../services/api'
import useConfirmStore from '../../store/confirmStore'

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

function SectionLabel({ children }) {
  return <span className="font-mono text-[11px] tracking-widest text-clip uppercase">{children}</span>
}

function ToggleChip({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium border transition-colors duration-150 ${active
        ? 'bg-ink text-paper border-ink'
        : 'bg-surface text-ink border-border hover:border-ink'
        }`}
    >
      {children}
      {active && (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
      )}
    </button>
  )
}

export default function LetterForm({ form, setForm, onGenerate, onSaveDraft, saving = false, loading, existingLetter, onViewExisting, initialSkills }) {
  const requestConfirm = useConfirmStore((s) => s.requestConfirm)
  const [cvList, setCvList] = useState([])
  const [isLoadingCV, setIsLoadingCV] = useState(false)
  const [infoSourceOther, setInfoSourceOther] = useState('')
  const [isLoadingHighlights, setIsLoadingHighlights] = useState(false)
  const [recommendedHighlights, setRecommendedHighlights] = useState([])
  const [selectedHighlights, setSelectedHighlights] = useState([])
  const [customHighlight, setCustomHighlight] = useState('')
  const [cvSkills, setCvSkills] = useState(null)
  const highlightsMounted = useRef(false)

  // Initialize cvSkills from prop (used in edit mode)
  useEffect(() => {
    if (initialSkills && !cvSkills) {
      setCvSkills(initialSkills)
    }
  }, [initialSkills])  // eslint-disable-line react-hooks/exhaustive-deps

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  useEffect(() => {
    api.get('/api/cv').then((res) => {
      if (res.data?.success) setCvList(res.data.data || [])
    }).catch(() => { })
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
    // Skip initial mount — hanya jalankan saat user benar-benar memilih highlight
    // Cleanup mereset flag agar React StrictMode double-invoke tidak melewati guard ini
    if (!highlightsMounted.current) {
      highlightsMounted.current = true
      return () => { highlightsMounted.current = false }
    }
    const h = [...selectedHighlights, customHighlight].filter(Boolean)
    setForm((prev) =>
      JSON.stringify(h) !== JSON.stringify(prev.highlights)
        ? { ...prev, highlights: h }
        : prev
    )
  }, [selectedHighlights, customHighlight, setForm])

  const handleLoadRecommendations = async () => {
    if (!await requestConfirm('Fitur ini akan menggunakan')) return
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
    <div className="space-y-5">
      {/* Header */}
      <div className="pb-5 border-b-2 border-ink">
        <SectionLabel>AI Cover Letter</SectionLabel>
        <h3 className="font-display text-h3 text-ink mt-1">Data Surat Lamaran</h3>
        <p className="text-sm text-muted mt-1">Pilih CV sebagai dasar pembuatan surat lamaran.</p>
      </div>

      {existingLetter && (
        <div className="border border-warning p-4 bg-paper">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-warning/10 text-warning flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-ink">Surat lamaran untuk CV ini sudah ada</p>
              <p className="text-xs text-muted mt-0.5">Hanya diperbolehkan satu surat per CV. Hapus surat yang ada jika ingin membuat ulang.</p>
            </div>
          </div>
        </div>
      )}

      {/* Block A — Data Pelamar */}
      <div>
        <div className="px-0 py-3 border-b border-border flex items-start gap-2">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-8 h-8 shrink-0 bg-ink/10 text-ink flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            </div>
            <div>
              <SectionLabel>Blok A</SectionLabel>
              <h4 className="font-display text-h3 text-ink leading-tight">Data Pelamar</h4>
              <p className="text-xs text-muted">Diambil otomatis dari CV</p>
            </div>
          </div>
          {isBlockAComplete && (
            <span className="font-mono text-[10px] tracking-wider text-success px-2 py-0.5 border border-success shrink-0">Lengkap</span>
          )}
        </div>
        <div className="pt-4 space-y-4">
          <div>
            <label className="block text-sm text-ink mb-1.5">
              Pilih CV <span className="text-danger">*</span>
            </label>
            <select
              value={form.cv_id}
              onChange={(e) => handleLoadCV(e.target.value)}
              className="field"
            >
              <option value="">Pilih CV (wajib)</option>
              {cvList.map((cv) => (
                <option key={cv.id} value={cv.id}>{cv.title}</option>
              ))}
            </select>
            <p className="mt-1 text-xs text-muted">Pilih CV untuk mengisi data diri otomatis. Hanya 1 surat per CV.</p>
            {isLoadingCV && (
              <div className="mt-2 flex items-center gap-2 text-xs text-muted">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span>Memuat data CV...</span>
              </div>
            )}
          </div>

          {form.personal.name && (
            <div className="border border-border bg-surface/50 p-4">
              <SectionLabel>Identitas dari CV</SectionLabel>
              <div className="space-y-1.5 mt-2">
                {identityFields.map((f) => (
                  <div key={f.label} className="text-sm">
                    <span className="text-muted text-xs">{f.label}</span>
                    <p className="text-ink">{f.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {cvSkills && (cvSkills.technical.length > 0 || cvSkills.soft.length > 0) && (
            <div className="border border-border bg-surface/50 p-4">
              <SectionLabel>Keahlian dari CV</SectionLabel>
              <div className="mt-2 space-y-2">
                {cvSkills.technical.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {cvSkills.technical.map((s) => (
                      <span key={s} className="px-2 py-0.5 bg-ink/10 text-ink text-xs">{s}</span>
                    ))}
                  </div>
                )}
                {cvSkills.soft.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {cvSkills.soft.map((s) => (
                      <span key={s} className="px-2 py-0.5 border border-border text-muted text-xs">{s}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Block B — Data Lamaran */}
      <div>
        <div className="px-0 py-3 border-b border-border flex items-start gap-2">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-8 h-8 shrink-0 bg-ink/10 text-ink flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
            </div>
            <div>
              <SectionLabel>Blok B</SectionLabel>
              <h4 className="font-display text-h3 text-ink leading-tight">Data Lamaran</h4>
              <p className="text-xs text-muted">Perusahaan & posisi yang dituju</p>
            </div>
          </div>
          {isBlockBComplete && (
            <span className="font-mono text-[10px] tracking-wider text-success px-2 py-0.5 border border-success shrink-0">Lengkap</span>
          )}
        </div>
        <div className="pt-4 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Input label="Nama Perusahaan" required placeholder="contoh: PT Pertamina" value={form.company} onChange={update('company')} />
            <Input label="Divisi / Departemen Tujuan" required placeholder="contoh: HRD, Manajer Rekrutmen" value={form.recipientTitle} onChange={update('recipientTitle')} />
            <Input label="Posisi yang Dilamar" required placeholder="contoh: Staf Admin Pembangkit" value={form.position} onChange={update('position')} />
            <Input label="Bidang / Industri Perusahaan" placeholder="contoh: energi, teknologi" value={form.companyField} onChange={update('companyField')} />
            <div className="md:col-span-2">
              <Input label="Pengalaman Kerja Relevan" placeholder="contoh: 2 tahun admin perkantoran" value={form.relevantExperience} onChange={update('relevantExperience')} />
            </div>
          </div>

          <div>
            <label className="block text-sm text-ink mb-2">
              Sumber Informasi Lowongan <span className="text-muted">(opsional)</span>
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
        </div>
      </div>

      {/* Block C — Lampiran */}
      <div>
        <div className="px-0 py-3 border-b border-border flex items-start gap-2">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-8 h-8 shrink-0 bg-ink/10 text-ink flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
              </svg>
            </div>
            <div>
              <SectionLabel>Blok C</SectionLabel>
              <h4 className="font-display text-h3 text-ink leading-tight">Lampiran</h4>
              <p className="text-xs text-muted">Dokumen pendukung yang dilampirkan</p>
            </div>
          </div>
          {isBlockCComplete && (
            <span className="font-mono text-[10px] tracking-wider text-success px-2 py-0.5 border border-success shrink-0">Lengkap</span>
          )}
        </div>
        <div className="pt-4 space-y-4">
          <p className="text-xs text-muted">Pilih dokumen yang akan dilampirkan pada surat.</p>
          <div className="grid sm:grid-cols-2 gap-2">
            {attachmentOptions.map((opt) => {
              const checked = currentAttachments.includes(opt.key)
              return (
                <label
                  key={opt.key}
                  className={`flex items-center gap-3 px-3 py-2.5 border cursor-pointer transition-colors duration-150 ${checked ? 'border-ink bg-ink' : 'border-border hover:border-ink'
                    }`}
                >
                  <div className={`flex-shrink-0 w-5 h-5 border-2 flex items-center justify-center transition-colors ${checked ? 'bg-paper border-paper' : 'border-border bg-surface'
                    }`}>
                    {checked && (
                      <svg className="w-3 h-3 text-ink" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    )}
                  </div>
                  <input type="checkbox" checked={checked} onChange={() => toggleAttachment(opt.key)} className="sr-only" />
                  <span className={`text-sm ${checked ? 'text-paper font-medium' : 'text-ink'}`}>
                    {opt.label}
                  </span>
                </label>
              )
            })}
          </div>
          <div>
            <Input
              label="Lampiran lainnya"
              placeholder="contoh: Surat Keterangan Pengalaman Kerja"
              value={customAttachment}
              onChange={(e) => setForm({ ...form, customAttachment: e.target.value })}
            />
          </div>
          {attachmentsList.length > 0 && (
            <div className="border border-border bg-surface/50 p-4">
              <SectionLabel>Ringkasan ({attachmentsList.length})</SectionLabel>
              <ol className="space-y-1 mt-2">
                {attachmentsList.map((label, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-ink">
                    <span className="flex-shrink-0 w-5 h-5 bg-ink/10 text-ink text-xs font-semibold flex items-center justify-center">{i + 1}</span>
                    <span>{label}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      </div>

      {/* Block D — Lokasi & Tanggal */}
      <div>
        <div className="px-0 py-3 border-b border-border flex items-start gap-2">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-8 h-8 shrink-0 bg-ink/10 text-ink flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
            </div>
            <div>
              <SectionLabel>Blok D</SectionLabel>
              <h4 className="font-display text-h3 text-ink leading-tight">Lokasi & Tanggal</h4>
              <p className="text-xs text-muted">Tempat dan waktu penulisan surat</p>
            </div>
          </div>
          {isBlockDComplete && (
            <span className="font-mono text-[10px] tracking-wider text-success px-2 py-0.5 border border-success shrink-0">Lengkap</span>
          )}
        </div>
        <div className="pt-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Input label="Kota Penulisan" required placeholder="contoh: Barru" value={form.city} onChange={update('city')} />
            <DatePicker label="Tanggal Surat" required value={form.letterDate} onChange={update('letterDate')} />
          </div>
        </div>
      </div>


      {/* Highlights */}
      <div className="card">
        <div className="px-4 py-3 border-b border-border">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-8 h-8 bg-ink/10 text-ink flex items-center justify-center shrink-0">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-display text-h3 text-ink leading-tight">Poin yang Ingin Ditonjolkan</h4>
              <p className="text-xs text-muted">Bantu AI menonjolkan keunggulanmu yang paling relevan</p>
            </div>
            {showRecommendBtn && (
              <AIActionChip icon="sparkles" label="Rekomendasi AI" onClick={handleLoadRecommendations} loading={isLoadingHighlights} />
            )}
          </div>
        </div>
        <div className="p-4 space-y-4">
          {isLoadingHighlights && (
            <div className="flex items-center gap-3 text-sm text-muted p-4">
              <div className="w-8 h-8 border-2 border-ink" />
              <div>
                <p className="font-medium text-ink">AI sedang menganalisis</p>
                <p className="text-xs">Mencocokkan profil dengan posisi yang dilamar...</p>
              </div>
            </div>
          )}

          {showRecommendations && (
            <div className="space-y-2">
              <SectionLabel>Rekomendasi</SectionLabel>
              <div className="space-y-2">
                {recommendedHighlights.map((item) => (
                  <label
                    key={item}
                    className={`flex items-start gap-3 p-3 border cursor-pointer transition-colors duration-150 ${selectedHighlights.includes(item)
                      ? 'border-ink bg-ink'
                      : 'border-border hover:border-ink'
                      }`}
                  >
                    <div className={`flex-shrink-0 mt-0.5 w-5 h-5 border-2 flex items-center justify-center transition-colors ${selectedHighlights.includes(item) ? 'bg-paper border-paper' : 'border-border bg-surface'
                      }`}>
                      {selectedHighlights.includes(item) && (
                        <svg className="w-3 h-3 text-ink" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                      )}
                    </div>
                    <input type="checkbox" checked={selectedHighlights.includes(item)} onChange={() => toggleHighlight(item)} className="sr-only" />
                    <span className={`text-sm ${selectedHighlights.includes(item) ? 'text-paper' : 'text-ink'}`}>{item}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {showRecommendations && (
            <div>
              <SectionLabel>Poin Tambahan</SectionLabel>
              <textarea
                value={customHighlight}
                onChange={(e) => setCustomHighlight(e.target.value)}
                placeholder="Tulis poin tambahan yang ingin ditonjolkan..."
                className="field resize-vertical min-h-[70px] mt-1"
                rows={2}
              />
            </div>
          )}

          {finalHighlights.length > 0 && (
            <div className="border border-ink p-4">
              <SectionLabel>Poin Terpilih ({finalHighlights.length})</SectionLabel>
              <div className="flex flex-wrap gap-2 mt-2">
                {finalHighlights.map((h) => (
                  <span key={h} className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-ink text-xs text-ink">
                    {h}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sticky Footer */}
      <div className="sticky bottom-0 py-3 bg-surface border-t border-border">
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            onClick={onGenerate}
            loading={loading}
            size="md"
            disabled={!form.cv_id || !!existingLetter}
            className="flex-1 sm:flex-none"
          >
            {loading ? 'AI sedang menulis...' : 'Generate Surat'}
          </Button>
          <Button variant="secondary" size="md" onClick={onSaveDraft} loading={saving} disabled={!form.cv_id} className="flex-1 sm:flex-none">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z M17 21v-8H7v8 M7 3v5h8" />
            </svg>
            {saving ? 'Menyimpan...' : 'Simpan Draft'}
          </Button>
        </div>
      </div>
    </div>
  )
}
