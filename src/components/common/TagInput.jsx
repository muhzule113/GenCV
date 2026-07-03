import { useState } from 'react'

export default function TagInput({ label, tags = [], onChange, placeholder = 'Ketik lalu Enter' }) {
  const [input, setInput] = useState('')

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && input.trim()) {
      e.preventDefault()
      if (!tags.includes(input.trim())) {
        onChange([...tags, input.trim()])
      }
      setInput('')
    }
  }

  const removeTag = (tag) => {
    onChange(tags.filter((t) => t !== tag))
  }

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-ink mb-2">
          {label}
        </label>
      )}
      <div className="flex flex-wrap gap-2 p-3 bg-surface border border-border min-h-[48px] focus-within:ring-2 focus-within:ring-ink/30 focus-within:border-ink transition-colors">
        {tags.map((tag, index) => (
          <span
            key={`${tag}-${index}`}
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-ink/10 text-ink text-sm"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="text-muted hover:text-ink transition-colors"
              aria-label={`Hapus ${tag}`}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </span>
        ))}
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={tags.length === 0 ? placeholder : 'Ketik lalu Enter'}
          className="flex-1 min-w-[140px] outline-none bg-transparent text-sm text-ink placeholder:text-muted/60"
        />
      </div>
    </div>
  )
}
