// Hook d'accès au contexte d'authentification AGPE.

import { useContext } from 'react'
import { AuthContext, type AuthContextValue } from './context'

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (ctx === undefined) {
    throw new Error('useAuth doit être utilisé à l\'intérieur d\'un <AuthProvider>.')
  }
  return ctx
}
