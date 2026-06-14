import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@agpe/shared/supabase-client'

// Détail d'une inscription tel que renvoyé par la RPC admin.
export interface AdminSignupDetail {
  signup_id: string
  created_at: string
  user_id: string
  email: string | null
  first_name: string | null
  last_name: string | null
  stand_id: string
  stand_name: string
  slot_id: string
  start_time: string
  end_time: string
}

interface UseAdminSignupsResult {
  details: AdminSignupDetail[]
  loading: boolean
  error: string | null
  refetch: () => void
}

// Détail complet des inscriptions (email + nom + stand + créneau) via RPC admin.
export function useAdminSignups(eventId: string | null): UseAdminSignupsResult {
  const [details, setDetails] = useState<AdminSignupDetail[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDetails = useCallback(async (): Promise<void> => {
    if (!eventId) {
      setDetails([])
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    const { data, error: err } = await supabase.rpc(
      'kermesse_admin_signup_details',
      { p_event_id: eventId },
    )
    if (err) {
      setError(err.message)
      setDetails([])
    } else {
      setDetails(data ?? [])
    }
    setLoading(false)
  }, [eventId])

  useEffect(() => {
    void fetchDetails()
  }, [fetchDetails])

  return { details, loading, error, refetch: fetchDetails }
}
