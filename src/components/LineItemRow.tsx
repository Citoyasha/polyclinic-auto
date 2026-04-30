import { Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { LineItemWithId } from '@/hooks/useLineItems'

export function LineItemRow({
  item,
  onTap,
  onDelete,
  isLast,
  disabled,
}: {
  item: LineItemWithId
  onTap: () => void
  onDelete: () => void
  isLast?: boolean
  disabled?: boolean
}) {
  const lineTotal = item.total ?? item.quantity * item.unitPrice
  return (
    <div
      className={cn(
        'flex items-start gap-3 px-3.5 py-3',
        !isLast && 'border-b border-border-soft',
      )}
    >
      <button
        type="button"
        onClick={onTap}
        disabled={disabled}
        className="flex min-w-0 flex-1 flex-col items-start text-left disabled:opacity-100"
      >
        <span className="text-[14.5px] leading-[1.4] text-fg" dir="auto">
          {item.description || (
            <span className="italic text-fg-muted">Sans description</span>
          )}
        </span>
        <span className="mt-[3px] font-mono text-[12.5px] text-fg-muted">
          {item.quantity} × {item.unitPrice}
        </span>
      </button>
      <span className="mt-0.5 flex-none whitespace-nowrap font-mono text-[14px] text-fg">
        {lineTotal} TND
      </span>
      <button
        type="button"
        onClick={onDelete}
        disabled={disabled}
        aria-label="Supprimer la ligne"
        className="-mt-0.5 flex-none p-1 text-fg-muted disabled:opacity-50"
      >
        <Trash2 size={16} strokeWidth={1.7} />
      </button>
    </div>
  )
}
