import { useState } from 'react'

const typeConfig = {
  cv: { icon: '📄', label: 'CV', color: 'bg-blue-50 dark:bg-blue-900/20 text-primary' },
  letter: { icon: '✉️', label: 'Surat', color: 'bg-amber-50 dark:bg-amber-900/20 text-warning' },
}

const menuItems = [
  { key: 'edit', label: 'Edit', icon: 'M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 113 3L12 15l-4 1 1-4 9.5-9.5z' },
  { key: 'download', label: 'Download', icon: 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4' },
  { key: 'duplicate', label: 'Duplikat', icon: 'M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z' },
  { key: 'delete', label: 'Hapus', icon: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3', danger: true },
]

const handlerMap = { edit: 'onEdit', download: 'onDownload', duplicate: 'onDuplicate', delete: 'onDelete' }

export default function DocumentCard({ title, type = 'cv', templateName, createdAt, updatedAt, ...handlers }) {
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
    <div className="bg-white dark:bg-slate-800 border border-border dark:border-border-dark rounded-card shadow-card p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3 gap-2">
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
          {config.icon} {config.label}
        </span>
        <div className="relative">
          <button
            type="button"
            aria-label="Opsi dokumen"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(v => !v)}
            className="p-1.5 rounded-lg text-text-muted dark:text-text-muted-dark hover:bg-surface-2 dark:hover:bg-slate-700 hover:text-text-primary dark:hover:text-text-primary-dark transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v.01M12 12v.01M12 19v.01" />
            </svg>
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div
                role="menu"
                className="absolute right-0 top-full mt-1 z-20 w-48 bg-white dark:bg-slate-700 border border-border dark:border-border-dark rounded-lg shadow-lg py-1.5"
              >
                {menuItems.map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    role="menuitem"
                    onClick={() => handleAction(item.key)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors ${
                      item.danger
                        ? 'text-danger hover:bg-red-50 dark:hover:bg-red-900/20'
                        : 'text-text-primary dark:text-text-primary-dark hover:bg-surface-2 dark:hover:bg-slate-600'
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

      <h4 className="font-medium text-text-primary dark:text-text-primary-dark mb-1 line-clamp-2">{title}</h4>
      {templateName && <p className="text-xs text-text-muted dark:text-text-muted-dark mb-2">{templateName}</p>}
      <p className="text-xs text-text-muted dark:text-text-muted-dark">Diperbarui {formatDate(updatedAt)}</p>
    </div>
  )
}
