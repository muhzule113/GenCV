import { forwardRef } from 'react'

const Input = forwardRef(({ label, error, type = 'text', className = '', rightElement, ...props }, ref) => (
  <div className="w-full">
    {label && (
      <label className="block text-sm text-ink mb-1.5">
        {label}
      </label>
    )}
    <div className="relative w-full">
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
          className={`field ${rightElement ? 'pr-10' : ''} ${error ? 'border-danger' : ''} ${className}`}
          {...props}
        />
      )}
      {rightElement && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center">
          {rightElement}
        </div>
      )}
    </div>
    {error && <p className="mt-1 text-xs text-danger">{error}</p>}
  </div>
))

Input.displayName = 'Input'
export default Input