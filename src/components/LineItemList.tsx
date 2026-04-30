import { useState } from 'react'
import { Loader2, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { LineItemRow } from '@/components/LineItemRow'
import { FieldLabel } from '@/components/Eyebrow'
import type { LineItemWithId } from '@/hooks/useLineItems'

export interface NewLineDraft {
  description: string
  quantity: number
  unitPrice: number
}

export function LineItemList({
  items,
  onAdd,
  onTap,
  onDelete,
  disabled,
}: {
  items: LineItemWithId[]
  onAdd: (draft: NewLineDraft) => Promise<void>
  onTap: (item: LineItemWithId) => void
  onDelete: (item: LineItemWithId) => void
  disabled?: boolean
}) {
  const [open, setOpen] = useState(false)
  const [desc, setDesc] = useState('')
  const [qty, setQty] = useState('1')
  const [unit, setUnit] = useState('')
  const [busy, setBusy] = useState(false)

  const reset = () => {
    setDesc('')
    setQty('1')
    setUnit('')
    setOpen(false)
  }

  const submit = async () => {
    const description = desc.trim()
    if (!description) {
      reset()
      return
    }
    const quantity = parseFloat(qty || '1') || 1
    const unitPrice = parseFloat(unit || '0') || 0
    setBusy(true)
    try {
      await onAdd({ description, quantity, unitPrice })
      reset()
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface">
      {items.map((it, i) => (
        <LineItemRow
          key={it.id}
          item={it}
          onTap={() => onTap(it)}
          onDelete={() => onDelete(it)}
          isLast={i === items.length - 1 && !open}
          disabled={disabled}
        />
      ))}

      {open ? (
        <div
          className={cn(
            'px-3.5 py-3',
            items.length > 0 && 'border-t border-border-soft',
          )}
        >
          <input
            autoFocus
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="Description"
            dir="auto"
            disabled={disabled || busy}
            className="mb-2 w-full border-0 bg-transparent text-[14.5px] text-fg outline-none placeholder:text-fg-muted"
          />
          <div className="flex items-end gap-2">
            <div className="w-16">
              <FieldLabel>Qté</FieldLabel>
              <input
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                type="number"
                inputMode="decimal"
                disabled={disabled || busy}
                className="w-full rounded-lg border border-border bg-bg px-2.5 py-1.5 text-[13px] text-fg outline-none focus:border-accent"
              />
            </div>
            <div className="flex-1">
              <FieldLabel>Prix unitaire (TND)</FieldLabel>
              <input
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                type="number"
                inputMode="decimal"
                disabled={disabled || busy}
                className="w-full rounded-lg border border-border bg-bg px-2.5 py-1.5 text-[13px] text-fg outline-none focus:border-accent"
              />
            </div>
            <button
              type="button"
              onClick={submit}
              disabled={disabled || busy}
              className="flex h-[30px] items-center gap-1.5 rounded-lg bg-accent px-3.5 text-[13px] font-semibold text-on-accent disabled:opacity-50"
            >
              {busy ? <Loader2 size={14} className="animate-spin" /> : 'OK'}
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          disabled={disabled}
          className={cn(
            'flex w-full items-center gap-2 px-3.5 py-3 text-left text-[14px] font-medium text-accent disabled:opacity-50',
            items.length > 0 && 'border-t border-border-soft',
          )}
        >
          <Plus size={16} strokeWidth={2} />
          Ajouter une ligne
        </button>
      )}
    </div>
  )
}
