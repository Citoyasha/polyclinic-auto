import { useEffect, useState } from 'react'
import { Trash2, Loader2 } from 'lucide-react'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { FieldLabel } from '@/components/Eyebrow'
import type { TaskWithId } from '@/hooks/useTasks'

export interface TaskEditDraft {
  description: string
  notes: string
  price: number
}

const inputCls =
  'w-full rounded-[10px] border border-border bg-surface px-3 py-2.5 text-[14.5px] text-fg outline-none focus:border-accent'

export function TaskEditSheet({
  open,
  onOpenChange,
  task,
  onSave,
  onDelete,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  task: TaskWithId | null
  onSave: (draft: TaskEditDraft) => Promise<void>
  onDelete: () => Promise<void>
}) {
  const [description, setDescription] = useState('')
  const [notes, setNotes] = useState('')
  const [priceStr, setPriceStr] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (task) {
      setDescription(task.description ?? '')
      setNotes(task.notes ?? '')
      setPriceStr(task.price ? String(task.price) : '')
    }
  }, [task])

  const submit = async () => {
    if (!task) return
    const price = parseFloat(priceStr || '0')
    setBusy(true)
    try {
      await onSave({
        description: description.trim(),
        notes: notes.trim(),
        price: Number.isFinite(price) ? price : 0,
      })
      onOpenChange(false)
    } finally {
      setBusy(false)
    }
  }

  const remove = async () => {
    if (!task) return
    setBusy(true)
    try {
      await onDelete()
      onOpenChange(false)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent title="Modifier la tâche">
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
          <div className="mb-3.5">
            <FieldLabel>Notes</FieldLabel>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              dir="auto"
              className={`${inputCls} min-h-[60px] resize-none`}
            />
          </div>
          <div className="mb-3.5">
            <FieldLabel>Prix (TND)</FieldLabel>
            <input
              type="number"
              inputMode="decimal"
              value={priceStr}
              onChange={(e) => setPriceStr(e.target.value)}
              placeholder="0"
              className={inputCls}
            />
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
