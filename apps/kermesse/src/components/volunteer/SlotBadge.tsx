import { Badge } from '@/components/ui/badge'

interface SlotBadgeProps {
  current: number
  max: number
}

// Badge de statut d'un créneau : complet / presque complet (≥75%) / places dispo.
export function SlotBadge({ current, max }: SlotBadgeProps) {
  const isFull = current >= max
  const isAlmostFull = max > 0 && current / max >= 0.75
  const remaining = max - current

  if (isFull) {
    return <Badge variant="destructive">Complet</Badge>
  }
  if (isAlmostFull) {
    return (
      <Badge className="bg-orange-100 text-orange-700 border-orange-200">
        {remaining} place{remaining > 1 ? 's' : ''}
      </Badge>
    )
  }
  return (
    <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
      {remaining} place{remaining > 1 ? 's' : ''}
    </Badge>
  )
}
