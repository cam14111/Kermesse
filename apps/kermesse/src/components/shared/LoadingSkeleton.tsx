import { Skeleton } from '@/components/ui/skeleton'

// Skeleton générique imitant la forme d'une carte stand + créneaux.
export function StandCardSkeleton() {
  return (
    <div className="rounded-lg border p-4 space-y-3">
      <Skeleton className="h-6 w-1/3" />
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
    </div>
  )
}

// Liste de skeletons pour une page de chargement.
export function LoadingSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4" aria-busy="true" aria-live="polite">
      <span className="sr-only">Chargement en cours…</span>
      {Array.from({ length: count }).map((_, i) => (
        <StandCardSkeleton key={i} />
      ))}
    </div>
  )
}
