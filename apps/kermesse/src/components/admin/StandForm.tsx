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
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { StandRow } from '@/lib/domain'
import type { TablesInsert } from '@agpe/shared/types/supabase'

const EMOJI_CHOICES = [
  '🎯', '🎪', '🎨', '🍿', '🧁', '🎲', '🎣', '🎡',
  '🍭', '🏀', '🎶', '🤡', '🎟️', '🍦', '🪀', '🎈',
]

interface StandFormValues {
  name: string
  description: string
  location_detail: string
  emoji: string
}

interface StandFormProps {
  open: boolean
  stand: StandRow | null
  eventId: string
  onOpenChange: (open: boolean) => void
  onSubmit: (values: TablesInsert<'kermesse_stands'>) => Promise<boolean>
}

function toForm(stand: StandRow | null): StandFormValues {
  return {
    name: stand?.name ?? '',
    description: stand?.description ?? '',
    location_detail: stand?.location_detail ?? '',
    emoji: stand?.emoji ?? '🎯',
  }
}

// Modale de création / édition d'un stand (avec sélecteur d'emoji).
export function StandForm({
  open,
  stand,
  eventId,
  onOpenChange,
  onSubmit,
}: StandFormProps) {
  const [values, setValues] = useState<StandFormValues>(toForm(stand))
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) setValues(toForm(stand))
  }, [open, stand])

  function update(field: keyof StandFormValues, value: string): void {
    setValues((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault()
    setSaving(true)
    try {
      const ok = await onSubmit({
        event_id: eventId,
        name: values.name.trim(),
        description: values.description.trim() || null,
        location_detail: values.location_detail.trim() || null,
        emoji: values.emoji || null,
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
          <DialogTitle>
            {stand ? 'Modifier le stand' : 'Nouveau stand'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="stand-name">Nom</Label>
            <Input
              id="stand-name"
              required
              value={values.name}
              onChange={(e) => update('name', e.target.value)}
              placeholder="Pêche aux canards"
            />
          </div>

          <div className="space-y-2">
            <Label>Emoji</Label>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Choix de l'emoji">
              {EMOJI_CHOICES.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => update('emoji', emoji)}
                  aria-label={`Emoji ${emoji}`}
                  aria-pressed={values.emoji === emoji}
                  className={cn(
                    'flex h-11 w-11 items-center justify-center rounded-md border text-xl',
                    values.emoji === emoji
                      ? 'border-primary ring-2 ring-primary'
                      : 'border-input hover:bg-accent',
                  )}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="stand-location">Emplacement</Label>
            <Input
              id="stand-location"
              value={values.location_detail}
              onChange={(e) => update('location_detail', e.target.value)}
              placeholder="Salle des fêtes — côté jardin"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="stand-description">Description</Label>
            <Textarea
              id="stand-description"
              value={values.description}
              onChange={(e) => update('description', e.target.value)}
            />
          </div>

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
