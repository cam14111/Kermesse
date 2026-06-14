import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import type { SlotRow } from '@/lib/domain'
import type { TablesInsert } from '@agpe/shared/types/supabase'

interface SlotFormValues {
  start_time: string
  end_time: string
  max_volunteers: string
}

interface SlotFormProps {
  open: boolean
  slot: SlotRow | null
  standId: string
  onOpenChange: (open: boolean) => void
  onSubmit: (values: TablesInsert<'kermesse_slots'>) => Promise<boolean>
}

function toForm(slot: SlotRow | null): SlotFormValues {
  return {
    start_time: slot?.start_time?.slice(0, 5) ?? '',
    end_time: slot?.end_time?.slice(0, 5) ?? '',
    max_volunteers: slot ? String(slot.max_volunteers) : '1',
  }
}

// Modale de création / édition d'un créneau.
export function SlotForm({
  open,
  slot,
  standId,
  onOpenChange,
  onSubmit,
}: SlotFormProps) {
  const [values, setValues] = useState<SlotFormValues>(toForm(slot))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setValues(toForm(slot))
      setError(null)
    }
  }, [open, slot])

  function update(field: keyof SlotFormValues, value: string): void {
    setValues((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault()
    setError(null)

    const max = Number.parseInt(values.max_volunteers, 10)
    if (Number.isNaN(max) || max < 1) {
      setError('Le nombre de bénévoles doit être au moins 1.')
      return
    }
    if (values.end_time <= values.start_time) {
      setError('L\'heure de fin doit être après l\'heure de début.')
      return
    }

    setSaving(true)
    try {
      const ok = await onSubmit({
        stand_id: standId,
        start_time: values.start_time,
        end_time: values.end_time,
        max_volunteers: max,
      })
      if (ok) onOpenChange(false)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{slot ? 'Modifier le créneau' : 'Nouveau créneau'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="slot-start">Heure de début</Label>
              <Input
                id="slot-start"
                type="time"
                required
                value={values.start_time}
                onChange={(e) => update('start_time', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slot-end">Heure de fin</Label>
              <Input
                id="slot-end"
                type="time"
                required
                value={values.end_time}
                onChange={(e) => update('end_time', e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="slot-max">Bénévoles nécessaires</Label>
            <Input
              id="slot-max"
              type="number"
              min={1}
              required
              value={values.max_volunteers}
              onChange={(e) => update('max_volunteers', e.target.value)}
              aria-describedby={error ? 'slot-error' : undefined}
            />
          </div>
          {error && (
            <p id="slot-error" role="alert" className="text-sm text-red-600">
              {error}
            </p>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={saving} aria-busy={saving}>
              {saving ? 'Enregistrement…' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
