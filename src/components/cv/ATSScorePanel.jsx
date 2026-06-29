import { useMemo, useState } from 'react'
import { calculateATSScore } from '../../utils/atsRules'

const GRADE_COLORS = {
  A: { bar: 'bg-ink', label: 'Sangat Baik' },
  B: { bar: 'bg-clip', label: 'Baik' },
  C: { bar: 'bg-warning', label: 'Perlu Perbaikan' },
  D: { bar: 'bg-danger', label: 'Kurang' },
}

function FlatGauge({ score, grade }) {
  const colors = GRADE_COLORS[grade] || GRADE_COLORS.D
  return (
    <div className="flex items-center gap-4">
      <div className="flex flex-col items-center">
        <span className="font-mono text-2xl font-bold text-ink leading-none">{score}</span>
        <span className={`font-mono text-[10px] tracking-wider uppercase ${grade === 'A' ? 'text-ink' : grade === 'B' ? 'text-clip' : grade === 'C' ? 'text-warning' : 'text-danger'}`}>
          {colors.label}
        </span>
      </div>
      <div className="flex-1 h-2 bg-border">
        <div className={`h-full ${colors.bar} transition-all duration-500`} style={{ width: `${score}%` }} />
      </div>
    </div>
  )
}

function CategoryBar({ label, score, max, tips }) {
  const [open, setOpen] = useState(false)
  const pct = max > 0 ? (score / max) * 100 : 0
  const color = pct >= 80 ? 'bg-ink' : pct >= 60 ? 'bg-clip' : pct >= 40 ? 'bg-warning' : 'bg-danger'

  return (
    <div>
      <button type="button" onClick={() => tips.length > 0 && setOpen(!open)}
        className="w-full flex items-center justify-between text-xs mb-1 cursor-pointer group">
        <span className="text-ink font-medium">{label}</span>
        <span className="font-mono text-muted">
          {score}/{max}
          {tips.length > 0 && (
            <span className={`ml-1 transition-transform inline-block ${open ? 'rotate-180' : ''}`}>▾</span>
          )}
        </span>
      </button>
      <div className="w-full h-1.5 bg-border">
        <div className={`h-full transition-all duration-500 ${color}`} style={{ width: `${pct}%` }} />
      </div>
      {open && tips.length > 0 && (
        <ul className="mt-1.5 space-y-0.5">
          {tips.map((tip, i) => (
            <li key={i} className="text-[11px] text-warning flex gap-1">
              <span className="shrink-0">•</span>
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default function ATSScorePanel({ data, noCard = false, noPadding = false }) {
  const result = useMemo(() => calculateATSScore(data), [data])
  const cats = result.categories
  const allTips = Object.values(cats).flatMap(c => c.tips)

  return (
    <div className={`${noCard ? '' : 'card'} ${noPadding ? '' : 'p-4'}`.trim()}>
      <div className="flex items-center gap-1.5 mb-3">
        <svg className="w-4 h-4 text-ink" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
        <span className="font-mono text-[11px] tracking-widest text-clip uppercase">Skor ATS</span>
      </div>

      <div className="mb-4">
        <FlatGauge score={result.total} grade={result.grade} />
      </div>

      {allTips.length > 0 && (
        <p className="text-xs text-muted mb-3">
          {allTips.length} saran perbaikan — klik kategori untuk detail.
        </p>
      )}

      <div className="space-y-3">
        {Object.values(cats).map((cat) => (
          <CategoryBar key={cat.label} {...cat} />
        ))}
      </div>
    </div>
  )
}
