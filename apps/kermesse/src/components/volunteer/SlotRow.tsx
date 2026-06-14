import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { SlotBadge } from '@/components/volunteer/SlotBadge'
import { formatTime } from '@/lib/date-utils'
import type { SlotRow as SlotRowType } from '@/lib/domain'

interface SlotRowProps {
  slot: SlotRowType
  currentCount: number
  isSignedUp: boolean
  isPastEvent: boolean
  onSignup: (slotId: string) => Promise<void>
  onUnsignup: (slotId: string) => Promise<void>
}

// Une ligne de créneau : horaire | badge statut | bouton inscription/désinscription.
export function SlotRow({
  slot,
  currentCount,
  isSignedUp,
  isPastEvent,
  onSignup,
  onUnsignup,
}: SlotRowProps) {
  const [loading, setLoading] = useState(false)
  const isFull = currentCount >= slot.max_volunteers

  async function handleClick(): Promise<void> {
    setLoading(true)
    try {
      if (isSignedUp) {
        await onUnsignup(slot.id)
      } else {
        await onSignup(slot.id)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border bg-white p-3">
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-slate-800">
          {formatTime(slot.start_time)} → {formatTime(slot.end_time)}
        </span>
        <SlotBadge current={currentCount} max={slot.max_volunteers} />
        <span className="text-xs text-slate-400">
          {currentCount} / {slot.max_volunteers}
        </span>
      </div>

      {isSignedUp ? (
        // Le bouton de désinscription est masqué (pas seulement désactivé) après la kermesse.
        !isPastEvent && (
          <Button
            variant="outline"
            className="w-full sm:w-auto"
            onClick={() => void handleClick()}
            disabled={loading}
            aria-busy={loading}
          >
            {loading ? 'Désinscription…' : 'Se désinscrire'}
          </Button>
        )
      ) : (
        <Button
          className="w-full sm:w-auto"
          onClick={() => void handleClick()}
          disabled={loading || isFull || isPastEvent}
          aria-busy={loading}
        >
          {loading ? 'Inscription…' : isFull ? 'Complet' : "S'inscrire"}
        </Button>
      )}

      {isSignedUp && isPastEvent && (
        <span className="text-xs font-medium text-emerald-600">
          Vous êtes inscrit ✓
        </span>
      )}
    </div>
  )
}
