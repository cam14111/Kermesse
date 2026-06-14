// Provider d'authentification global AGPE.
// Gère la session Supabase, récupère le rôle applicatif et l'expose via contexte.

import { useCallback, useEffect, useState } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '../supabase-client'
import { AuthContext, type AppRole } from './context'

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [role, setRole] = useState<AppRole | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchRole = useCallback(
    async (currentUser: User | null): Promise<void> => {
      if (!currentUser) {
        setRole(null)
        return
      }
      const { data, error } = await supabase
        .from('kermesse_user_roles')
        .select('role')
        .eq('user_id', currentUser.id)
        .maybeSingle()

      if (error) {
        console.error('[agpe] échec récupération du rôle:', error)
        setRole(null)
        return
      }
      setRole(data?.role ?? null)
    },
    [],
  )

  const refreshRole = useCallback(async (): Promise<void> => {
    await fetchRole(user)
  }, [fetchRole, user])

  useEffect(() => {
    let active = true

    async function init(): Promise<void> {
      const { data } = await supabase.auth.getSession()
      if (!active) return
      const currentSession = data.session
      setSession(currentSession)
      setUser(currentSession?.user ?? null)
      await fetchRole(currentSession?.user ?? null)
      if (active) setLoading(false)
    }
    void init()

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession)
        setUser(newSession?.user ?? null)
        void fetchRole(newSession?.user ?? null)
      },
    )

    return () => {
      active = false
      listener.subscription.unsubscribe()
    }
  }, [fetchRole])

  const signOut = useCallback(async (): Promise<void> => {
    await supabase.auth.signOut()
    setRole(null)
  }, [])

  return (
    <AuthContext.Provider
      value={{ session, user, role, loading, signOut, refreshRole }}
    >
      {children}
    </AuthContext.Provider>
  )
}
