import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Navigate } from 'react-router-dom'
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  type AuthError,
} from 'firebase/auth'
import { Car as CarIcon, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { auth } from '@/lib/firebase'
import { useAuth } from '@/hooks/useAuth'
import { Eyebrow, FieldLabel } from '@/components/Eyebrow'
import { STR } from '@/lib/strings'

const schema = z.object({
  email: z.string().min(1, STR.auth.emailRequired).email(STR.auth.emailInvalid),
  password: z.string().min(1, STR.auth.passwordRequired),
})
type FormValues = z.infer<typeof schema>

export default function Login() {
  const { user, loading } = useAuth()
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    getValues,
  } = useForm<FormValues>({
    defaultValues: { email: '', password: '' },
  })

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-fg-muted">
        Chargement…
      </div>
    )
  }
  if (user) return <Navigate to="/" replace />

  const onSubmit = async (values: FormValues) => {
    const parsed = schema.safeParse(values)
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? STR.auth.unknown)
      return
    }
    setSubmitting(true)
    try {
      await signInWithEmailAndPassword(auth, values.email, values.password)
    } catch (err) {
      const code = (err as AuthError).code
      if (
        code === 'auth/invalid-credential' ||
        code === 'auth/wrong-password' ||
        code === 'auth/user-not-found'
      ) {
        toast.error(STR.auth.invalid)
      } else {
        toast.error(STR.auth.unknown)
      }
    } finally {
      setSubmitting(false)
    }
  }

  const onReset = async () => {
    const email = getValues('email')
    const parsed = z.string().email().safeParse(email)
    if (!parsed.success) {
      toast.error(STR.auth.emailInvalid)
      return
    }
    try {
      await sendPasswordResetEmail(auth, email)
      toast.success(STR.auth.resetSent)
    } catch {
      toast.error(STR.auth.unknown)
    }
  }

  return (
    <div className="flex h-full flex-col justify-center bg-bg px-7">
      <div className="mb-9 text-center">
        <div
          className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent text-on-accent"
          style={{ boxShadow: 'var(--shadow-accent-fab)' }}
        >
          <CarIcon size={34} strokeWidth={1.8} />
        </div>
        <Eyebrow>Garage</Eyebrow>
        <div className="mt-1 text-[26px] font-semibold tracking-[-0.4px]">
          {STR.app.garageName}
        </div>
        <div className="mt-1.5 text-[13.5px] text-fg-muted">
          Connectez-vous pour continuer
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3.5">
        <div>
          <FieldLabel>Email</FieldLabel>
          <input
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="owner@garage.tn"
            {...register('email')}
            className="w-full rounded-xl border border-border bg-surface px-3.5 py-3 text-[14.5px] text-fg outline-none focus:border-accent"
          />
        </div>
        <div>
          <FieldLabel>Mot de passe</FieldLabel>
          <input
            type="password"
            autoComplete="current-password"
            {...register('password')}
            className="w-full rounded-xl border border-border bg-surface px-3.5 py-3 text-[14.5px] text-fg outline-none focus:border-accent"
          />
        </div>
        <div className="-mt-1 text-right">
          <button
            type="button"
            onClick={onReset}
            className="text-[13px] font-medium text-accent hover:underline"
          >
            {STR.auth.forgot}
          </button>
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="mt-3 flex w-full items-center justify-center rounded-xl bg-accent py-3.5 text-[15px] font-semibold text-on-accent transition-opacity disabled:opacity-60"
          style={{ boxShadow: 'var(--shadow-accent)' }}
        >
          {submitting ? <Loader2 size={18} className="animate-spin" /> : STR.auth.submit}
        </button>
      </form>

      <div className="mt-6 text-center text-[12px] text-fg-muted">
        3 comptes pré-enregistrés · pas d'inscription
      </div>
    </div>
  )
}
