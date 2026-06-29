import { useEffect } from 'react'
import Button from './Button'

export default function Modal({ open, onClose, title, children, actions, size = 'md' }) {
 useEffect(() => {
 if (open) document.body.style.overflow = 'hidden'
 else document.body.style.overflow = ''
 return () => { document.body.style.overflow = '' }
 }, [open])

 if (!open) return null

 const widths = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' }

 return (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
  <div className="absolute inset-0 bg-black/40 animate-overlay-in" onClick={onClose} />
  <div className={`relative bg-surface border border-border w-full ${widths[size]} max-h-[90vh] overflow-y-auto z-10 animate-cut-in`}>
   <div className="absolute inset-0 border border-ink pointer-events-none animate-border-draw" />
 {title && (
 <div className="flex items-center justify-between px-5 py-4 border-b border-border ">
 <h3 className="text-h3 text-ink ">{title}</h3>
 <button onClick={onClose} className="text-muted hover:text-ink transition-colors p-1">
 <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
 </button>
 </div>
 )}
 <div className="px-5 py-4">{children}</div>
 {actions && (
 <div className="flex justify-end gap-3 px-5 py-4 border-t border-border ">
 {actions}
 </div>
 )}
 </div>
 </div>
 )
}