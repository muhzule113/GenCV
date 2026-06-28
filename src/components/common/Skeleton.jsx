export function Skeleton({ className = '' }) {
 return (
 <div className={`animate-pulse bg-border ${className}`} />
 )
}

export function DocumentCardSkeleton() {
 return (
 <div className="card p-4 space-y-3">
 <div className="flex items-start justify-between">
 <Skeleton className="h-5 w-16" />
 <Skeleton className="h-6 w-6" />
 </div>
 <Skeleton className="h-4 w-4/5" />
 <Skeleton className="h-3 w-2/5" />
 <Skeleton className="h-3 w-1/3" />
 </div>
 )
}

export function PageLoader({ text = 'Memuat...' }) {
 return (
 <div className="flex flex-col items-center justify-center py-20 gap-4">
 <div className="w-8 h-8 border border-ink animate-spin" />
 {text && <p className="text-sm text-muted ">{text}</p>}
 </div>
 )
}