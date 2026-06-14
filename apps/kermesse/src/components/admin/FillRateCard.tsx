import type { LucideIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

interface FillRateCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  progress?: number
  danger?: boolean
}

// Carte d'indicateur clé du tableau de bord.
export function FillRateCard({
  label,
  value,
  icon: Icon,
  progress,
  danger = false,
}: FillRateCardProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-600">{label}</span>
          <Icon
            className={cn('h-5 w-5', danger ? 'text-red-500' : 'text-slate-400')}
            aria-hidden="true"
          />
        </div>
        <p
          className={cn(
            'mt-2 text-2xl font-bold',
            danger ? 'text-red-600' : 'text-slate-900',
          )}
        >
          {value}
        </p>
        {progress !== undefined && (
          <Progress value={progress} className="mt-3" />
        )}
      </CardContent>
    </Card>
  )
}
