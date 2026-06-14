import { Navigate } from 'react-router-dom'
import { useAuth } from '@agpe/shared/auth/useAuth'
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton'

interface RoleGuardProps {
  children: React.ReactNode
  requiredRole: 'admin' | 'volunteer'
}

// Protège une route selon le rôle requis.
// - Non authentifié → /login
// - Route admin et rôle ≠ admin → renvoyé vers l'espace bénévole
// - Route bénévole : tout utilisateur authentifié (admin, volunteer, ou rôle null
//   pour un nouveau parent) est autorisé.
export function RoleGuard({ children, requiredRole }: RoleGuardProps) {
  const { session, role, loading } = useAuth()

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl p-4">
        <LoadingSkeleton />
      </div>
    )
  }
  if (!session) return <Navigate to="/login" replace />
  if (requiredRole === 'admin' && role !== 'admin') {
    return <Navigate to="/volunteer/stands" replace />
  }

  return <>{children}</>
}
