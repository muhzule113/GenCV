import { useState, useRef, useEffect } from 'react'

const typeConfig = {
  cv: { label: 'CV', accent: 'clip' },
  letter: { label: 'Surat', accent: 'ink' },
}

const menuGroups = [
  {
    items: [
      { key: 'edit', label: 'Edit', icon: 'M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 113 3L12 15l-4 1 1-4 9.5-9.5z' },
      { key: 'share', label: 'Bagikan Link', icon: 'M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z', cvOnly: true },
    ],
  },
  {
    items: [
      { key: 'download', label: 'Download', icon: 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4' },
      { key: 'duplicate', label: 'Duplikat', icon: 'M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z' },
    ],
  },
  {
    items: [
      { key: 'delete', label: 'Hapus', icon: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3', danger: true },
    ],
  },
]

const handlerMap = {}
for (const g of menuGroups) {
  for (const item of g.items) {
    handlerMap[item.key] = 'on' + item.key.charAt(0).toUpperCase() + item.key.slice(1)
  }
}

export default function DocumentCard({ title, type = 'cv', templateName, createdAt, updatedAt, shared, ...handlers }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [menuPos, setMenuPos] = useState({})
  const menuRef = useRef(null)
  const btnRef = useRef(null)
  const config = typeConfig[type]

  useEffect(() => {
    if (!menuOpen) return
    const onKeyDown = (e) => { if (e.key === 'Escape') setMenuOpen(false) }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [menuOpen])

  useEffect(() => {
    if (!menuOpen || !btnRef.current) return
    const btn = btnRef.current.getBoundingClientRect()
    const menuW = 208
    const spaceRight = window.innerWidth - btn.right
    const spaceBottom = window.innerHeight - btn.bottom
    const openUp = spaceBottom < 200 && btn.top > 260
    let left = spaceRight >= menuW ? btn.right - menuW : Math.max(8, window.innerWidth - menuW - 8)
    let top = openUp ? btn.top - 4 : btn.bottom + 4
    setMenuPos({ left: left + 'px', top: top + 'px' })
  }, [menuOpen])

  const formatDate = (dateStr) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  const handleAction = (key) => {
    setMenuOpen(false)
    handlers[handlerMap[key]]?.()
  }

  const accentColor = type === 'cv' ? 'clip' : 'ink'

  return (
    <div className="card flex hover:border-ink transition-all duration-150">
      <div className={`w-1 shrink-0 bg-${accentColor}`} />
      <div className="flex-1 p-4">
        <div className="flex items-start justify-between mb-2 gap-3">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs border font-mono tracking-wider border-${accentColor}/40 text-${accentColor}`}>
            {config.label}
          </span>

          <div className="relative shrink-0">
            <button
              ref={btnRef}
              type="button"
              aria-label="Menu aksi"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(v => !v)}
              className={`flex items-center justify-center w-9 h-9 border transition-all duration-150 ${
                menuOpen
                  ? 'bg-ink text-paper border-ink'
                  : 'border-border text-muted hover:border-ink hover:text-ink hover:bg-ink/[0.03]'
              }`}
            >
              <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v.01M12 12v.01M12 19v.01" />
              </svg>
            </button>
          </div>
        </div>

        <h4 className="font-medium text-sm text-ink mb-1 line-clamp-2">{title}</h4>
        {templateName && (
          <p className="text-[11px] font-mono text-clip mt-1">{templateName}</p>
        )}
        {shared && (
          <span className="inline-flex items-center gap-1 text-[11px] font-mono text-clip mt-1">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.172 13.828a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            Dibagikan
          </span>
        )}
        <p className="text-xs text-muted mt-3">Diperbarui {formatDate(updatedAt)}</p>
      </div>

      {menuOpen && (
        <>
          {/* Full-screen scrim: catches taps/clicks, prevents overflow clipping */}
          <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
          <div
            ref={menuRef}
            role="menu"
            className="fixed z-50 w-52 bg-surface border border-ink animate-cut-in origin-top-right"
            style={{ left: menuPos.left, top: menuPos.top, boxShadow: '4px 4px 0px rgba(26,26,26,0.08)' }}
          >
            {menuGroups.map((group, gi) => (
              <div key={gi}>
                {gi > 0 && <div className="h-px bg-border mx-2" />}
                {group.items
                  .filter(item => !item.cvOnly || type === 'cv')
                  .map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      role="menuitem"
                      onClick={() => handleAction(item.key)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-all duration-100 ${
                        item.danger
                          ? 'text-danger hover:bg-danger/5 hover:text-danger'
                          : 'text-ink hover:bg-ink/5'
                      }`}
                    >
                      <svg className="w-[18px] h-[18px] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                      </svg>
                      <span className="font-medium">{item.label}</span>
                    </button>
                  ))}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
