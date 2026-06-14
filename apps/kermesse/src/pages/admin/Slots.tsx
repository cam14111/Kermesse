import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useActiveEvent } from '@/hooks/useActiveEvent'
import { useStands } from '@/hooks/useStands'
import { useFillRates } from '@/hooks/useFillRates'
import { useSlotMutations } from '@/hooks/useSlotMutations'
import { SlotForm } from '@/components/admin/SlotForm'
import { SlotBadge } from '@/components/volunteer/SlotBadge'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { PageHeader } from '@/components/shared/PageHeader'
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton'
import { ErrorMessage } from '@/components/shared/ErrorMessage'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { formatTime } from '@/lib/date-utils'
import type { SlotRow } from '@/lib/domain'

export function Slots() {
  const { event, loading: eventLoading } = useActiveEvent()
  const eventId = event?.id ?? null
  const { stands, loading, error, refetch } = useStands(eventId)
  const { fillRates, refetch: refetchFillRates } = useFillRates()
  const { createSlot, updateSlot, deleteSlot } = useSlotMutations(() => {
    refetch()
    refetchFillRates()
  })

  const [selectedStandId, setSelectedStandId] = useState<string>('')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<SlotRow | null>(null)
  const [toDelete, setToDelete] = useState<SlotRow | null>(null)

  // Sélectionne le premier stand par défaut une fois la liste chargée.
  useEffect(() => {
    if (!selectedStandId && stands.length > 0) {
      setSelectedStandId(stands[0]?.id ?? '')
    }
  }, [stands, selectedStandId])

  if (eventLoading) return <LoadingSkeleton />

  if (!event) {
    return (
      <div>
        <PageHeader title="Créneaux" />
        <div className="text-center py-12 text-slate-500">
          <p className="text-lg">Aucune édition active.</p>
          <p className="text-sm mt-2">
            Activez une édition dans{' '}
            <Link to="/admin/events" className="text-primary underline">
              Événements
            </Link>
            .
          </p>
        </div>
      </div>
    )
  }

  const selectedStand = stands.find((s) => s.id === selectedStandId) ?? null

  function openCreate(): void {
    setEditing(null)
    setFormOpen(true)
  }

  function openEdit(slot: SlotRow): void {
    setEditing(slot)
    setFormOpen(true)
  }

  return (
    <div>
      <PageHeader
        title="Créneaux"
        description={`Édition active : ${event.name}`}
      />

      {error ? (
        <ErrorMessage onRetry={refetch} />
      ) : loading ? (
        <LoadingSkeleton />
      ) : stands.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          <p className="text-lg">Aucun stand disponible.</p>
          <p className="text-sm mt-2">
            Créez d'abord un stand dans{' '}
            <Link to="/admin/stands" className="text-primary underline">
              Stands
            </Link>
            .
          </p>
        </div>
      ) : (
        <>
          <div className="mb-4 max-w-xs">
            <Select value={selectedStandId} onValueChange={setSelectedStandId}>
              <SelectTrigger aria-label="Choisir un stand">
                <SelectValue placeholder="Choisir un stand" />
              </SelectTrigger>
              <SelectContent>
                {stands.map((stand) => (
                  <SelectItem key={stand.id} value={stand.id}>
                    {(stand.emoji ?? '🎪') + ' ' + stand.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedStand && (
            <Card>
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <CardTitle className="text-base">
                  Créneaux — {selectedStand.name}
                </CardTitle>
                <Button size="sm" onClick={openCreate}>
                  <Plus className="h-4 w-4" />
                  Nouveau créneau
                </Button>
              </CardHeader>
              <CardContent className="space-y-2">
                {selectedStand.kermesse_slots.length === 0 ? (
                  <p className="py-6 text-center text-sm text-slate-400">
                    Aucun créneau pour ce stand. Ajoutez-en un.
                  </p>
                ) : (
                  selectedStand.kermesse_slots.map((slot) => {
                    const fill = fillRates[slot.id]
                    const current = fill?.currentCount ?? 0
                    return (
                      <div
                        key={slot.id}
                        className="flex flex-wrap items-center justify-between gap-3 rounded-md border bg-white p-3"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-slate-800">
                            {formatTime(slot.start_time)} →{' '}
                            {formatTime(slot.end_time)}
                          </span>
                          <SlotBadge current={current} max={slot.max_volunteers} />
                          <span className="text-xs text-slate-400">
                            {current} / {slot.max_volunteers}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEdit(slot)}
                            aria-label="Modifier le créneau"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setToDelete(slot)}
                            aria-label="Supprimer le créneau"
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </div>
                    )
                  })
                )}
              </CardContent>
            </Card>
          )}
        </>
      )}

      {selectedStand && (
        <SlotForm
          open={formOpen}
          slot={editing}
          standId={selectedStand.id}
          onOpenChange={setFormOpen}
          onSubmit={(values) =>
            editing ? updateSlot(editing.id, values) : createSlot(values)
          }
        />
      )}

      <ConfirmDialog
        open={toDelete !== null}
        title="Supprimer ce créneau ?"
        description="Le créneau et les inscriptions associées seront supprimés définitivement."
        confirmLabel="Supprimer"
        destructive
        onConfirm={async () => {
          if (toDelete) await deleteSlot(toDelete.id)
        }}
        onOpenChange={(open) => {
          if (!open) setToDelete(null)
        }}
      />
    </div>
  )
}
