import { useState, useRef, useCallback } from 'react'
import Input from '../../common/Input'
import AIActionChip from '../../common/AIActionChip'
import useConfirmStore from '../../../store/confirmStore'

export default function StepSummary({ data, onChange, onGenerate, generating }) {
  const textareaRef = useRef(null)
  const [targetPosition, setTargetPosition] = useState('')
  const [tone, setTone] = useState('profesional')
  const [language, setLanguage] = useState('id')

  const requestConfirm = useConfirmStore((s) => s.requestConfirm)

  const handleGenerate = async () => {
    if (!targetPosition.trim()) return
    if (!await requestConfirm('Fitur ini akan menggunakan')) return
    const summary = await onGenerate({ targetPosition, tone, language })
    if (summary) {
      setTimeout(() => {
        textareaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        textareaRef.current?.focus()
      }, 200)
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h3 className="text-lg sm:text-xl font-semibold text-ink mb-1 sm:mb-2">Ringkasan Profesional</h3>
        <p className="text-xs sm:text-sm text-muted">Buat ringkasan yang menarik untuk CV Anda.</p>
      </div>

      {/* AI Generate Section */}
      <div className="card p-3 sm:p-4 lg:p-5 space-y-3 sm:space-y-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/10 flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="font-semibold text-sm sm:text-base text-ink">Generate dengan AI</h4>
            <p className="text-xs text-muted hidden sm:block">Buat ringkasan otomatis berdasarkan data Anda</p>
          </div>
        </div>

        <div className="space-y-3">
          <Input
            label="Posisi yang Ditargetkan"
            placeholder="Frontend Developer, Data Analyst, dll."
            value={targetPosition}
            onChange={(e) => setTargetPosition(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <div>
              <label className="block text-xs sm:text-sm text-ink mb-1.5">Nada</label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="field w-full min-h-[44px]"
              >
                <option value="profesional">Profesional</option>
                <option value="kasual">Kasual</option>
                <option value="formal">Formal</option>
              </select>
            </div>
            <div>
              <label className="block text-xs sm:text-sm text-ink mb-1.5">Bahasa</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="field w-full min-h-[44px]"
              >
                <option value="id">Indonesia</option>
                <option value="en">English</option>
              </select>
            </div>
          </div>

          <AIActionChip
            icon="sparkles"
            label="Generate Ringkasan"
            onClick={handleGenerate}
            loading={generating}
            disabled={!targetPosition.trim()}
            className="w-full justify-center"
          />
        </div>
      </div>

      {/* Manual Summary Section */}
      <div className="card p-3 sm:p-4 lg:p-5 space-y-3 sm:space-y-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/10 flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="font-semibold text-sm sm:text-base text-ink">Tulis Manual</h4>
            <p className="text-xs text-muted hidden sm:block">Atau tulis ringkasan Anda sendiri</p>
          </div>
        </div>

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
    </div>
  )
}
