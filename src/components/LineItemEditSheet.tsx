import { useEffect, useState } from 'react'
import { Loader2, Trash2 } from 'lucide-react'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { FieldLabel } from '@/components/Eyebrow'
import type { LineItemWithId } from '@/hooks/useLineItems'

export interface LineItemEditDraft {
  description: string
  quantity: number
  unitPrice: number
}

const inputCls =
  'w-full rounded-[10px] border border-border bg-surface px-3 py-2.5 text-[14.5px] text-fg outline-none focus:border-accent'

export function LineItemEditSheet({
  open,
  onOpenChange,
  item,
  onSave,
  onDelete,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  item: LineItemWithId | null
  onSave: (draft: LineItemEditDraft) => Promise<void>
  onDelete: () => Promise<void>
}) {
  const [description, setDescription] = useState('')
  const [qtyStr, setQtyStr] = useState('1')
  const [unitStr, setUnitStr] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (item) {
      setDescription(item.description ?? '')
      setQtyStr(String(item.quantity ?? 1))
      setUnitStr(item.unitPrice ? String(item.unitPrice) : '')
    }
  }, [item])

  const submit = async () => {
    if (!item) return
    const quantity = parseFloat(qtyStr || '1') || 1
    const unitPrice = parseFloat(unitStr || '0') || 0
    setBusy(true)
    try {
      await onSave({
        description: description.trim(),
        quantity,
        unitPrice,
      })
      onOpenChange(false)
    } finally {
      setBusy(false)
    }
  }

  const remove = async () => {
    if (!item) return
    setBusy(true)
    try {
      await onDelete()
      onOpenChange(false)
    } finally {
      setBusy(false)
    }
  }

  const livePreview = (() => {
    const q = parseFloat(qtyStr || '0') || 0
    const u = parseFloat(unitStr || '0') || 0
    return q * u
  })()

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent title="Modifier la ligne">
        <div className="px-6 pb-6 pt-2">
          <div className="mb-3.5">
            <FieldLabel>Description</FieldLabel>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              dir="auto"
              className={inputCls}
            />
          </div>
          <div className="mb-3.5 flex gap-2.5">
            <div className="w-24">
              <FieldLabel>Qté</FieldLabel>
              <input
                type="number"
                inputMode="decimal"
                value={qtyStr}
                onChange={(e) => setQtyStr(e.target.value)}
                className={inputCls}
              />
            </div>
            <div className="flex-1">
              <FieldLabel>Prix unitaire (TND)</FieldLabel>
              <input
                type="number"
                inputMode="decimal"
                value={unitStr}
                onChange={(e) => setUnitStr(e.target.value)}
                placeholder="0"
                className={inputCls}
              />
            </div>
          </div>
          <div className="mb-2 flex items-baseline justify-between text-[13px] text-fg-muted">
            <span>Total ligne</span>
            <span className="font-mono text-[15px] text-fg">{livePreview} TND</span>
          </div>
          <div className="mt-4 flex gap-2.5">
            <button
              type="button"
              onClick={remove}
              disabled={busy}
              className="rounded-[10px] border border-border bg-transparent px-4 py-3 text-[14px] font-semibold text-danger disabled:opacity-50"
              aria-label="Supprimer"
            >
              <Trash2 size={16} />
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
