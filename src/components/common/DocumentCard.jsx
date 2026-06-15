import { useState } from 'react'
import Button from './Button'

const typeConfig = {
  cv: { icon: '📄', label: 'CV', color: 'bg-blue-50 dark:bg-blue-900/20 text-primary' },
  letter: { icon: '✉️', label: 'Surat', color: 'bg-amber-50 dark:bg-amber-900/20 text-warning' },
}

export default function DocumentCard({ title, type = 'cv', templateName, createdAt, updatedAt, onEdit, onDownload, onDuplicate, onDelete }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const config = typeConfig[type]

  const formatDate = (dateStr) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  return (
    <div className="bg-white dark:bg-slate-800 border border-border dark:border-border-dark rounded-card shadow-card p-5 hover:shadow-md transition-shadow relative group">
      <div className="flex items-start justify-between mb-3">
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
          {config.icon} {config.label}
        </span>
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1 rounded-lg text-text-muted dark:text-text-muted-dark hover:bg-surface-2 dark:hover:bg-slate-700 transition-colors opacity-0 group-hover:opacity-100"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01" />
            </svg>
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-full mt-1 z-20 w-40 bg-white dark:bg-slate-700 border border-border dark:border-border-dark rounded-lg shadow-lg py-1">
                <button onClick={() => { setMenuOpen(false); onEdit?.() }} className="w-full text-left px-4 py-2 text-sm text-text-primary dark:text-text-primary-dark hover:bg-surface-2 dark:hover:bg-slate-600">Edit</button>
                <button onClick={() => { setMenuOpen(false); onDownload?.() }} className="w-full text-left px-4 py-2 text-sm text-text-primary dark:text-text-primary-dark hover:bg-surface-2 dark:hover:bg-slate-600">Download</button>
                <button onClick={() => { setMenuOpen(false); onDuplicate?.() }} className="w-full text-left px-4 py-2 text-sm text-text-primary dark:text-text-primary-dark hover:bg-surface-2 dark:hover:bg-slate-600">Duplikat</button>
                <hr className="border-border dark:border-border-dark my-1" />
                <button onClick={() => { setMenuOpen(false); onDelete?.() }} className="w-full text-left px-4 py-2 text-sm text-danger hover:bg-red-50 dark:hover:bg-red-900/20">Hapus</button>
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
