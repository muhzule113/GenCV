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
        <label className="block text-sm font-medium text-text-primary dark:text-text-primary-dark mb-1.5">
          {label}
        </label>
      )}
      <div className="flex flex-wrap gap-2 p-2.5 bg-white dark:bg-slate-800 border border-border dark:border-border-dark rounded-lg min-h-[42px] focus-within:ring-2 focus-within:ring-primary/50 focus-within:border-primary transition-colors">
        {tags.map((tag) => (
          <span key={tag} className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
            {tag}
            <button onClick={() => removeTag(tag)} className="hover:text-primary-dark">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </span>
        ))}
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={tags.length === 0 ? placeholder : ''}
          className="flex-1 min-w-[120px] outline-none bg-transparent text-body text-text-primary dark:text-text-primary-dark placeholder:text-text-muted dark:placeholder:text-text-muted-dark"
        />
      </div>
    </div>
  )
}
