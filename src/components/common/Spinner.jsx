// size: 'sm' | 'md' | 'lg'  color: tailwind text-* class
const sizes = { sm: 'w-4 h-4 border-2', md: 'w-6 h-6 border-2', lg: 'w-10 h-10 border-[3px]' }

export default function Spinner({ size = 'md', className = '' }) {
  return (
    <div
      className={`rounded-full border-primary/20 border-t-primary animate-spin ${sizes[size]} ${className}`}
      role="status"
      aria-label="Memuat..."
    />
  )
}
