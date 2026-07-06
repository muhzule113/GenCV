import { useState } from 'react'

const methods = [
  {
    id: 'bca_va',
    label: 'BCA Virtual Account',
    desc: 'Bayar via m-BCA / KlikBCA',
    color: '#0054a8',
    icon: 'BCA',
  },
  {
    id: 'bni_va',
    label: 'BNI Virtual Account',
    desc: 'Bayar via BNI Mobile / ATM',
    color: '#f7941e',
    icon: 'BNI',
  },
  {
    id: 'bri_va',
    label: 'BRI Virtual Account',
    desc: 'Bayar via BRImo / ATM BRI',
    color: '#00447c',
    icon: 'BRI',
  },
  {
    id: 'mandiri_va',
    label: 'Mandiri Virtual Account',
    desc: 'Bayar via Livin\' / ATM Mandiri',
    color: '#0e3e92',
    icon: 'Mandiri',
  },
  {
    id: 'permata_va',
    label: 'Permata Virtual Account',
    desc: 'Bayar via PermataMobile / ATM',
    color: '#782e7a',
    icon: 'Permata',
  },
  {
    id: 'gopay',
    label: 'GoPay',
    desc: 'Bayar pakai GoPay / QRIS',
    color: '#00aed6',
    icon: 'GoPay',
  },
]

export default function PaymentMethodGrid({ selected, onSelect, disabled }) {
  const [hovered, setHovered] = useState(null)

  return (
    <div className="grid gap-3">
      {methods.map((m) => {
        const isSelected = selected === m.id
        const isHovered = hovered === m.id
        const showActive = isSelected || isHovered

        return (
          <button
            key={m.id}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(m.id)}
            onMouseEnter={() => setHovered(m.id)}
            onMouseLeave={() => setHovered(null)}
            className={[
              'flex items-center gap-4 w-full p-4 rounded-xl border-2 text-left transition-all',
              isSelected
                ? 'border-current bg-opacity-5'
                : 'border-border hover:border-current hover:bg-opacity-5',
              disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
            ].join(' ')}
            style={{
              borderColor: showActive ? m.color : undefined,
              backgroundColor: showActive ? `${m.color}0d` : undefined,
            }}
          >
            {/* Logo */}
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
              style={{ backgroundColor: m.color }}
            >
              {m.icon}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-ink" style={{ color: showActive ? m.color : undefined }}>
                {m.label}
              </div>
              <div className="text-sm text-muted mt-0.5">{m.desc}</div>
            </div>

            {/* Check */}
            {isSelected && (
              <svg className="w-5 h-5 shrink-0" style={{ color: m.color }} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            )}
          </button>
        )
      })}
    </div>
  )
}
