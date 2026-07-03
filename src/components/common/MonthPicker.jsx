import { useState, useRef, useEffect } from 'react'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']

// value: "YYYY-MM" | "", onChange: (e) => e.target.value = "YYYY-MM"
export default function MonthPicker({ label, value, onChange, disabled, placeholder = 'Pilih bulan' }) {
 const [open, setOpen] = useState(false)
 const ref = useRef(null)

 const year = value ? parseInt(value.slice(0, 4)) : new Date().getFullYear()
 const month = value ? parseInt(value.slice(5, 7)) - 1 : -1

 const [viewYear, setViewYear] = useState(year)

 useEffect(() => {
 if (value) setViewYear(parseInt(value.slice(0, 4)))
 }, [value])

 useEffect(() => {
 if (!open) return
 const handler = (e) => { if (!ref.current?.contains(e.target)) setOpen(false) }
 document.addEventListener('mousedown', handler)
 return () => document.removeEventListener('mousedown', handler)
 }, [open])

 const select = (m) => {
 const mm = String(m + 1).padStart(2, '0')
 onChange({ target: { value: `${viewYear}-${mm}` } })
 setOpen(false)
 }

 const display = value
 ? `${MONTHS[month]} ${year}`
 : ''

 return (
 <div className="w-full relative" ref={ref}>
 {label && (
 <label className="block text-sm font-medium text-ink mb-1.5">
 {label}
 </label>
 )}
  <button
  type="button"
  disabled={disabled}
  onClick={() => !disabled && setOpen(v => !v)}
  className={`w-full flex items-center justify-between px-4 py-2.5 bg-white border text-body transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary ${
  disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-primary/50'
  } ${open ? 'border-primary ring-2 ring-primary/30' : 'border-border '}`}
  >
  <span className={display ? 'text-ink ' : 'text-muted '}>
  {display || placeholder}
  </span>
  <svg className={`w-4 h-4 text-muted transition-transform duration-200 ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
  </svg>
  </button>

 {open && (
 <div className="absolute z-30 mt-1.5 bg-white border border-border rounded-xl shadow-lg p-3 w-56">
 {/* Year nav */}
 <div className="flex items-center justify-between mb-3">
 <button
 type="button"
 onClick={() => setViewYear(y => y - 1)}
 className="p-1.5 rounded-lg hover:bg-surface-2 text-muted hover:text-text-primary transition-colors"
 >
 <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
 <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
 </svg>
 </button>
 <span className="text-sm font-semibold text-ink ">{viewYear}</span>
 <button
 type="button"
 onClick={() => setViewYear(y => y + 1)}
 className="p-1.5 rounded-lg hover:bg-surface-2 text-muted hover:text-text-primary transition-colors"
 >
 <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
 <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
 </svg>
 </button>
 </div>

 {/* Month grid */}
 <div className="grid grid-cols-3 gap-1">
 {MONTHS.map((m, i) => {
 const isSelected = month === i && viewYear === year
 return (
 <button
 key={m}
 type="button"
 onClick={() => select(i)}
 className={`px-2 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 ${
 isSelected
 ? 'bg-ink text-white'
 : 'hover:bg-primary/10 text-ink '
 }`}
 >
 {m}
 </button>
 )
 })}
 </div>

 {value && (
 <button
 type="button"
 onClick={() => { onChange({ target: { value: '' } }); setOpen(false) }}
 className="mt-2 w-full text-xs text-muted hover:text-danger transition-colors py-1"
 >
 Hapus pilihan
 </button>
 )}
 </div>
 )}
 </div>
 )
}
