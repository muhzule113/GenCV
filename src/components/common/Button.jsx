import { forwardRef } from 'react'

const variants = {
  primary: 'bg-primary hover:bg-primary-dark text-white shadow-sm',
  secondary: 'bg-white dark:bg-slate-700 border border-border dark:border-border-dark text-text-primary dark:text-text-primary-dark hover:bg-surface-2 dark:hover:bg-slate-600',
  ghost: 'text-text-primary dark:text-text-primary-dark hover:bg-surface-2 dark:hover:bg-slate-700',
  danger: 'bg-danger hover:bg-red-700 text-white',
  outline: 'border-2 border-primary text-primary hover:bg-primary hover:text-white',
}

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-body',
  lg: 'px-8 py-3 text-h3',
}

const Button = forwardRef(({ className = '', variant = 'primary', size = 'md', disabled, loading, children, ...props }, ref) => (
  <button
    ref={ref}
    disabled={disabled || loading}
    className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
    {...props}
  >
    {loading && (
      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    )}
    {children}
  </button>
))

Button.displayName = 'Button'
export default Button
