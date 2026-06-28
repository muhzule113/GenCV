import { forwardRef } from 'react'

const Input = forwardRef(({ label, error, type = 'text', className = '', ...props }, ref) => (
 <div className="w-full">
 {label && (
 <label className="block text-sm text-ink mb-1.5">
 {label}
 </label>
 )}
 {type === 'textarea' ? (
 <textarea
 ref={ref}
 className={`field resize-vertical min-h-[100px] ${error ? 'border-danger' : ''} ${className}`}
 {...props}
 />
 ) : (
 <input
 ref={ref}
 type={type}
 className={`field ${error ? 'border-danger' : ''} ${className}`}
 {...props}
 />
 )}
 {error && <p className="mt-1 text-xs text-danger">{error}</p>}
 </div>
))

Input.displayName = 'Input'
export default Input