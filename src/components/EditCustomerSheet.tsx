import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { FieldLabel } from '@/components/Eyebrow'
import { updateCustomer } from '@/lib/mutations'
import type { Customer } from '@/types'

const inputCls =
  'w-full rounded-[10px] border border-border bg-surface px-3 py-2.5 text-[14.5px] text-fg outline-none focus:border-accent'

export function EditCustomerSheet({
  open,
  onOpenChange,
  customer,
  phone,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  customer: Customer | null
  phone: string
}) {
  const [name, setName] = useState('')
  const [notes, setNotes] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (customer) {
      setName(customer.name ?? '')
      setNotes(customer.notes ?? '')
    }
  }, [customer])

  const submit = async () => {
    if (!customer) return
    setBusy(true)
    try {
      await updateCustomer(phone, {
        name: name.trim(),
        notes: notes.trim(),
      })
      onOpenChange(false)
    } catch (err) {
      console.error('updateCustomer', err)
      toast.error('Erreur de synchronisation')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent title="Modifier le client">
        <div className="px-6 pb-6 pt-2">
          <div className="mb-3.5">
            <FieldLabel>Nom</FieldLabel>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              dir="auto"
              className={inputCls}
            />
          </div>
          <div className="mb-3.5">
            <FieldLabel>Notes</FieldLabel>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              dir="auto"
              className={`${inputCls} min-h-[80px] resize-none`}
            />
          </div>
          <div className="mb-3.5">
            <FieldLabel>Téléphone</FieldLabel>
            <div className="rounded-[10px] border border-border bg-surface-alt px-3 py-2.5 font-mono text-[14.5px] text-fg-muted">
              {customer?.rawPhone || phone}
            </div>
            <p className="mt-1.5 text-[12px] text-fg-muted">
              Le numéro est l’identifiant du client et ne peut pas être modifié.
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
