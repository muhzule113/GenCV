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

export default function LetterForm({ form, setForm, onGenerate, loading, hasContent }) {
  const [cvList, setCvList] = useState([])
  const [infoSourceOther, setInfoSourceOther] = useState('')
  const [isLoadingHighlights, setIsLoadingHighlights] = useState(false)
  const [recommendedHighlights, setRecommendedHighlights] = useState([])
  const [selectedHighlights, setSelectedHighlights] = useState([])
  const [customHighlight, setCustomHighlight] = useState('')

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
  }, [form.position])

  const toggleHighlight = (item) => {
    setSelectedHighlights((prev) =>
      prev.includes(item) ? prev.filter((h) => h !== item) : [...prev, item]
    )
  }

  const getFinalHighlights = () => {
    return [...selectedHighlights, customHighlight].filter(Boolean)
  }

  useEffect(() => {
    const finalHighlights = getFinalHighlights()
    if (JSON.stringify(finalHighlights) !== JSON.stringify(form.highlights)) {
      setForm({ ...form, highlights: finalHighlights })
    }
  }, [selectedHighlights, customHighlight])

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

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-h3 text-text-primary dark:text-text-primary-dark mb-1">Data Surat Lamaran</h3>
        <p className="text-sm text-text-muted dark:text-text-muted-dark">Isi informasi posisi dan perusahaan yang dituju.</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-text-primary dark:text-text-primary-dark mb-1.5">Pilih CV Referensi (opsional)</label>
        <select
          value={form.cv_id}
          onChange={(e) => setForm({ ...form, cv_id: e.target.value })}
          className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-border dark:border-border-dark rounded-lg text-body text-text-primary dark:text-text-primary-dark focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
        >
          <option value="">Pilih CV (opsional) — untuk isi data diri otomatis</option>
          {cvList.map((cv) => (
            <option key={cv.id} value={cv.id}>{cv.title}</option>
          ))}
        </select>
      </div>

      <Input label="Posisi yang Dilamar" placeholder="contoh: Staff Admin Pembangkit, Backend Developer" value={form.position} onChange={update('position')} required />

      <Input label="Nama Perusahaan" placeholder="contoh: PT Paguntaka Cahaya Nusantara" value={form.company} onChange={update('company')} required />

      <div className="relative">
        <Input
          label="Bidang / Industri Perusahaan (opsional)"
          placeholder="contoh: energi, teknologi, kesehatan, manufaktur"
          value={form.companyField}
          onChange={update('companyField')}
        />
        <span className="absolute right-2 top-9 text-text-muted dark:text-text-muted-dark cursor-help group">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <span className="absolute bottom-full right-0 mb-1 hidden group-hover:block bg-slate-800 text-white text-xs rounded px-2 py-1 w-48 text-center">Digunakan AI untuk personalisasi kalimat tentang perusahaan</span>
        </span>
      </div>

      <div>
        <label className="block text-sm font-medium text-text-primary dark:text-text-primary-dark mb-1.5">Sumber Informasi Lowongan</label>
        <select
          value={form.infoSource}
          onChange={(e) => {
            setForm({ ...form, infoSource: e.target.value })
            if (e.target.value !== 'Lainnya') setInfoSourceOther('')
          }}
          className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-border dark:border-border-dark rounded-lg text-body text-text-primary dark:text-text-primary-dark focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
        >
          <option value="">Pilih sumber informasi lowongan...</option>
          {infoSourceOptions.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
        {form.infoSource === 'Lainnya' && (
          <Input
            placeholder="Sebutkan sumber..."
            value={infoSourceOther}
            onChange={(e) => {
              setInfoSourceOther(e.target.value)
              setForm({ ...form, infoSource: e.target.value })
            }}
            className="mt-2"
          />
        )}
      </div>

      <Input
        label="Jabatan Penerima Surat"
        placeholder="HRD / Manajer Rekrutmen / Direktur"
        value={form.recipientTitle}
        onChange={update('recipientTitle')}
      />

      <div className="grid md:grid-cols-2 gap-5">
        <Input label="Kota" placeholder="Jakarta" value={form.city} onChange={update('city')} />
        <Input label="Tanggal Surat" type="date" value={form.letterDate} onChange={update('letterDate')} />
      </div>

      <div>
        <label className="block text-sm font-medium text-text-primary dark:text-text-primary-dark mb-1.5">Poin yang Ingin Ditonjolkan</label>

        {showRecommendBtn && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleLoadRecommendations}
            loading={isLoadingHighlights}
            className="mb-3"
          >
            {isLoadingHighlights ? 'AI sedang menganalisis kecocokan dengan posisi...' : 'Muat Rekomendasi AI'}
          </Button>
        )}

        {isLoadingHighlights && (
          <div className="flex items-center gap-2 text-sm text-text-muted dark:text-text-muted-dark mb-3">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            AI sedang menganalisis kecocokan dengan posisi...
          </div>
        )}

        {showRecommendations && (
          <div className="space-y-2 mb-3">
            {recommendedHighlights.map((item) => (
              <label key={item} className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedHighlights.includes(item)}
                  onChange={() => toggleHighlight(item)}
                  className="mt-1 accent-primary"
                />
                <span className="text-sm text-text-primary dark:text-text-primary-dark">{item}</span>
              </label>
            ))}
          </div>
        )}

        {showRecommendations && (
          <textarea
            value={customHighlight}
            onChange={(e) => setCustomHighlight(e.target.value)}
            placeholder="Atau tulis poin tambahan sendiri..."
            className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-border dark:border-border-dark rounded-lg text-body text-text-primary dark:text-text-primary-dark placeholder:text-text-muted dark:placeholder:text-text-muted-dark focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors resize-vertical min-h-[60px]"
            rows={2}
          />
        )}
      </div>

      {finalHighlights.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {finalHighlights.map((h) => (
            <span key={h} className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">{h}</span>
          ))}
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <Button onClick={onGenerate} loading={loading} className="flex-1 md:flex-none">
          {loading ? 'DeepSeek sedang menulis...' : 'Generate Surat'}
        </Button>
        {hasContent && (
          <Button variant="secondary">Simpan Draft</Button>
        )}
      </div>
    </div>
  )
}
