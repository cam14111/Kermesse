import { useState } from 'react'
import { toast } from 'sonner'
import { supabase } from '@agpe/shared/supabase-client'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

// URL de retour du magic link : base de l'app + route hash callback.
function buildRedirectUrl(): string {
  return `${window.location.origin}${import.meta.env.BASE_URL}#/auth/callback`
}

export function Login() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault()
    setError(null)

    const trimmed = email.trim()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError('Adresse email invalide.')
      return
    }

    setLoading(true)
    const { error: err } = await supabase.auth.signInWithOtp({
      email: trimmed,
      options: { emailRedirectTo: buildRedirectUrl() },
    })
    setLoading(false)

    if (err) {
      setError('Envoi impossible. Vérifiez votre adresse et réessayez.')
      console.error('[kermesse] signInWithOtp error:', err)
      return
    }
    setSent(true)
    toast.info('Lien de connexion envoyé ! Vérifiez vos emails.')
  }

  return (
    <div className="min-h-dvh flex items-center justify-center bg-slate-50 px-4 py-12">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="text-4xl mb-2" aria-hidden="true">
            🎪
          </div>
          <CardTitle className="text-xl">Connexion bénévole</CardTitle>
          <CardDescription>
            Kermesse AGPE — connectez-vous sans mot de passe.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sent ? (
            <div
              className="rounded-md bg-emerald-50 border border-emerald-200 p-4 text-sm text-emerald-800"
              role="status"
            >
              <p className="font-medium">Vérifiez vos emails 📬</p>
              <p className="mt-1">
                Un lien de connexion a été envoyé à{' '}
                <span className="font-medium">{email.trim()}</span>. Cliquez
                dessus pour accéder à l'espace bénévoles.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div className="space-y-2">
                <Label htmlFor="email">Adresse email</Label>
                <Input
                  id="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="prenom.nom@exemple.fr"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-describedby={error ? 'email-error' : undefined}
                  aria-invalid={error ? true : undefined}
                  required
                />
                {error && (
                  <p id="email-error" role="alert" className="text-sm text-red-600">
                    {error}
                  </p>
                )}
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={loading}
                aria-busy={loading}
              >
                {loading ? 'Envoi…' : 'Recevoir mon lien'}
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-xs text-slate-400 text-center">
            Vous recevrez un lien de connexion valable 1 heure. Aucun mot de
            passe n'est nécessaire.
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
