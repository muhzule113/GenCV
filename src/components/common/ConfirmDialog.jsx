import Button from './Button'

export default function ConfirmDialog({ open, onClose, onConfirm, title, message, tokenCount = 1 }) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 animate-overlay-in" onClick={onClose} />
      <div className="relative bg-surface border border-border w-full max-w-sm z-10 animate-cut-in">
        <div className="absolute inset-0 border border-ink pointer-events-none animate-border-draw" />
        <div className="px-5 py-4 border-b border-border">
          <h3 className="text-h3 text-ink">{title}</h3>
        </div>
        <div className="px-5 py-4">
          <p className="text-sm text-muted">{message} <span className="text-danger font-semibold">{tokenCount} Token</span> dari saldo AI Anda. Lanjutkan?</p>
        </div>
        <div className="flex justify-end gap-3 px-5 py-4 border-t border-border">
          <Button variant="secondary" onClick={onClose}>Batal</Button>
          <Button onClick={onConfirm}>Gunakan 1 Token</Button>
        </div>
      </div>
    </div>
  )
}
