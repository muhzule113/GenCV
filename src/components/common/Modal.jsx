import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import Button from './Button'

export default function Modal({ open, onClose, title, children, actions, size = 'md' }) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
      document.documentElement.style.overflow = 'hidden'
      document.documentElement.style.scrollBehavior = 'auto'
    } else {
      document.body.style.overflow = ''
      document.documentElement.style.overflow = ''
      document.documentElement.style.scrollBehavior = ''
    }
    return () => {
      document.body.style.overflow = ''
      document.documentElement.style.overflow = ''
      document.documentElement.style.scrollBehavior = ''
    }
  }, [open])

  if (!open) return null

  const widths = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' }

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4" style={{ minHeight: '-webkit-fill-available' }}>
      <div className="absolute inset-0 bg-black/40 animate-overlay-in" onClick={onClose} />
      <div className={`relative bg-surface border border-border w-full ${widths[size]} max-h-[90vh] z-10 animate-cut-in`}>
        <div className="absolute inset-0 border border-ink pointer-events-none animate-border-draw z-20" />
        <div className="max-h-[90vh] overflow-y-auto">
          {title && (
            <div className="flex items-center justify-between px-4 sm:px-5 py-3 sm:py-4 border-b border-border">
              <h3 className="text-base sm:text-h3 text-ink">{title}</h3>
              <button onClick={onClose} className="text-muted hover:text-ink transition-colors p-2 min-h-[44px] min-w-[44px] flex items-center justify-center">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          )}
          <div className="px-4 sm:px-5 py-3 sm:py-4">{children}</div>
          {actions && (
            <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 px-4 sm:px-5 py-3 sm:py-4 border-t border-border">
              {actions}
            </div>
          )}
        </div>
      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}