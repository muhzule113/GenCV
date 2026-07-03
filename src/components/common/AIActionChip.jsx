export default function AIActionChip({ icon, label, loading = false, onClick, disabled = false, pulse = false, className = '' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className={`inline-flex items-center gap-1.5 px-3 py-2 min-h-[44px] text-sm font-medium tracking-wide text-clip hover:bg-clip/5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${className}`}
    >
      <svg
        className={`w-4 h-4 shrink-0 ${loading ? 'animate-spin' : pulse ? 'animate-pulse' : ''}`}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {icon === 'sparkles' ? (
          <>
            <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            <path d="M8 12h8" />
          </>
        ) : icon === 'brain' ? (
          <>
            <path d="M12 18v-5a2 2 0 012-2h2a2 2 0 012 2v2" />
            <path d="M12 18v-5a2 2 0 00-2-2H8a2 2 0 00-2 2v2" />
            <path d="M8 18v-1a2 2 0 00-2-2H4" />
            <path d="M16 18v-1a2 2 0 012-2h2" />
            <path d="M12 2v2" />
            <path d="M4.93 4.93l1.41 1.41" />
            <path d="M19.07 4.93l-1.41 1.41" />
          </>
        ) : (
          <>
            <path d="M13 10V3L4 14h7v7l9-11h-7z" />
          </>
        )}
      </svg>
      <span className="whitespace-nowrap">{loading ? 'Memproses...' : label}</span>
    </button>
  )
}
