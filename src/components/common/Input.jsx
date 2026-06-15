import { forwardRef } from 'react'

const Input = forwardRef(({ label, error, type = 'text', className = '', ...props }, ref) => (
  <div className="w-full">
    {label && (
      <label className="block text-sm font-medium text-text-primary dark:text-text-primary-dark mb-1.5">
        {label}
      </label>
    )}
    {type === 'textarea' ? (
      <textarea
        ref={ref}
        className={`w-full px-4 py-2.5 bg-white dark:bg-slate-800 border rounded-lg text-body text-text-primary dark:text-text-primary-dark placeholder:text-text-muted dark:placeholder:text-text-muted-dark focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors resize-vertical min-h-[100px] ${error ? 'border-danger' : 'border-border dark:border-border-dark'} ${className}`}
        {...props}
      />
    ) : (
      <input
        ref={ref}
        type={type}
        className={`w-full px-4 py-2.5 bg-white dark:bg-slate-800 border rounded-lg text-body text-text-primary dark:text-text-primary-dark placeholder:text-text-muted dark:placeholder:text-text-muted-dark focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors ${error ? 'border-danger' : 'border-border dark:border-border-dark'} ${className}`}
        {...props}
      />
    )}
    {error && <p className="mt-1 text-sm text-danger">{error}</p>}
  </div>
))

Input.displayName = 'Input'
export default Input
