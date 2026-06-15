import { useState, useRef } from 'react'
import Input from '../../common/Input'
import Button from '../../common/Button'

export default function StepSummary({ data, onChange, onGenerate, generating }) {
  const textareaRef = useRef(null)
  const [targetPosition, setTargetPosition] = useState('')
  const [tone, setTone] = useState('profesional')
  const [language, setLanguage] = useState('id')

  const handleGenerate = async () => {
    if (!targetPosition.trim()) return
    const summary = await onGenerate({ targetPosition, tone, language })
    if (summary) {
      setTimeout(() => {
        textareaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        textareaRef.current?.focus()
      }, 200)
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-h3 text-text-primary dark:text-text-primary-dark mb-1">Ringkasan Profil</h3>
        <p className="text-sm text-text-muted dark:text-text-muted-dark">Deskripsikan diri Anda dalam 2-3 kalimat.</p>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-card p-5 space-y-4">
        <p className="text-sm font-semibold text-blue-800 dark:text-blue-300">Referensi untuk AI</p>

        <div>
          <label className="block text-sm font-medium text-text-primary dark:text-text-primary-dark mb-1.5">
            Target Posisi yang Dilamar <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="contoh: Backend Developer, Staff Admin, Data Analyst"
            value={targetPosition}
            onChange={(e) => setTargetPosition(e.target.value)}
            className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-border dark:border-border-dark rounded-lg text-body text-text-primary dark:text-text-primary-dark placeholder:text-text-muted dark:placeholder:text-text-muted-dark focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary dark:text-text-primary-dark mb-2">
            Tone Ringkasan
          </label>
          <div className="flex flex-wrap gap-4">
            {[
              { value: 'profesional', label: 'Profesional', desc: 'formal, terstruktur, cocok untuk perusahaan korporat' },
              { value: 'percaya-diri', label: 'Percaya Diri', desc: 'tegas, menonjolkan pencapaian' },
              { value: 'adaptif', label: 'Adaptif', desc: 'fleksibel, cocok untuk multi-industri' },
            ].map((opt) => (
              <label key={opt.value} className="flex items-start gap-2 cursor-pointer group">
                <input
                  type="radio"
                  name="tone"
                  value={opt.value}
                  checked={tone === opt.value}
                  onChange={(e) => setTone(e.target.value)}
                  className="mt-1 accent-primary"
                />
                <div>
                  <span className="text-sm font-medium text-text-primary dark:text-text-primary-dark group-hover:text-primary transition-colors">{opt.label}</span>
                  <p className="text-xs text-text-muted dark:text-text-muted-dark">{opt.desc}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary dark:text-text-primary-dark mb-2">
            Bahasa Output
          </label>
          <div className="flex gap-6">
            {[
              { value: 'id', label: 'Bahasa Indonesia' },
              { value: 'en', label: 'English' },
            ].map((opt) => (
              <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="language"
                  value={opt.value}
                  checked={language === opt.value}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="accent-primary"
                />
                <span className="text-sm text-text-primary dark:text-text-primary-dark">{opt.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={handleGenerate}
        loading={generating}
        disabled={!targetPosition.trim() || generating}
        className="gap-2"
      >
        <svg className={`w-4 h-4 ${generating ? 'animate-pulse' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        {generating ? 'DeepSeek sedang menyusun ringkasan...' : 'Generate dengan AI'}
      </Button>

      <div ref={textareaRef}>
        <Input
          type="textarea"
          placeholder="Full Stack Developer dengan pengalaman 3 tahun dalam pengembangan web menggunakan React.js dan Node.js..."
          value={data.summary}
          onChange={(e) => onChange('summary', e.target.value)}
          rows={5}
        />
      </div>
    </div>
  )
}
