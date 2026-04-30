import { ChevronRight } from 'lucide-react'
import { Avatar, deriveInitials } from '@/components/Avatar'
import type { CustomerWithId } from '@/hooks/useCustomers'

export function CustomerRow({
  customer,
  onClick,
}: {
  customer: CustomerWithId
  onClick: () => void
}) {
  const carCount = customer.carIds?.length ?? 0
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3.5 border-b border-border-soft px-5 py-3 text-left"
    >
      <Avatar initials={deriveInitials(customer.name, customer.phone)} size={40} />
      <div className="min-w-0 flex-1">
        <div
          className="truncate text-[15px] font-medium text-fg"
          dir="auto"
        >
          {customer.name || (
            <span className="italic text-fg-muted">Sans nom</span>
          )}
        </div>
        <div className="mt-0.5 truncate font-mono text-[13px] text-fg-muted">
          {customer.rawPhone || customer.phone}
        </div>
      </div>
      <span className="mr-1 whitespace-nowrap text-[12px] text-fg-muted">
        {carCount} {carCount > 1 ? 'voitures' : 'voiture'}
      </span>
      <ChevronRight size={16} strokeWidth={1.7} className="text-fg-muted" />
    </button>
  )
}
