import { useEffect } from 'react'

const icons = {
 success: (
 <svg className="w-4 h-4 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
 </svg>
 ),
 error: (
 <svg className="w-4 h-4 text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
 </svg>
 ),
 warning: (
 <svg className="w-4 h-4 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
 </svg>
 ),
}

export default function Toast({ message, type = 'success', onClose, duration = 3000 }) {
 useEffect(() => {
 const timer = setTimeout(onClose, duration)
 return () => clearTimeout(timer)
 }, [duration, onClose])

 return (
 <div className="flex items-center gap-3 px-4 py-2.5 bg-surface border border-border text-sm shadow-sm">
 {icons[type]}
 <p className="text-ink ">{message}</p>
 <button onClick={onClose} className="text-muted hover:text-ink ml-2">
 <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
 </button>
 </div>
 )
}