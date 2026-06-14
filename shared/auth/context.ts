// Contexte d'authentification partagé AGPE.
// Défini séparément pour être importé à la fois par AuthProvider et useAuth.

import { createContext } from 'react'
import type { Session, User } from '@supabase/supabase-js'

export type AppRole = 'admin' | 'volunteer'

export interface AuthContextValue {
  session: Session | null
  user: User | null
  role: AppRole | null
  loading: boolean
  signOut: () => Promise<void>
  refreshRole: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
)
