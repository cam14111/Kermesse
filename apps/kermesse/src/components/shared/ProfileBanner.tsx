import { Link } from 'react-router-dom'
import { useProfile } from '@/hooks/useProfile'

// Bannière non bloquante invitant à compléter le profil.
// Masquée dès que first_name est renseigné (UI_DESIGN_SPEC §7).
export function ProfileBanner() {
  const { isComplete, loading } = useProfile()

  if (loading || isComplete) return null

  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-amber-50 border-b border-amber-200 text-sm">
      <span aria-hidden="true">👋</span>
      <span className="text-amber-800 flex-1">
        Complétez votre profil pour que les organisateurs vous retrouvent
        facilement.
      </span>
      <Link
        to="/profil"
        className="text-amber-700 font-medium underline underline-offset-2 shrink-0"
      >
        Compléter
      </Link>
    </div>
  )
}
