// Point d'entrée du package @agpe/shared.
export { supabase } from './supabase-client'
export { AuthProvider } from './auth/AuthProvider'
export { useAuth } from './auth/useAuth'
export type { AppRole, AuthContextValue } from './auth/context'
export type {
  Database,
  Json,
  Tables,
  TablesInsert,
  TablesUpdate,
  Views,
} from './types/supabase'
