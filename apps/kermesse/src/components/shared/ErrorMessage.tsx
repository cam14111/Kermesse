import { Button } from '@/components/ui/button'

interface ErrorMessageProps {
  message?: string
  onRetry?: () => void
}

// Message d'erreur avec action de récupération (UI_DESIGN_SPEC §5).
export function ErrorMessage({
  message = 'Impossible de charger les données.',
  onRetry,
}: ErrorMessageProps) {
  return (
    <div className="text-center py-8" role="alert">
      <p className="text-red-600">{message}</p>
      {onRetry && (
        <Button variant="outline" className="mt-3" onClick={onRetry}>
          Réessayer
        </Button>
      )}
    </div>
  )
}
