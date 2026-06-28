import { useState } from 'react'

const typeConfig = {
 cv: { label: 'CV' },
 letter: { label: 'Surat' },
}

const menuItems = [
 { key: 'edit', label: 'Edit', icon: 'M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 113 3L12 15l-4 1 1-4 9.5-9.5z' },
 { key: 'share', label: 'Bagikan Link', icon: 'M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z', cvOnly: true },
 { key: 'download', label: 'Download', icon: 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4' },
 { key: 'duplicate', label: 'Duplikat', icon: 'M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z' },
 { key: 'delete', label: 'Hapus', icon: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3', danger: true },
]

const handlerMap = { edit: 'onEdit', download: 'onDownload', duplicate: 'onDuplicate', delete: 'onDelete', share: 'onShare' }

export default function DocumentCard({ title, type = 'cv', templateName, createdAt, updatedAt, shared, ...handlers }) {
 const [menuOpen, setMenuOpen] = useState(false)
 const config = typeConfig[type]

 const formatDate = (dateStr) => {
 const d = new Date(dateStr)
 return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
 }

 const handleAction = (key) => {
 setMenuOpen(false)
 handlers[handlerMap[key]]?.()
 }

 return (
 <div className="card p-4 group cursor-pointer hover:border-ink transition-colors">
 <div className="flex items-start justify-between mb-3 gap-2">
  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-xs border border-border text-muted font-mono">
  {config.label}
  </span>
 <div className="relative">
 <button
 type="button"
 aria-label="Opsi dokumen"
 aria-haspopup="menu"
 aria-expanded={menuOpen}
 onClick={() => setMenuOpen(v => !v)}
 className="p-1 text-muted hover:text-ink transition-colors"
 >
 <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
 <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v.01M12 12v.01M12 19v.01" />
 </svg>
 </button>

 {menuOpen && (
 <>
 <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
 <div
 role="menu"
 className="absolute right-0 top-full mt-1 z-20 w-48 bg-surface border border-border py-1"
 >
 {menuItems.filter(item => !item.cvOnly || type === 'cv').map((item) => (
 <button
 key={item.key}
 type="button"
 role="menuitem"
 onClick={() => handleAction(item.key)}
 className={`w-full flex items-center gap-2.5 px-3 py-1.5 text-sm transition-colors ${
 item.danger
 ? 'text-danger hover:bg-danger/5'
 : 'text-ink hover:bg-ink/5'
 }`}
 >
 <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
 <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
 </svg>
 <span>{item.label}</span>
 </button>
 ))}
 </div>
 </>
 )}
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
  Shared
  </span>
  )}
  <p className="text-xs text-muted mt-3">Diperbarui {formatDate(updatedAt)}</p>
 </div>
 )
}