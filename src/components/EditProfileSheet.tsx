import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { updateProfile, type User } from 'firebase/auth'
import { toast } from 'sonner'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { FieldLabel } from '@/components/Eyebrow'
import { updateUserProfile } from '@/lib/mutations'

const inputCls =
  'w-full rounded-[10px] border border-border bg-surface px-3 py-2.5 text-[14.5px] text-fg outline-none focus:border-accent'

export function EditProfileSheet({
  open,
  onOpenChange,
  user,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  user: User | null
}) {
  const [displayName, setDisplayName] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (open && user) {
      setDisplayName(user.displayName ?? '')
    }
  }, [open, user])

  const submit = async () => {
    if (!user) return
    const name = displayName.trim()
    setBusy(true)
    try {
      await updateProfile(user, { displayName: name })
      await updateUserProfile(user.uid, name)
      toast.success('Nom enregistré')
      onOpenChange(false)
    } catch (err) {
      console.error('updateProfile', err)
      toast.error('Erreur lors de l’enregistrement')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent title="Mon profil">
        <div className="px-6 pb-6 pt-2">
          <div className="mb-3.5">
            <FieldLabel>Nom affiché</FieldLabel>
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              dir="auto"
              autoComplete="off"
              placeholder="Ex. Mohamed"
              className={inputCls}
            />
          </div>
          <div className="mb-3.5">
            <FieldLabel>Email</FieldLabel>
            <div className="rounded-[10px] border border-border bg-surface-alt px-3 py-2.5 text-[14.5px] text-fg-muted">
              {user?.email ?? '—'}
            </div>
            <p className="mt-1.5 text-[12px] text-fg-muted">
              L’email est l’identifiant du compte et ne peut pas être modifié.
            </p>
          </div>
          <div className="mt-4 flex gap-2.5">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              disabled={busy}
              className="flex-1 rounded-[10px] border border-border bg-surface px-4 py-3 text-[14px] font-semibold text-fg"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={submit}
              disabled={busy}
              className="flex flex-1 items-center justify-center rounded-[10px] bg-accent px-4 py-3 text-[14px] font-semibold text-on-accent disabled:opacity-50"
            >
              {busy ? <Loader2 size={16} className="animate-spin" /> : 'Enregistrer'}
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
