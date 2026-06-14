import { useCallback } from 'react'
import { toast } from 'sonner'
import { supabase } from '@agpe/shared/supabase-client'
import { useAuth } from '@agpe/shared/auth/useAuth'

interface UseSignupsResult {
  signUp: (slotId: string) => Promise<boolean>
  unsignUp: (slotId: string) => Promise<boolean>
}

// Actions d'inscription / désinscription, avec mapping des erreurs DB
// vers des messages français lisibles (CODING_GUIDELINES §4).
export function useSignups(): UseSignupsResult {
  const { user } = useAuth()

  const signUp = useCallback(
    async (slotId: string): Promise<boolean> => {
      if (!user) {
        toast.error('Vous devez être connecté pour vous inscrire.')
        return false
      }
      const { error } = await supabase
        .from('kermesse_signups')
        .insert({ slot_id: slotId, user_id: user.id })

      if (error) {
        if (error.message.includes('Créneau complet')) {
          toast.error(
            'Ce créneau vient d\'être complet. Choisissez-en un autre.',
          )
        } else if (error.code === '23505') {
          toast.warning('Vous êtes déjà inscrit sur ce créneau.')
        } else {
          toast.error('Une erreur est survenue. Réessayez dans quelques instants.')
          console.error('[kermesse] signup error:', error)
        }
        return false
      }
      toast.success('Inscription confirmée ✓')
      return true
    },
    [user],
  )

  const unsignUp = useCallback(
    async (slotId: string): Promise<boolean> => {
      if (!user) return false
      const { error } = await supabase
        .from('kermesse_signups')
        .delete()
        .eq('slot_id', slotId)
        .eq('user_id', user.id)

      if (error) {
        toast.error('Impossible de se désinscrire. Réessayez dans quelques instants.')
        console.error('[kermesse] unsignup error:', error)
        return false
      }
      toast.success('Désinscription confirmée')
      return true
    },
    [user],
  )

  return { signUp, unsignUp }
}
