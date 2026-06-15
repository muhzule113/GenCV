import Button from './Button'

export default function EmptyState({ icon, title, description, actionLabel, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {icon && <div className="text-text-muted dark:text-text-muted-dark mb-4">{icon}</div>}
      <h3 className="text-h3 text-text-primary dark:text-text-primary-dark mb-2">{title}</h3>
      <p className="text-body text-text-muted dark:text-text-muted-dark max-w-md mb-6">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction}>{actionLabel}</Button>
      )}
    </div>
  )
}
