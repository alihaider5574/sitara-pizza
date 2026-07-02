/**
 * Skeleton — shimmer placeholder for loading states.
 */
export default function Skeleton({ className = '', ...props }) {
  return (
    <div
      className={`skeleton ${className}`}
      aria-hidden="true"
      {...props}
    />
  )
}

/**
 * MenuItemCardSkeleton — a skeleton matching the MenuItemCard layout.
 */
export function MenuItemCardSkeleton() {
  return (
    <div className="glass-card overflow-hidden">
      <Skeleton className="h-48 w-full rounded-none rounded-t-2xl" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <div className="flex justify-between items-center pt-2">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-9 w-24 rounded-xl" />
        </div>
      </div>
    </div>
  )
}

/**
 * CategoryTabsSkeleton
 */
export function CategoryTabsSkeleton() {
  return (
    <div className="flex gap-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-9 w-24 rounded-full" />
      ))}
    </div>
  )
}
