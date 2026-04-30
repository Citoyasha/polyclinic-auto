import { Check } from 'lucide-react'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { STATUS_LABELS, type VisitStatus } from '@/types'
import { cn } from '@/lib/utils'

const ORDER: VisitStatus[] = [
  null,
  'diagnostic',
  'en_cours',
  'en_attente_pieces',
  'pret',
]

const DOT_BG: Record<NonNullable<VisitStatus>, string> = {
  diagnostic: 'bg-status-diagnostic',
  en_cours: 'bg-status-en-cours',
  en_attente_pieces: 'bg-status-en-attente-pieces',
  pret: 'bg-status-pret',
}

export function StatusEditSheet({
  open,
  onOpenChange,
  value,
  onSelect,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  value: VisitStatus
  onSelect: (status: VisitStatus) => void
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent title="Statut">
        <div className="py-2 pb-5">
          {ORDER.map((opt) => {
            const key = opt === null ? 'null' : opt
            const label = opt === null ? 'Aucun' : STATUS_LABELS[opt]
            const active = value === opt || (value == null && opt === null)
            return (
              <button
                key={key}
                type="button"
                onClick={() => {
                  onSelect(opt)
                  onOpenChange(false)
                }}
                className="flex w-full items-center gap-3 px-6 py-3.5 text-left text-[15.5px] text-fg hover:bg-surface-alt"
              >
                {opt ? (
                  <span
                    className={cn(
                      'h-2.5 w-2.5 flex-none rounded-full',
                      DOT_BG[opt],
                    )}
                  />
                ) : (
                  <span className="h-2.5 w-2.5 flex-none rounded-full border-[1.5px] border-fg-muted" />
                )}
                <span className="flex-1">{label}</span>
                {active && <Check size={18} className="text-accent" />}
              </button>
            )
          })}
        </div>
      </SheetContent>
    </Sheet>
  )
}
