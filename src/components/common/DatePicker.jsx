import { useState, useRef, useEffect } from 'react'

const MONTHS_FULL = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
const DAYS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']

export default function DatePicker({ label, value, onChange, required, placeholder = 'Pilih tanggal' }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  const today = new Date()
  const parsed = value ? new Date(value + 'T00:00:00') : null

  const [viewYear, setViewYear] = useState(parsed?.getFullYear() ?? today.getFullYear())
  const [viewMonth, setViewMonth] = useState(parsed?.getMonth() ?? today.getMonth())

  useEffect(() => {
    if (parsed) { setViewYear(parsed.getFullYear()); setViewMonth(parsed.getMonth()) }
  }, [value])

  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (!ref.current?.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1) }
    else setViewMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1) }
    else setViewMonth(m => m + 1)
  }

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const firstDay = new Date(viewYear, viewMonth, 1).getDay()

  const select = (day) => {
    const mm = String(viewMonth + 1).padStart(2, '0')
    const dd = String(day).padStart(2, '0')
    onChange({ target: { value: `${viewYear}-${mm}-${dd}` } })
    setOpen(false)
  }

  const display = parsed
    ? `${parsed.getDate()} ${MONTHS_FULL[parsed.getMonth()]} ${parsed.getFullYear()}`
    : ''

  const isSelected = (day) =>
    parsed && parsed.getFullYear() === viewYear && parsed.getMonth() === viewMonth && parsed.getDate() === day

  const isToday = (day) =>
    today.getFullYear() === viewYear && today.getMonth() === viewMonth && today.getDate() === day

  return (
    <div className="w-full relative" ref={ref}>
      {label && (
        <label className="block text-sm text-ink mb-1.5">
          {label}{required && <span className="text-danger ml-0.5">*</span>}
        </label>
      )}
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className={`w-full flex items-center justify-between px-4 py-2.5 bg-transparent border text-sm transition-colors duration-150 focus:outline-none focus:border-ink cursor-pointer ${
          open ? 'border-ink' : 'border-border hover:border-ink'
        }`}
      >
        <span className={display ? 'text-ink' : 'text-muted'}>
          {display || placeholder}
        </span>
        <svg className="w-4 h-4 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </button>

      {open && (
        <div className="absolute z-30 mt-1 bg-surface border border-border p-4 w-72">
          <div className="flex items-center justify-between mb-4">
            <button type="button" onClick={prevMonth} className="p-1 text-muted hover:text-ink transition-colors duration-150">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-ink">
                {MONTHS_SHORT[viewMonth]} {viewYear}
              </span>
            </div>
            <button type="button" onClick={nextMonth} className="p-1 text-muted hover:text-ink transition-colors duration-150">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-7 mb-1">
            {DAYS.map(d => (
              <span key={d} className="text-center font-mono text-[10px] text-muted py-1">{d}</span>
            ))}
          </div>

          <div className="grid grid-cols-7">
            {Array(firstDay).fill(null).map((_, i) => <span key={`e${i}`} />)}
            {Array(daysInMonth).fill(null).map((_, i) => {
              const day = i + 1
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => select(day)}
                  className={`w-full aspect-square flex items-center justify-center font-mono text-xs transition-colors duration-150 ${
                    isSelected(day)
                      ? 'bg-ink text-paper'
                      : isToday(day)
                      ? 'bg-ink/10 text-ink font-semibold'
                      : 'hover:bg-ink/5 text-ink'
                  }`}
                >
                  {day}
                </button>
              )
            })}
          </div>

          <div className="mt-3 pt-2.5 border-t border-border flex items-center justify-between">
            <button
              type="button"
              onClick={() => { select(today.getDate()); setViewYear(today.getFullYear()); setViewMonth(today.getMonth()) }}
              className="font-mono text-[11px] text-ink hover:underline"
            >
              Hari ini
            </button>
            {value && (
              <button
                type="button"
                onClick={() => { onChange({ target: { value: '' } }); setOpen(false) }}
                className="font-mono text-[11px] text-muted hover:text-danger transition-colors duration-150"
              >
                Hapus
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
