import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { FieldLabel } from '@/components/Eyebrow'
import { normalizePhone } from '@/lib/normalize'
import { createCustomer, lookupCustomerByPhone } from '@/lib/mutations'

const inputCls =
  'w-full rounded-[10px] border border-border bg-surface px-3.5 py-2.5 text-[14.5px] text-fg outline-none focus:border-accent'

export interface NewCustomerFormProps {
  onCancel: () => void
  onCreated: (phone: string) => void
}

export function NewCustomerForm({ onCancel, onCreated }: NewCustomerFormProps) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => {
      const el = document.getElementById('new-customer-name') as HTMLInputElement | null
      el?.focus()
    }, 50)
    return () => clearTimeout(t)
  }, [])

  const canSubmit = name.trim().length > 0 && phone.trim().length > 0 && !submitting

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const canonical = normalizePhone(phone)
    if (!canonical) {
      toast.error('Numéro invalide.')
      return
    }
    setSubmitting(true)
    try {
      const existing = await lookupCustomerByPhone(canonical)
      if (existing) {
        toast.error('Un client avec ce numéro existe déjà.')
        return
      }
      await createCustomer({
        phone: canonical,
        rawPhone: phone.trim(),
        name: name.trim(),
      })
      onCreated(canonical)
    } catch (err) {
      console.error('createCustomer', err)
      toast.error('Erreur lors de la création.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={submit} className="px-6 pb-6 pt-5">
      <div className="mb-3.5">
        <FieldLabel>Nom du client</FieldLabel>
        <input
          id="new-customer-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          dir="auto"
          autoComplete="off"
          placeholder="Mohamed Ben Ali"
          className={inputCls}
        />
      </div>

      <div className="mb-3.5">
        <FieldLabel>Téléphone</FieldLabel>
        <div className="flex items-center rounded-[10px] border border-border bg-surface focus-within:border-accent">
          <span className="py-2.5 pl-3 font-mono text-[14.5px] text-fg-muted">
            +216
          </span>
          <input
            type="tel"
            inputMode="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="22 481 902"
            autoComplete="off"
            className="flex-1 border-0 bg-transparent px-3 py-2.5 text-[14.5px] text-fg outline-none"
          />
        </div>
      </div>

      <div className="mt-4 flex gap-2.5">
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="flex-1 rounded-xl border border-border bg-surface px-4 py-3 text-[14.5px] font-semibold text-fg"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={!canSubmit}
          className="flex flex-1 items-center justify-center rounded-xl bg-accent px-4 py-3 text-[14.5px] font-semibold text-on-accent disabled:bg-border disabled:text-fg-muted"
        >
          {submitting ? <Loader2 size={16} className="animate-spin" /> : 'Créer le client'}
        </button>
      </div>
    </form>
  )
}
