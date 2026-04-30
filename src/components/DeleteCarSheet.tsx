import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { deleteCar } from '@/lib/mutations'

export function DeleteCarSheet({
  open,
  onOpenChange,
  plate,
  onDeleted,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  plate: string
  onDeleted: () => void
}) {
  const [busy, setBusy] = useState(false)

  const confirm = async () => {
    setBusy(true)
    try {
      await deleteCar(plate)
      onOpenChange(false)
      onDeleted()
    } catch (err) {
      console.error('deleteCar', err)
      const msg = err instanceof Error ? err.message : 'Erreur de suppression'
      toast.error(msg)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <div className="px-6 pb-6 pt-4">
          <div className="mb-2 text-[18px] font-semibold text-fg">
            Supprimer cette voiture ?
          </div>
          <div className="mb-5 text-[14px] leading-[1.5] text-fg-muted">
            Toutes les visites, tâches, lignes et photos liées à cette voiture
            seront supprimées. Cette action est définitive.
          </div>
          <div className="flex gap-2.5">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              disabled={busy}
              className="flex-1 rounded-[12px] border border-border bg-surface px-4 py-3 text-[14.5px] font-semibold text-fg disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={confirm}
              disabled={busy}
              className="flex flex-1 items-center justify-center rounded-[12px] px-4 py-3 text-[14.5px] font-semibold text-white disabled:opacity-50"
              style={{ background: 'var(--color-danger)' }}
            >
              {busy ? <Loader2 size={16} className="animate-spin" /> : 'Supprimer'}
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
