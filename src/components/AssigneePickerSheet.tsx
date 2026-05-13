import { useState } from 'react'
import { Check, Loader2, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { createMechanic } from '@/lib/mutations'
import { useMechanics, type MechanicWithId } from '@/hooks/useMechanics'

export function AssigneePickerSheet({
  open,
  onOpenChange,
  currentMechanicId,
  onSelect,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  currentMechanicId: string | null
  onSelect: (mechanic: MechanicWithId | null) => void
}) {
  const { mechanics, loading } = useMechanics()
  const [addOpen, setAddOpen] = useState(false)
  const [draft, setDraft] = useState('')
  const [busy, setBusy] = useState(false)

  const submitDraft = async () => {
    const name = draft.trim()
    if (!name) {
      setDraft('')
      setAddOpen(false)
      return
    }
    setBusy(true)
    try {
      const id = await createMechanic(name)
      onSelect({
        id,
        name,
        // createdAt / updatedAt are filled by Firestore; not needed for picker selection
      } as MechanicWithId)
      setDraft('')
      setAddOpen(false)
      onOpenChange(false)
      toast.success(`${name} ajouté`)
    } catch (err) {
      console.error('createMechanic', err)
      toast.error('Erreur lors de l’ajout')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent title="Affecté à">
        <div className="py-2 pb-5">
          <button
            type="button"
            onClick={() => {
              onSelect(null)
              onOpenChange(false)
            }}
            className={cn(
              'flex w-full items-center gap-3 px-6 py-3 text-left text-[15px]',
              currentMechanicId === null ? 'text-fg' : 'text-fg',
            )}
          >
            <span
              className={cn(
                'flex h-2.5 w-2.5 flex-none rounded-full',
                currentMechanicId === null
                  ? 'border-[1.5px] border-fg-muted'
                  : 'border-[1.5px] border-fg-muted',
              )}
            />
            <span className="flex-1 text-fg-muted">Personne</span>
            {currentMechanicId === null && (
              <Check size={18} className="text-accent" />
            )}
          </button>

          {loading && mechanics.length === 0 && (
            <div className="flex items-center gap-2 px-6 py-3 text-[14px] text-fg-muted">
              <Loader2 size={14} className="animate-spin" />
              Chargement…
            </div>
          )}

          {mechanics.map((m) => {
            const active = m.id === currentMechanicId
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => {
                  onSelect(m)
                  onOpenChange(false)
                }}
                className="flex w-full items-center gap-3 px-6 py-3 text-left text-[15px] text-fg"
              >
                <Avatar name={m.name} />
                <span className="flex-1" dir="auto">
                  {m.name}
                </span>
                {active && <Check size={18} className="text-accent" />}
              </button>
            )
          })}

          {/* Add new mechanic */}
          {addOpen ? (
            <div className="flex items-center gap-2 border-t border-border-soft px-6 py-3">
              <input
                autoFocus
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') submitDraft()
                  if (e.key === 'Escape') {
                    setDraft('')
                    setAddOpen(false)
                  }
                }}
                disabled={busy}
                placeholder="Nom du mécanicien…"
                dir="auto"
                className="flex-1 border-0 bg-transparent text-[15px] text-fg outline-none placeholder:text-fg-muted"
              />
              <button
                type="button"
                onClick={submitDraft}
                disabled={busy}
                className="flex h-8 items-center justify-center rounded-lg bg-accent px-3 text-[13px] font-semibold text-on-accent disabled:opacity-50"
              >
                {busy ? <Loader2 size={14} className="animate-spin" /> : 'OK'}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setAddOpen(true)}
              className="mt-1 flex w-full items-center gap-3 border-t border-border-soft px-6 py-3 text-left text-[14.5px] font-medium text-accent"
            >
              <Plus size={18} strokeWidth={2} />
              Ajouter une personne
            </button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}

function Avatar({ name }: { name: string }) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s.charAt(0).toUpperCase())
    .join('')
  return (
    <span className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-surface-alt text-[11px] font-semibold text-fg">
      {initials || '?'}
    </span>
  )
}
