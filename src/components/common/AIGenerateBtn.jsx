import Button from './Button'

export default function AIGenerateBtn({ onClick, loading = false, label = 'Generate dengan AI' }) {
  return (
    <Button variant="outline" size="sm" loading={loading} onClick={onClick} className="gap-2">
      <svg className={`w-4 h-4 ${loading ? 'animate-pulse' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
      {loading ? 'AI sedang menulis...' : label}
    </Button>
  )
}
