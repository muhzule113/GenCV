import Button from './Button'

export default function EmptyState({ icon, title, description, actionLabel, onAction }) {
 return (
 <div className="card p-10 border-border flex flex-col items-center justify-center text-center">
 {icon && <div className="text-muted mb-4">{icon}</div>}
 <h3 className="font-display text-lg font-semibold text-ink mb-2">{title}</h3>
 <p className="text-sm text-muted max-w-md mb-6">{description}</p>
 {actionLabel && onAction && (
 <Button onClick={onAction}>{actionLabel}</Button>
 )}
 </div>
 )
}