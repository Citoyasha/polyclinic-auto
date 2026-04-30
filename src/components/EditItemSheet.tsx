import { useEffect, useState } from 'react'
import { Loader2, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { FieldLabel } from '@/components/Eyebrow'
import { deleteInventoryItem, updateInventoryItem } from '@/lib/mutations'
import { defaultUnitFor, type InventoryItem } from '@/types'

const inputCls =
  'w-full rounded-[10px] border border-border bg-surface px-3 py-2.5 text-[14.5px] text-fg outline-none focus:border-accent'

export function EditItemSheet({
  open,
  onOpenChange,
  item,
  itemId,
  onDeleted,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  item: InventoryItem | null
  itemId: string
  onDeleted: () => void
}) {
  const [name, setName] = useState('')
  const [unit, setUnit] = useState('')
  const [thresholdStr, setThresholdStr] = useState('')
  const [busy, setBusy] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  useEffect(() => {
    if (item) {
      setName(item.name ?? '')
      setUnit(item.unit ?? defaultUnitFor(item.type))
      setThresholdStr(String(item.lowStockThreshold ?? 0))
    }
    if (!open) setConfirmDelete(false)
  }, [item, open])

  const submit = async () => {
    if (!item) return
    const threshold = parseInt(thresholdStr || '0', 10) || 0
    const finalUnit = unit.trim() || defaultUnitFor(item.type)
    setBusy(true)
    try {
      await updateInventoryItem(itemId, {
        name: name.trim(),
        unit: finalUnit,
        lowStockThreshold: threshold,
      })
      onOpenChange(false)
    } catch (err) {
      console.error('updateInventoryItem', err)
      toast.error('Erreur de synchronisation')
    } finally {
      setBusy(false)
    }
  }

  const remove = async () => {
    setBusy(true)
    try {
      await deleteInventoryItem(itemId)
      onOpenChange(false)
      onDeleted()
    } catch (err) {
      console.error('deleteInventoryItem', err)
      toast.error('Erreur lors de la suppression')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent title="Modifier l’article">
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
          <div className="mb-3.5 grid grid-cols-[1fr_88px] gap-2.5">
            <div>
              <FieldLabel>Seuil bas</FieldLabel>
              <input
                type="number"
                inputMode="numeric"
                value={thresholdStr}
                onChange={(e) => setThresholdStr(e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <FieldLabel>Unité</FieldLabel>
              <input
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder={item ? defaultUnitFor(item.type) : ''}
                autoComplete="off"
                className={`${inputCls} text-center`}
              />
            </div>
          </div>
          <p className="mb-3.5 -mt-1.5 text-[12px] text-fg-muted">
            Une alerte « stock bas » s’affiche quand la quantité tombe à ce
            seuil ou en dessous.
          </p>

          {confirmDelete ? (
            <div className="mt-4 rounded-[10px] border border-border bg-surface-alt p-3.5">
              <div className="mb-2 text-[14px] font-semibold text-fg">
                Supprimer l’article ?
              </div>
              <div className="mb-3 text-[13px] text-fg-muted">
                L’article sera retiré du stock. L’historique des mouvements est
                conservé.
              </div>
              <div className="flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  disabled={busy}
                  className="flex-1 rounded-[10px] border border-border bg-surface px-3 py-2 text-[13.5px] font-semibold text-fg"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={remove}
                  disabled={busy}
                  className="flex flex-1 items-center justify-center rounded-[10px] bg-danger px-3 py-2 text-[13.5px] font-semibold text-white disabled:opacity-50"
                  style={{ background: 'var(--color-danger)' }}
                >
                  {busy ? <Loader2 size={15} className="animate-spin" /> : 'Supprimer'}
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-4 flex gap-2.5">
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                disabled={busy}
                aria-label="Supprimer"
                className="rounded-[10px] border border-border bg-transparent px-4 py-3 text-[14px] font-semibold text-danger disabled:opacity-50"
                style={{ color: 'var(--color-danger)' }}
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
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
