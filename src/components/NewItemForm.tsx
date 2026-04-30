import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/useAuth'
import { FieldLabel } from '@/components/Eyebrow'
import { cn } from '@/lib/utils'
import { createInventoryItem } from '@/lib/mutations'
import { defaultUnitFor } from '@/types'

const inputCls =
  'w-full rounded-[10px] border border-border bg-surface px-3.5 py-2.5 text-[14.5px] text-fg outline-none focus:border-accent'

type ItemType = 'piece' | 'fluide'

export interface NewItemFormProps {
  onCancel: () => void
  onCreated: (itemId: string) => void
}

export function NewItemForm({ onCancel, onCreated }: NewItemFormProps) {
  const { user } = useAuth()
  const [name, setName] = useState('')
  const [type, setType] = useState<ItemType>('piece')
  const [unit, setUnit] = useState<string>(defaultUnitFor('piece'))
  const [unitDirty, setUnitDirty] = useState(false)
  const [stockStr, setStockStr] = useState('0')
  const [thresholdStr, setThresholdStr] = useState('5')
  const [submitting, setSubmitting] = useState(false)

  const onTypeChange = (t: ItemType) => {
    setType(t)
    if (!unitDirty) setUnit(defaultUnitFor(t))
  }

  const canSubmit = name.trim().length > 0 && !submitting

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    const initialStock = parseInt(stockStr || '0', 10) || 0
    const lowStockThreshold = parseInt(thresholdStr || '0', 10) || 0
    const finalUnit = unit.trim() || defaultUnitFor(type)
    setSubmitting(true)
    try {
      const id = await createInventoryItem(
        {
          name: name.trim(),
          type,
          unit: finalUnit,
          initialStock,
          lowStockThreshold,
        },
        user?.email ?? '',
      )
      onCreated(id)
    } catch (err) {
      console.error('createInventoryItem', err)
      toast.error('Erreur lors de la création.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={submit} className="px-6 pb-6 pt-5">
      <div className="mb-3.5">
        <FieldLabel>Nom</FieldLabel>
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          dir="auto"
          autoComplete="off"
          placeholder="Filtre à huile, Liquide de frein…"
          className={inputCls}
        />
      </div>

      <div className="mb-3.5">
        <FieldLabel>Type</FieldLabel>
        <div className="flex gap-2">
          {(['piece', 'fluide'] as ItemType[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => onTypeChange(t)}
              className={cn(
                'flex-1 rounded-[10px] border px-4 py-2.5 text-[14px] font-semibold transition-colors',
                type === t
                  ? 'border-accent bg-accent text-on-accent'
                  : 'border-border bg-surface text-fg',
              )}
            >
              {t === 'piece' ? 'Pièce' : 'Fluide'}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-3.5 grid grid-cols-[1fr_88px] gap-2.5">
        <div>
          <FieldLabel>Stock initial</FieldLabel>
          <input
            type="number"
            inputMode="numeric"
            value={stockStr}
            onChange={(e) => setStockStr(e.target.value)}
            className={inputCls}
          />
        </div>
        <div>
          <FieldLabel>Unité</FieldLabel>
          <input
            value={unit}
            onChange={(e) => {
              setUnit(e.target.value)
              setUnitDirty(true)
            }}
            placeholder={defaultUnitFor(type)}
            autoComplete="off"
            className={`${inputCls} text-center`}
          />
        </div>
      </div>

      <div className="mb-3.5">
        <FieldLabel>Seuil bas</FieldLabel>
        <input
          type="number"
          inputMode="numeric"
          value={thresholdStr}
          onChange={(e) => setThresholdStr(e.target.value)}
          className={inputCls}
        />
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
          {submitting ? <Loader2 size={16} className="animate-spin" /> : 'Créer l’article'}
        </button>
      </div>
    </form>
  )
}
