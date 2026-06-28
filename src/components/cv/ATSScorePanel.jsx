import { useMemo, useState } from 'react'
import { calculateATSScore } from '../../utils/atsRules'

const GRADE_COLORS = {
 A: { ring: 'text-emerald-500', bg: 'bg-emerald-500', label: 'Sangat Baik' },
 B: { ring: 'text-blue-500', bg: 'bg-blue-500', label: 'Baik' },
 C: { ring: 'text-amber-500', bg: 'bg-amber-500', label: 'Perlu Perbaikan' },
 D: { ring: 'text-red-500', bg: 'bg-red-500', label: 'Kurang' },
}

function CircularScore({ score, grade }) {
 const colors = GRADE_COLORS[grade] || GRADE_COLORS.D
 const r = 36
 const circumference = 2 * Math.PI * r
 const offset = circumference - (score / 100) * circumference

 return (
 <div className="relative w-24 h-24 flex-shrink-0">
 <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
 <circle cx="40" cy="40" r={r} fill="none" stroke="currentColor"
 className="text-slate-200 " strokeWidth="6" />
 <circle cx="40" cy="40" r={r} fill="none" stroke="currentColor"
 className={colors.ring} strokeWidth="6" strokeLinecap="round"
 strokeDasharray={circumference} strokeDashoffset={offset}
 style={{ transition: 'stroke-dashoffset 0.6s ease' }} />
 </svg>
 <div className="absolute inset-0 flex flex-col items-center justify-center">
 <span className="text-xl font-bold text-ink ">{score}</span>
 <span className={`text-[10px] font-semibold ${colors.ring}`}>{colors.label}</span>
 </div>
 </div>
 )
}

function CategoryBar({ label, score, max, tips }) {
 const [open, setOpen] = useState(false)
 const pct = max > 0 ? (score / max) * 100 : 0
 const color = pct >= 80 ? 'bg-emerald-500' : pct >= 60 ? 'bg-blue-500' : pct >= 40 ? 'bg-amber-500' : 'bg-red-500'

 return (
 <div>
 <button type="button" onClick={() => tips.length > 0 && setOpen(!open)}
 className="w-full flex items-center justify-between text-xs mb-1 cursor-pointer group">
 <span className="text-ink font-medium">{label}</span>
 <span className="text-muted ">
 {score}/{max}
 {tips.length > 0 && (
 <span className={`ml-1 transition-transform inline-block ${open ? 'rotate-180' : ''}`}>▾</span>
 )}
 </span>
 </button>
 <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
 <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${pct}%` }} />
 </div>
 {open && tips.length > 0 && (
 <ul className="mt-1.5 space-y-0.5">
 {tips.map((tip, i) => (
 <li key={i} className="text-[11px] text-amber-600 flex gap-1">
 <span className="shrink-0">•</span>
 <span>{tip}</span>
 </li>
 ))}
 </ul>
 )}
 </div>
 )
}

export default function ATSScorePanel({ data }) {
 const result = useMemo(() => calculateATSScore(data), [data])
 const cats = result.categories
 const allTips = Object.values(cats).flatMap(c => c.tips)

 return (
 <div className="card p-4">
 <div className="flex items-center gap-1.5 mb-3">
 <svg className="w-4 h-4 text-ink " fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
 <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
 </svg>
 <h3 className="text-sm font-semibold text-ink ">Skor ATS</h3>
 </div>

 <div className="flex items-center gap-4 mb-4">
 <CircularScore score={result.total} grade={result.grade} />
 <div className="flex-1 text-xs text-muted ">
 {allTips.length === 0
 ? 'CV Anda sudah sangat ATS-friendly!'
 : `${allTips.length} saran perbaikan ditemukan. Klik kategori untuk melihat detail.`}
 </div>
 </div>

 <div className="space-y-3">
 {Object.values(cats).map((cat) => (
 <CategoryBar key={cat.label} {...cat} />
 ))}
 </div>
 </div>
 )
}
