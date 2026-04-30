import { ChevronRight, Edit2, Trash2, User } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'

export type CarMenuAction =
  | 'edit-car'
  | 'edit-customer'
  | 'view-customer'
  | 'delete-car'

interface MenuItem {
  id: CarMenuAction
  label: string
  Icon: LucideIcon
  destructive?: boolean
}

const ITEMS: MenuItem[] = [
  { id: 'edit-car', label: 'Modifier la voiture', Icon: Edit2 },
  { id: 'edit-customer', label: 'Modifier le client', Icon: Edit2 },
  { id: 'view-customer', label: 'Voir le client', Icon: User },
  { id: 'delete-car', label: 'Supprimer la voiture', Icon: Trash2, destructive: true },
]

export function CarMenuSheet({
  open,
  onOpenChange,
  onSelect,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  onSelect: (action: CarMenuAction) => void
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent title="Voiture">
        <div className="py-2 pb-5">
          {ITEMS.map(({ id, label, Icon, destructive }) => (
            <button
              key={id}
              type="button"
              onClick={() => onSelect(id)}
              className={cn(
                'flex w-full items-center gap-3 px-6 py-3.5 text-left text-[15px] hover:bg-surface-alt',
                destructive ? 'text-danger' : 'text-fg',
              )}
            >
              <Icon size={18} strokeWidth={1.7} className="flex-none" />
              <span className="flex-1">{label}</span>
              <ChevronRight size={16} strokeWidth={1.7} className="flex-none text-fg-muted" />
            </button>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  )
}
