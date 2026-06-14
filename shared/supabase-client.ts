// Instance Supabase UNIQUE pour tout le projet AGPE (ADR-005).
// Aucune logique métier ici : uniquement la création du client typé.
// Toutes les apps doivent importer `supabase` depuis '@agpe/shared/supabase-client'
// — ne jamais réinstancier createClient ailleurs.

import { createClient } from '@supabase/supabase-js'
import type { Database } from './types/supabase'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Variables d'environnement Supabase manquantes : VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY doivent être définies.",
  )
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    // PKCE : le magic link revient avec ?code=... (query string), ce qui
    // coexiste avec le fragment du HashRouter (#/auth/callback).
    flowType: 'pkce',
  },
})
