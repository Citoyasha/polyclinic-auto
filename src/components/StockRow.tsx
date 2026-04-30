import { Box, Droplet } from 'lucide-react'
import { cn } from '@/lib/utils'
import { defaultUnitFor } from '@/types'
import type { InventoryItemWithId } from '@/hooks/useInventory'

export function StockRow({
  item,
  onClick,
}: {
  item: InventoryItemWithId
  onClick: () => void
}) {
  const isLow = item.currentStock <= item.lowStockThreshold
  const Icon = item.type === 'fluide' ? Droplet : Box
  const unit = item.unit?.trim() || defaultUnitFor(item.type)
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3.5 border-b border-border-soft px-5 py-3.5 text-left"
    >
      <span className="flex h-10 w-10 flex-none items-center justify-center rounded-[10px] bg-surface-alt text-fg-muted">
        <Icon size={20} strokeWidth={1.6} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[14.5px] font-medium text-fg" dir="auto">
          {item.name}
        </div>
        <div className="mt-1 flex items-center gap-2">
          <span className="text-[11.5px] font-medium uppercase tracking-[0.5px] text-fg-muted">
            {item.type === 'piece' ? 'Pièce' : 'Fluide'}
          </span>
          {isLow && (
            <span className="inline-flex items-center gap-1 rounded-full px-1.5 py-[2px] text-[10.5px] font-semibold uppercase tracking-[0.3px] text-status-diagnostic"
              style={{ background: 'rgba(217, 119, 6, 0.12)' }}
            >
              <span className="h-[5px] w-[5px] rounded-full bg-status-diagnostic" />
              Stock bas
            </span>
          )}
        </div>
      </div>
      <div className="text-right">
        <div
          className={cn(
            'font-mono text-[22px] font-semibold leading-none tracking-[-0.5px]',
            isLow ? 'text-status-diagnostic' : 'text-fg',
          )}
        >
          {item.currentStock}
        </div>
        <div className="mt-1 text-[11px] text-fg-muted">{unit}</div>
      </div>
    </button>
  )
}
