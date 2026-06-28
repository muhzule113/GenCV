import { forwardRef } from 'react'

const variants = {
  primary: 'btn',
  secondary: 'btn-outline',
  ghost: 'btn-ghost',
  danger: 'btn bg-danger text-white hover:bg-danger/90 focus:ring-danger/30',
}

const sizes = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-7 py-3 text-body',
}

const Button = forwardRef(({ className = '', variant = 'primary', size = 'md', disabled, loading, children, ...props }, ref) => (
  <button
    ref={ref}
    disabled={disabled || loading}
    className={`${variants[variant]} ${sizes[size]} ${className}`}
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