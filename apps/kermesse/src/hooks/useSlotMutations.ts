import { useCallback } from 'react'
import { toast } from 'sonner'
import { supabase } from '@agpe/shared/supabase-client'
import type { TablesInsert, TablesUpdate } from '@agpe/shared/types/supabase'

interface UseSlotMutationsResult {
  createSlot: (input: TablesInsert<'kermesse_slots'>) => Promise<boolean>
  updateSlot: (
    id: string,
    input: TablesUpdate<'kermesse_slots'>,
  ) => Promise<boolean>
  deleteSlot: (id: string) => Promise<boolean>
}

// Mutations CRUD des créneaux (admin).
export function useSlotMutations(onChange: () => void): UseSlotMutationsResult {
  const createSlot = useCallback(
    async (input: TablesInsert<'kermesse_slots'>): Promise<boolean> => {
      const { error } = await supabase.from('kermesse_slots').insert(input)
      if (error) {
        toast.error('Impossible de créer le créneau.')
        console.error('[kermesse] createSlot error:', error)
        return false
      }
      toast.success('Enregistré avec succès.')
      onChange()
      return true
    },
    [onChange],
  )

  const updateSlot = useCallback(
    async (
      id: string,
      input: TablesUpdate<'kermesse_slots'>,
    ): Promise<boolean> => {
      const { error } = await supabase
        .from('kermesse_slots')
        .update(input)
        .eq('id', id)
      if (error) {
        toast.error('Impossible de modifier le créneau.')
        console.error('[kermesse] updateSlot error:', error)
        return false
      }
      toast.success('Enregistré avec succès.')
      onChange()
      return true
    },
    [onChange],
  )

  const deleteSlot = useCallback(
    async (id: string): Promise<boolean> => {
      const { error } = await supabase
        .from('kermesse_slots')
        .delete()
        .eq('id', id)
      if (error) {
        toast.error('Impossible de supprimer le créneau.')
        console.error('[kermesse] deleteSlot error:', error)
        return false
      }
      toast.success('Supprimé.')
      onChange()
      return true
    },
    [onChange],
  )

  return { createSlot, updateSlot, deleteSlot }
}
