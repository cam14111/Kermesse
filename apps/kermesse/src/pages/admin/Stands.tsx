import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useActiveEvent } from '@/hooks/useActiveEvent'
import { useStands } from '@/hooks/useStands'
import { useStandMutations } from '@/hooks/useStandMutations'
import { StandForm } from '@/components/admin/StandForm'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { PageHeader } from '@/components/shared/PageHeader'
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton'
import { ErrorMessage } from '@/components/shared/ErrorMessage'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { StandRow } from '@/lib/domain'

export function Stands() {
  const { event, loading: eventLoading } = useActiveEvent()
  const eventId = event?.id ?? null
  const { stands, loading, error, refetch } = useStands(eventId)
  const { createStand, updateStand, deleteStand } = useStandMutations(refetch)

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<StandRow | null>(null)
  const [toDelete, setToDelete] = useState<StandRow | null>(null)

  if (eventLoading) return <LoadingSkeleton />

  if (!event) {
    return (
      <div>
        <PageHeader title="Stands" />
        <div className="text-center py-12 text-slate-500">
          <p className="text-lg">Aucune édition active.</p>
          <p className="text-sm mt-2">
            Activez une édition dans{' '}
            <Link to="/admin/events" className="text-primary underline">
              Événements
            </Link>{' '}
            pour gérer ses stands.
          </p>
        </div>
      </div>
    )
  }

  function openCreate(): void {
    setEditing(null)
    setFormOpen(true)
  }

  function openEdit(stand: StandRow): void {
    setEditing(stand)
    setFormOpen(true)
  }

  return (
    <div>
      <PageHeader
        title="Stands"
        description={`Édition active : ${event.name}`}
        action={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Nouveau stand
          </Button>
        }
      />

      {error ? (
        <ErrorMessage onRetry={refetch} />
      ) : loading ? (
        <LoadingSkeleton />
      ) : stands.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          <p className="text-lg">Aucun stand n'a encore été créé.</p>
          <Button className="mt-4" onClick={openCreate}>
            Créer le premier stand
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {stands.map((stand) => (
            <Card key={stand.id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-4 p-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl" aria-hidden="true">
                    {stand.emoji ?? '🎪'}
                  </span>
                  <div>
                    <h2 className="text-base font-semibold text-slate-800">
                      {stand.name}
                    </h2>
                    <p className="text-xs text-slate-400">
                      {stand.kermesse_slots.length} créneau
                      {stand.kermesse_slots.length > 1 ? 'x' : ''}
                      {stand.location_detail ? ` · ${stand.location_detail}` : ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openEdit(stand)}
                    aria-label={`Modifier ${stand.name}`}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setToDelete(stand)}
                    aria-label={`Supprimer ${stand.name}`}
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <StandForm
        open={formOpen}
        stand={editing}
        eventId={event.id}
        onOpenChange={setFormOpen}
        onSubmit={(values) =>
          editing ? updateStand(editing.id, values) : createStand(values)
        }
      />

      <ConfirmDialog
        open={toDelete !== null}
        title="Supprimer ce stand ?"
        description={
          toDelete
            ? `« ${toDelete.name} », ses créneaux et les inscriptions associées seront supprimés définitivement.`
            : undefined
        }
        confirmLabel="Supprimer"
        destructive
        onConfirm={async () => {
          if (toDelete) await deleteStand(toDelete.id)
        }}
        onOpenChange={(open) => {
          if (!open) setToDelete(null)
        }}
      />
    </div>
  )
}
